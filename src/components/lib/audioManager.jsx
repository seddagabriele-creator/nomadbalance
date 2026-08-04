// Global audio manager: sample-accurate gapless looping via Web Audio.
//
// HISTORY / WHY THIS DESIGN:
//   v1 decoded 30-minute MP3s into AudioBuffers → hundreds of MB → Chrome
//      renderer OOM ("Aw, Snap! error 5").
//   v2 streamed two <audio> elements and crossfaded at the loop seam.
//      That fixed memory but introduced new failure modes: the crossfade
//      depends on `timeupdate` events + setTimeout (throttled in background
//      tabs), the incoming element may not have buffered in time on slow
//      networks (audible gap), and crossfading phase-correlated material
//      (the 10 Hz binaural tracks) causes audible comb-filtering/wobble.
//
// v3 (this file): the tracks are now SHORT loop-ready files (~36 s, ~0.6 MB).
// Decoded, one track is ~14 MB of PCM — far below any memory concern. So we
// decode once and loop with AudioBufferSourceNode.loop = true:
//   • sample-accurate, truly gapless (handled by the audio thread, no JS)
//   • keeps playing in background tabs with zero JS involvement
//   • no timers, no crossfade, no seams — nothing to drift or misfire
//   • decoded buffers are cached per URL (LRU, max 2 ≈ 28 MB)
//
// If decoding is impossible (e.g. Safari can't decode Ogg Vorbis), we fall
// back to a single streaming <audio> element with native looping.

const FADE_IN_SEC = 1.5;   // play() fade-in
const FADE_OUT_SEC = 0.5;  // pause() fade-out
const TARGET_VOLUME = 0.7;
const BUFFER_CACHE_MAX = 2;

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentUrl = null;
    this._source = null;          // active AudioBufferSourceNode
    this._pausedAt = 0;           // offset (sec) into the loop when paused
    this._startedAt = 0;          // ctx.currentTime when the source started
    this._buffers = new Map();    // url → AudioBuffer (LRU)
    this._decoding = new Map();   // url → Promise<AudioBuffer|null>
    this._playToken = 0;          // invalidates stale async play() calls
    this._stopTimeout = null;
    // Streaming fallback (browsers that can't decode the file)
    this._fallbackEl = null;
    this._fallbackSource = null;
  }

  _ensureContext() {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0;
      this.masterGain.connect(this.audioContext.destination);
    }
  }

  async _getBuffer(url) {
    if (this._buffers.has(url)) {
      // refresh LRU position
      const buf = this._buffers.get(url);
      this._buffers.delete(url);
      this._buffers.set(url, buf);
      return buf;
    }
    if (this._decoding.has(url)) return this._decoding.get(url);

    const promise = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const encoded = await res.arrayBuffer();
        const buffer = await this.audioContext.decodeAudioData(encoded);
        this._buffers.set(url, buffer);
        while (this._buffers.size > BUFFER_CACHE_MAX) {
          const oldest = this._buffers.keys().next().value;
          this._buffers.delete(oldest);
        }
        return buffer;
      } catch (err) {
        console.warn("[AudioManager] decode failed, using streaming fallback:", err?.message);
        return null; // caller falls back to streaming <audio>
      } finally {
        this._decoding.delete(url);
      }
    })();
    this._decoding.set(url, promise);
    return promise;
  }

  _stopSource() {
    if (this._source) {
      try { this._source.stop(); } catch {}
      try { this._source.disconnect(); } catch {}
      this._source = null;
    }
    if (this._fallbackEl) {
      this._fallbackEl.pause();
    }
  }

  _rampMasterTo(value, seconds) {
    const now = this.audioContext.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(value, now + seconds);
  }

  async play(url) {
    try {
      if (this.currentUrl === url && this.isPlaying) return;
      const token = ++this._playToken;

      this._ensureContext();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      if (token !== this._playToken) return;

      const isNewTrack = this.currentUrl !== url;
      if (isNewTrack) {
        this._stopSource();
        this._teardownFallback();
        this._pausedAt = 0;
        this.currentUrl = url;
      }

      clearTimeout(this._stopTimeout);
      const buffer = await this._getBuffer(url);
      if (token !== this._playToken) return;

      if (buffer) {
        // ── Gapless path: looping AudioBufferSourceNode ──
        this._stopSource();
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(this.masterGain);
        const offset = this._pausedAt % buffer.duration;
        source.start(0, offset);
        this._source = source;
        this._startedAt = this.audioContext.currentTime - offset;
      } else {
        // ── Fallback: streaming element with native loop ──
        if (!this._fallbackEl || this._fallbackEl.dataset.url !== url) {
          this._teardownFallback();
          const el = new Audio();
          el.crossOrigin = "anonymous";
          el.loop = true;
          el.preload = "auto";
          el.src = url;
          el.dataset.url = url;
          const source = this.audioContext.createMediaElementSource(el);
          source.connect(this.masterGain);
          this._fallbackEl = el;
          this._fallbackSource = source;
        }
        await this._fallbackEl.play();
        if (token !== this._playToken) return;
      }

      this._rampMasterTo(TARGET_VOLUME, FADE_IN_SEC);
      this.isPlaying = true;
    } catch (err) {
      if (err?.name !== "NotAllowedError") {
        console.error("[AudioManager] play error:", err);
      }
    }
  }

  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this._playToken++; // cancel any in-flight play()

    this._rampMasterTo(0, FADE_OUT_SEC);

    // Remember position so resume continues where we left off
    if (this._source && this._source.buffer) {
      const elapsed = this.audioContext.currentTime - this._startedAt;
      this._pausedAt = elapsed % this._source.buffer.duration;
    }

    clearTimeout(this._stopTimeout);
    this._stopTimeout = setTimeout(() => {
      this._stopSource();
    }, (FADE_OUT_SEC + 0.05) * 1000);
  }

  stop() {
    this.pause();
  }

  _teardownFallback() {
    if (this._fallbackEl) {
      this._fallbackEl.pause();
      try { this._fallbackSource.disconnect(); } catch {}
      this._fallbackEl.src = "";
      try { this._fallbackEl.load(); } catch {}
      this._fallbackEl = null;
      this._fallbackSource = null;
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioManager = new AudioManager();
