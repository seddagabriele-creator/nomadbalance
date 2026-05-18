// Gapless audio looping via dual <audio> elements with crossfade.
// When one element approaches the end of the track, a second element
// starts from the beginning with a 3-second crossfade — no audible
// gap, no heavy buffer decoding, low memory (~2-5 MB streaming).

const CROSSFADE_SEC = 3;
const FADE_IN_SEC = 1.5;
const FADE_OUT_SEC = 0.5;

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.slots = [null, null]; // { el, source, gain }
    this.activeSlot = 0;
    this.isPlaying = false;
    this.currentUrl = null;
    this._fadeTimeout = null;
    this._crossfadeTimeout = null;
    this._timeUpdateHandler = null;
  }

  _ensureContext() {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.audioContext.destination);
    }
  }

  _createSlot(url) {
    const el = new Audio();
    el.crossOrigin = "anonymous";
    el.preload = "auto";
    el.src = url;

    this._ensureContext();
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
        this._stopImmediate();
      }

      this._ensureContext();

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      if (!this.slots[0] || this.currentUrl !== url) {
        this.slots[0] = this._createSlot(url);
        this.slots[1] = this._createSlot(url);
        this.currentUrl = url;
      }

      // Fade in on slot 0
      const slot = this.slots[0];
      this.activeSlot = 0;

      const now = this.audioContext.currentTime;
      slot.gain.gain.cancelScheduledValues(now);
      slot.gain.gain.setValueAtTime(0, now);
      slot.gain.gain.linearRampToValueAtTime(0.7, now + FADE_IN_SEC);

      slot.el.currentTime = 0;
      await slot.el.play();
      this.isPlaying = true;

      this._scheduleCrossfade(0);
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        console.error("[AudioManager] play error:", err);
      }
    }
  }

  _scheduleCrossfade(slotIdx) {
    const slot = this.slots[slotIdx];
    if (!slot) return;

    // Clear previous scheduling
    if (this._timeUpdateHandler) {
      this.slots[0]?.el.removeEventListener("timeupdate", this._timeUpdateHandler);
      this.slots[1]?.el.removeEventListener("timeupdate", this._timeUpdateHandler);
    }
    clearTimeout(this._crossfadeTimeout);

    const trySchedule = () => {
      const el = slot.el;
      if (!el.duration || !isFinite(el.duration)) return false;

      const crossfadeAt = el.duration - CROSSFADE_SEC;
      if (crossfadeAt <= 0) {
        // Track too short for crossfade — just loop natively
        el.loop = true;
        return true;
      }

      // Use timeupdate to detect when to crossfade
      this._timeUpdateHandler = () => {
        if (el.currentTime >= crossfadeAt && this.isPlaying) {
          el.removeEventListener("timeupdate", this._timeUpdateHandler);
          this._doCrossfade(slotIdx);
        }
      };
      el.addEventListener("timeupdate", this._timeUpdateHandler);

      // Backup timeout in case timeupdate is throttled in background
      const msUntilCrossfade = (crossfadeAt - el.currentTime) * 1000;
      if (msUntilCrossfade > 0) {
        this._crossfadeTimeout = setTimeout(() => {
          if (this.isPlaying) {
            el.removeEventListener("timeupdate", this._timeUpdateHandler);
            this._doCrossfade(slotIdx);
          }
        }, msUntilCrossfade);
      }

      return true;
    };

    if (!trySchedule()) {
      slot.el.addEventListener("loadedmetadata", () => trySchedule(), { once: true });
    }
  }

  _doCrossfade(fromIdx) {
    if (!this.isPlaying) return;
    const toIdx = fromIdx === 0 ? 1 : 0;
    const fromSlot = this.slots[fromIdx];
    const toSlot = this.slots[toIdx];
    if (!fromSlot || !toSlot) return;

    const now = this.audioContext.currentTime;

    // Fade out current
    fromSlot.gain.gain.cancelScheduledValues(now);
    fromSlot.gain.gain.setValueAtTime(fromSlot.gain.gain.value, now);
    fromSlot.gain.gain.linearRampToValueAtTime(0, now + CROSSFADE_SEC);

    // Start next from beginning with fade in
    toSlot.el.currentTime = 0;
    toSlot.gain.gain.cancelScheduledValues(now);
    toSlot.gain.gain.setValueAtTime(0, now);
    toSlot.gain.gain.linearRampToValueAtTime(0.7, now + CROSSFADE_SEC);

    toSlot.el.play().catch(() => {});

    // Pause the old element after crossfade completes
    setTimeout(() => {
      if (fromSlot.el && !fromSlot.el.paused) {
        fromSlot.el.pause();
      }
    }, CROSSFADE_SEC * 1000 + 200);

    this.activeSlot = toIdx;
    this._scheduleCrossfade(toIdx);
  }

  pause() {
    if (!this.isPlaying) return;

    clearTimeout(this._crossfadeTimeout);
    clearTimeout(this._fadeTimeout);

    const slot = this.slots[this.activeSlot];
    if (slot && this.audioContext) {
      const now = this.audioContext.currentTime;
      slot.gain.gain.cancelScheduledValues(now);
      slot.gain.gain.setValueAtTime(slot.gain.gain.value, now);
      slot.gain.gain.linearRampToValueAtTime(0, now + FADE_OUT_SEC);

      this._fadeTimeout = setTimeout(() => {
        this.slots.forEach(s => { if (s?.el) s.el.pause(); });
      }, FADE_OUT_SEC * 1000 + 50);
    } else {
      this.slots.forEach(s => { if (s?.el) s.el.pause(); });
    }

    this.isPlaying = false;
  }

  stop() {
    this.pause();
  }

  _stopImmediate() {
    clearTimeout(this._fadeTimeout);
    clearTimeout(this._crossfadeTimeout);
    if (this._timeUpdateHandler) {
      this.slots.forEach(s => s?.el?.removeEventListener("timeupdate", this._timeUpdateHandler));
    }
    this.slots.forEach((s, i) => {
      if (s) {
        s.el.pause();
        try { s.source.disconnect(); } catch {}
        try { s.gain.disconnect(); } catch {}
        s.el.src = "";
        s.el.load();
        this.slots[i] = null;
      }
    });
    this.isPlaying = false;
    this.currentUrl = null;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioManager = new AudioManager();
