// Global audio manager with Web Audio API.
// Designed to be lightweight in background tabs: the AudioContext is
// suspended on tab hide and resumed on tab show. Decoded buffers are
// released on suspend to free ~38 MB of PCM data per track.
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.audioBuffer = null;
    this.source = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.currentUrl = null;
    this.loadRetries = 0;
    this.maxRetries = 2;
    this._pendingUrl = null;
  }

  async play(url) {
    // Never attempt audio work while the tab is hidden — Chrome throttles
    // background JS and may kill the renderer if we trigger heavy decoding.
    if (typeof document !== "undefined" && document.hidden) {
      this._pendingUrl = url;
      return;
    }
    try {
      if (this.currentUrl !== url || !this.audioBuffer) {
        await this.loadAudio(url);
      }

      if (!this.isPlaying && this.audioBuffer) {
        await this.startPlayback();
      }
    } catch (err) {
      console.error("[AudioManager] play error:", err);
    }
  }

  async loadAudio(url) {
    try {
      this.stop();

      if (!this.audioContext || this.audioContext.state === "closed") {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.7;
        this.gainNode.connect(this.audioContext.destination);
      }

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Audio fetch failed: ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const rawBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffer = this._crossfade(rawBuffer);
      this.currentUrl = url;
      this.loadRetries = 0;
    } catch (err) {
      console.error("Audio load failed:", err);
      this.loadRetries++;
      if (this.loadRetries <= this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * this.loadRetries));
        return this.loadAudio(url);
      }
      this.loadRetries = 0;
    }
  }

  // Crossfade: blend the tail of the track into the head so loop=true
  // produces a seamless loop. Uses 5 seconds with equal-power curves
  // (sin/cos) to maintain perceived volume through the blend — long
  // enough for ambient ocean/wind cycles (~5-10 s), fast enough to
  // compute in <10 ms (~440 K iterations vs the old 16 M).
  _crossfade(buffer) {
    const FADE_SEC = 5;
    const sampleRate = buffer.sampleRate;
    const channels = buffer.numberOfChannels;
    const len = buffer.length;
    const fadeSamples = Math.min(Math.floor(sampleRate * FADE_SEC), Math.floor(len / 3));
    if (fadeSamples < 64) return buffer;

    const newLen = len - fadeSamples;
    const out = this.audioContext.createBuffer(channels, newLen, sampleRate);
    const halfPi = Math.PI / 2;

    for (let ch = 0; ch < channels; ch++) {
      const src = buffer.getChannelData(ch);
      const dst = out.getChannelData(ch);

      for (let i = 0; i < fadeSamples; i++) {
        const t = i / fadeSamples;
        dst[i] = src[i] * Math.sin(t * halfPi) + src[newLen + i] * Math.cos(t * halfPi);
      }
      for (let i = fadeSamples; i < newLen; i++) {
        dst[i] = src[i];
      }
    }
    return out;
  }

  async startPlayback() {
    if (!this.audioBuffer || !this.audioContext) return;

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(0.7, now + 1.5);

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.loop = true;
    this.source.connect(this.gainNode);
    this.source.start(0);
    this.isPlaying = true;
  }

  pause() {
    if (this.source && this.isPlaying) {
      try {
        const now = this.audioContext.currentTime;
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        const src = this.source;
        setTimeout(() => {
          try { src.stop(); } catch {}
          try { src.disconnect(); } catch {}
        }, 550);
      } catch {
        try { this.source.stop(); } catch {}
        try { this.source.disconnect(); } catch {}
      }
      this.source = null;
      this.isPlaying = false;
    }
  }

  stop() {
    this.pause();
  }

  // Called when the tab goes hidden. Suspends the AudioContext (tells
  // Chrome we don't need the audio thread) and releases the decoded
  // buffer so ~38 MB of PCM data can be reclaimed.
  suspend() {
    this.pause();
    this.audioBuffer = null;
    if (this.audioContext && this.audioContext.state === "running") {
      this.audioContext.suspend().catch(() => {});
    }
  }

  // Called when the tab becomes visible. If audio was playing before
  // suspend, the caller should call play(url) again — loadAudio will
  // re-fetch and re-decode (fast, since the file is cached by the
  // browser's HTTP cache).
  async unsuspend() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume().catch(() => {});
    }
    if (this._pendingUrl) {
      const url = this._pendingUrl;
      this._pendingUrl = null;
      await this.play(url);
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioManager = new AudioManager();
