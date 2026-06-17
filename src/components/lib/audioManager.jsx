// Global audio manager: gapless looping via dual-element crossfade.
//
// Two streaming <audio> elements of the same track alternate: as the
// active one nears the end, the other starts from 0 and they crossfade
// via smooth linearRamps on per-voice GainNodes. There is never a moment
// of silence, and for ambient noise the blend is inaudible.
// Memory stays at streaming levels (~2-5 MB per element).

const FADE_IN_SEC = 1.5;
const FADE_OUT_SEC = 0.5;
const XFADE_SEC = 3;
const TARGET_VOLUME = 0.7;

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.voices = [];
    this.activeIndex = 0;
    this.isPlaying = false;
    this.currentUrl = null;
    this._fadeTimeout = null;
    this._cleanupTimeout = null;
    this._crossfading = false;
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
    this._onEnded = this._onEnded.bind(this);
  }

  _ensureContext() {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0;
      this.masterGain.connect(this.audioContext.destination);
    }
  }

  _makeVoice(url) {
    const el = new Audio();
    el.crossOrigin = "anonymous";
    el.loop = false;
    el.preload = "auto";
    el.src = url;
    const source = this.audioContext.createMediaElementSource(el);
    const gain = this.audioContext.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(this.masterGain);
    return { el, source, gain };
  }

  // Smoothly ramp a GainNode from its current value to `target` over `dur`
  // seconds. Never jumps — always starts from wherever the gain currently is.
  _ramp(gainNode, target, dur) {
    const now = this.audioContext.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(target, now + dur);
  }

  async play(url) {
    try {
      if (this.currentUrl === url && this.isPlaying) return;

      if (this.currentUrl !== url) {
        this._teardownVoices();
        this.currentUrl = url;
      }

      this._ensureContext();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      if (this.voices.length === 0) {
        this.voices = [this._makeVoice(url), this._makeVoice(url)];
        this.activeIndex = 0;
        this.voices[0].gain.gain.value = 1;
        this.voices[0].el.addEventListener("timeupdate", this._onTimeUpdate);
        this.voices[0].el.addEventListener("ended", this._onEnded);
        await this.voices[0].el.play();
      } else {
        await this.voices[this.activeIndex].el.play();
      }

      clearTimeout(this._fadeTimeout);
      this._ramp(this.masterGain, TARGET_VOLUME, FADE_IN_SEC);
      this.isPlaying = true;
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        console.error("[AudioManager] play error:", err);
      }
    }
  }

  _onTimeUpdate(e) {
    if (this._crossfading || !this.isPlaying) return;
    const active = this.voices[this.activeIndex];
    if (!active || e.target !== active.el) return;
    const remaining = active.el.duration - active.el.currentTime;
    if (isFinite(remaining) && remaining <= XFADE_SEC + 0.5) {
      this._startCrossfade();
    }
  }

  _onEnded(e) {
    if (!this.isPlaying) return;
    const active = this.voices[this.activeIndex];
    if (!active || e.target !== active.el || this._crossfading) return;
    this._startCrossfade();
  }

  async _startCrossfade() {
    if (this._crossfading) return;
    this._crossfading = true;

    const current = this.voices[this.activeIndex];
    const nextIndex = this.activeIndex === 0 ? 1 : 0;
    const next = this.voices[nextIndex];

    current.el.removeEventListener("timeupdate", this._onTimeUpdate);
    current.el.removeEventListener("ended", this._onEnded);
    next.el.addEventListener("timeupdate", this._onTimeUpdate);
    next.el.addEventListener("ended", this._onEnded);

    try { next.el.currentTime = 0; } catch {}

    this._ramp(current.gain, 0, XFADE_SEC);
    this._ramp(next.gain, 1, XFADE_SEC);

    try { await next.el.play(); } catch {}

    this.activeIndex = nextIndex;

    clearTimeout(this._cleanupTimeout);
    this._cleanupTimeout = setTimeout(() => {
      current.el.pause();
      try { current.el.currentTime = 0; } catch {}
      current.gain.gain.cancelScheduledValues(this.audioContext.currentTime);
      current.gain.gain.value = 0;
      this._crossfading = false;
    }, (XFADE_SEC + 0.3) * 1000);
  }

  pause() {
    if (!this.isPlaying) return;

    clearTimeout(this._fadeTimeout);
    this._ramp(this.masterGain, 0, FADE_OUT_SEC);

    this._fadeTimeout = setTimeout(() => {
      clearTimeout(this._cleanupTimeout);
      this._crossfading = false;
      this.voices.forEach((v, i) => {
        v.gain.gain.cancelScheduledValues(this.audioContext.currentTime);
        v.el.pause();
        if (i === this.activeIndex) {
          v.gain.gain.value = 1;
        } else {
          try { v.el.currentTime = 0; } catch {}
          v.gain.gain.value = 0;
        }
      });
    }, (FADE_OUT_SEC + 0.05) * 1000);

    this.isPlaying = false;
  }

  stop() {
    this.pause();
  }

  _teardownVoices() {
    clearTimeout(this._fadeTimeout);
    clearTimeout(this._cleanupTimeout);
    this._crossfading = false;
    for (const v of this.voices) {
      v.el.removeEventListener("timeupdate", this._onTimeUpdate);
      v.el.removeEventListener("ended", this._onEnded);
      try { v.source.disconnect(); } catch {}
      try { v.gain.disconnect(); } catch {}
      v.el.pause();
      v.el.src = "";
      v.el.load();
    }
    this.voices = [];
    this.activeIndex = 0;
    this.isPlaying = false;
    this.currentUrl = null;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioManager = new AudioManager();
