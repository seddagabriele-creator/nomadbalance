// Global audio manager using HTML5 <audio> element for streaming playback.
// Instead of decoding the entire MP3 into a ~38 MB PCM AudioBuffer, we let
// the browser stream and decode on-the-fly — memory usage drops to ~2-5 MB.
// We still use Web Audio API (MediaElementSourceNode → GainNode) for smooth
// fade-in / fade-out volume control.

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

      // If switching tracks, stop the old one first
      if (this.currentUrl !== url) {
        this._stopImmediate();
      }

      this._ensureContext();

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      if (!this.audioEl || this.currentUrl !== url) {
        // Create a new <audio> element for the track
        if (this.audioEl) {
          this._disconnectAudioEl();
        }

        this.audioEl = new Audio();
        this.audioEl.crossOrigin = "anonymous";
        this.audioEl.loop = true;
        this.audioEl.preload = "auto";
        this.audioEl.src = url;

        // Connect through Web Audio for gain control
        this.sourceNode = this.audioContext.createMediaElementSource(this.audioEl);
        this.sourceNode.connect(this.gainNode);
        this.currentUrl = url;
      }

      // Fade in
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

      // Pause the element after fade-out completes
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
