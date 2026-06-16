// Global audio manager: gapless looping via dual-element crossfade.
//
// THE TWO CONSTRAINTS THIS BALANCES:
//   1. Memory — decoding a full long ambient MP3 into a PCM AudioBuffer
//      allocates hundreds of MB (30 min stereo ≈ 635 MB) and crashed
//      Chrome's renderer ("Aw, Snap! error 5", SBOX_FATAL_MEMORY_EXCEEDED).
//      So we STREAM via HTML5 <audio> — the browser keeps only a small
//      rolling decode window (~2-5 MB per element).
//   2. Seamless loop — the <audio> element's native `loop` flag has an
//      audible gap/click at the seam. Unacceptable for continuous ambient.
//
// SOLUTION: two streaming <audio> elements ("voices") of the same track.
// One plays; as it nears the end we start the other from 0 and equal-power
// crossfade between them over a few seconds. There is never a moment of
// silence, and for uncorrelated ambient noise the crossfade is inaudible.
// Memory stays at streaming levels (two small decode windows).

const FADE_IN_SEC = 1.5;       // play() fade-in
const FADE_OUT_SEC = 0.5;      // pause() fade-out
const LOOP_CROSSFADE_SEC = 4;  // overlap at the loop seam
const TARGET_VOLUME = 0.7;
const CURVE_STEPS = 64;

// Equal-power crossfade curves: sin²+cos² = 1 keeps perceived loudness
// constant across the blend (linear gain would dip ~6 dB at the midpoint).
function buildCurves() {
  const fadeIn = new Float32Array(CURVE_STEPS);
  const fadeOut = new Float32Array(CURVE_STEPS);
  for (let i = 0; i < CURVE_STEPS; i++) {
    const t = (i / (CURVE_STEPS - 1)) * (Math.PI / 2);
    fadeIn[i] = Math.sin(t);
    fadeOut[i] = Math.cos(t);
  }
  return { fadeIn, fadeOut };
}

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.voices = [];        // [{ el, source, gain }]
    this.activeIndex = 0;
    this.isPlaying = false;
    this.currentUrl = null;
    this._fadeTimeout = null;
    this._crossfadeCleanup = null;
    this._crossfading = false;
    this._curves = buildCurves();
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
    el.loop = false; // looping is handled manually via crossfade
    el.preload = "auto";
    el.src = url;
    const source = this.audioContext.createMediaElementSource(el);
    const gain = this.audioContext.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(this.masterGain);
    return { el, source, gain };
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
        // First start for this track: build both voices, play voice 0
        this.voices = [this._makeVoice(url), this._makeVoice(url)];
        this.activeIndex = 0;
        const active = this.voices[0];
        active.gain.gain.value = 1;
        active.el.addEventListener("timeupdate", this._onTimeUpdate);
        active.el.addEventListener("ended", this._onEnded);
        await active.el.play();
      } else {
        // Resume after pause
        await this.voices[this.activeIndex].el.play();
      }

      clearTimeout(this._fadeTimeout);
      const now = this.audioContext.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(TARGET_VOLUME, now + FADE_IN_SEC);

      this.isPlaying = true;
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        console.error("[AudioManager] play error:", err);
      }
    }
  }

  // Fires ~4x/sec on the active voice; triggers the crossfade near the end.
  _onTimeUpdate(e) {
    if (this._crossfading || !this.isPlaying) return;
    const active = this.voices[this.activeIndex];
    if (!active || e.target !== active.el) return;
    const dur = active.el.duration;
    if (!isFinite(dur) || dur <= 0) return;
    if (dur - active.el.currentTime <= LOOP_CROSSFADE_SEC) {
      this._startCrossfade();
    }
  }

  // Safety net: if the active voice somehow reaches the end before the
  // crossfade fired, swap instantly so there's still no silence.
  _onEnded(e) {
    if (!this.isPlaying) return;
    const active = this.voices[this.activeIndex];
    if (!active || e.target !== active.el || this._crossfading) return;
    this._startCrossfade();
  }

  async _startCrossfade() {
    if (this._crossfading) return;
    this._crossfading = true;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const current = this.voices[this.activeIndex];
    const nextIndex = this.activeIndex === 0 ? 1 : 0;
    const next = this.voices[nextIndex];

    const dur = current.el.duration;
    const fade = isFinite(dur) ? Math.min(LOOP_CROSSFADE_SEC, dur / 3) : LOOP_CROSSFADE_SEC;

    // Hand the monitor over to the incoming voice
    current.el.removeEventListener("timeupdate", this._onTimeUpdate);
    current.el.removeEventListener("ended", this._onEnded);
    next.el.addEventListener("timeupdate", this._onTimeUpdate);
    next.el.addEventListener("ended", this._onEnded);

    try { next.el.currentTime = 0; } catch {}

    // Equal-power crossfade on the per-voice gains
    current.gain.gain.cancelScheduledValues(now);
    current.gain.gain.setValueCurveAtTime(this._curves.fadeOut, now, fade);
    next.gain.gain.cancelScheduledValues(now);
    next.gain.gain.setValueCurveAtTime(this._curves.fadeIn, now, fade);

    try {
      await next.el.play();
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        console.error("[AudioManager] crossfade play error:", err);
      }
    }

    this.activeIndex = nextIndex;

    // After the blend, reset the old voice so it's ready for the next loop
    clearTimeout(this._crossfadeCleanup);
    this._crossfadeCleanup = setTimeout(() => {
      current.el.pause();
      try { current.el.currentTime = 0; } catch {}
      current.gain.gain.cancelScheduledValues(this.audioContext.currentTime);
      current.gain.gain.value = 0;
      this._crossfading = false;
    }, (fade + 0.2) * 1000);
  }

  pause() {
    if (!this.isPlaying) return;

    clearTimeout(this._fadeTimeout);
    const now = this.audioContext.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + FADE_OUT_SEC);

    this._fadeTimeout = setTimeout(() => {
      // Collapse to a clean single-voice state so resume is seamless,
      // even if we paused mid-crossfade.
      clearTimeout(this._crossfadeCleanup);
      this._crossfading = false;
      const t = this.audioContext.currentTime;
      this.voices.forEach((v, i) => {
        v.gain.gain.cancelScheduledValues(t);
        if (i === this.activeIndex) {
          v.el.pause();
          v.gain.gain.value = 1;
        } else {
          v.el.pause();
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
    clearTimeout(this._crossfadeCleanup);
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
