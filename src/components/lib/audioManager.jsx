// Global audio manager using HTML5 <audio> element for streaming playback.
//
// WHY STREAMING: the previous implementation fetched the entire MP3 and
// decoded it into a PCM AudioBuffer. For long ambient tracks this allocates
// hundreds of MB (30 min stereo = ~635 MB), and the loop-crossfade step
// allocated a second copy on top. That is what caused Chrome's renderer to
// die with "Aw, Snap! error code 5" (SBOX_FATAL_MEMORY_EXCEEDED).
// With <audio> streaming the browser keeps only a small rolling decode
// window in memory (~2-5 MB) regardless of track length.
//
// We still route through Web Audio (MediaElementSourceNode → GainNode) for
// smooth fade-in/fade-out. Looping uses the element's native `loop` flag —
// for ambient wind/ocean tracks the loop seam is inaudible, and it costs
// zero extra memory.

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.sourceNode = null;
    this.audioEl = null;
    this.isPlaying = false;
    this.currentUrl = null;
    this._fadeTimeout = null;
  }

  _ensureContext() {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0;
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  async play(url) {
    try {
      if (this.currentUrl === url && this.isPlaying) return;

      if (this.currentUrl !== url) {
        this._stopImmediate();
      }

      this._ensureContext();

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      if (!this.audioEl || this.currentUrl !== url) {
        if (this.audioEl) {
          this._disconnectAudioEl();
        }

        this.audioEl = new Audio();
        this.audioEl.crossOrigin = "anonymous";
        this.audioEl.loop = true;
        this.audioEl.preload = "auto";
        this.audioEl.src = url;

        this.sourceNode = this.audioContext.createMediaElementSource(this.audioEl);
        this.sourceNode.connect(this.gainNode);
        this.currentUrl = url;
      }

      clearTimeout(this._fadeTimeout);

      const now = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(0.7, now + 1.5);

      await this.audioEl.play();
      this.isPlaying = true;
    } catch (err) {
      // Autoplay blocked or network error — fail silently, user can retry
      if (err.name !== "NotAllowedError") {
        console.error("[AudioManager] play error:", err);
      }
    }
  }

  pause() {
    if (!this.isPlaying || !this.audioEl) return;

    clearTimeout(this._fadeTimeout);

    if (this.audioContext && this.gainNode) {
      const now = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

      this._fadeTimeout = setTimeout(() => {
        if (this.audioEl) {
          this.audioEl.pause();
        }
      }, 550);
    } else {
      this.audioEl.pause();
    }

    this.isPlaying = false;
  }

  stop() {
    this.pause();
  }

  _stopImmediate() {
    clearTimeout(this._fadeTimeout);
    if (this.audioEl) {
      this.audioEl.pause();
      this._disconnectAudioEl();
    }
    this.isPlaying = false;
    this.currentUrl = null;
  }

  _disconnectAudioEl() {
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch {}
      this.sourceNode = null;
    }
    if (this.audioEl) {
      this.audioEl.src = "";
      this.audioEl.load();
      this.audioEl = null;
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioManager = new AudioManager();
