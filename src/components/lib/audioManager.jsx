// Global audio manager with Web Audio API and crossfade for seamless looping
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
    this.crossfadeDuration = 2; // seconds of crossfade at loop boundary
  }

  async play(url) {
    if (this.currentUrl !== url || !this.audioBuffer) {
      await this.loadAudio(url);
    }

    if (!this.isPlaying && this.audioBuffer) {
      this.startPlayback();
    }
  }

  async loadAudio(url) {
    try {
      this.stop();

      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.7;
        this.gainNode.connect(this.audioContext.destination);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Audio fetch failed: ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const rawBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      // Build a crossfaded buffer so loop = true has zero gap
      this.audioBuffer = this.createCrossfadeBuffer(rawBuffer);
      this.currentUrl = url;
      this.loadRetries = 0;
    } catch (err) {
      console.error("Audio load failed:", err);
      this.loadRetries++;
      if (this.loadRetries <= this.maxRetries) {
        console.warn(`Retrying audio load (attempt ${this.loadRetries}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * this.loadRetries));
        return this.loadAudio(url);
      }
      this.loadRetries = 0;
    }
  }

  /**
   * Creates a new AudioBuffer where the tail of the track is crossfaded into
   * the head, eliminating any audible seam when Web Audio loops the buffer.
   *
   * The last `fadeSamples` of the original are blended (fade-out) with the
   * first `fadeSamples` (fade-in), then the tail is trimmed so the buffer
   * is shorter by exactly `fadeSamples`. When `loop = true` replays from
   * sample 0, the transition is perfectly smooth.
   */
  createCrossfadeBuffer(buffer) {
    const sampleRate = buffer.sampleRate;
    const channels = buffer.numberOfChannels;
    const fadeSamples = Math.floor(sampleRate * this.crossfadeDuration);
    const originalLength = buffer.length;

    // Need at least twice the fade region to make a meaningful crossfade
    if (originalLength < fadeSamples * 3) return buffer;

    const newLength = originalLength - fadeSamples;
    const newBuffer = this.audioContext.createBuffer(channels, newLength, sampleRate);

    for (let ch = 0; ch < channels; ch++) {
      const oldData = buffer.getChannelData(ch);
      const newData = newBuffer.getChannelData(ch);

      // Crossfade region: blend original start (fade-in) with original tail (fade-out)
      for (let i = 0; i < fadeSamples; i++) {
        const fadeIn = i / fadeSamples;
        const fadeOut = 1 - fadeIn;
        newData[i] = oldData[i] * fadeIn + oldData[newLength + i] * fadeOut;
      }

      // Remainder: copy unchanged
      for (let i = fadeSamples; i < newLength; i++) {
        newData[i] = oldData[i];
      }
    }

    return newBuffer;
  }

  startPlayback() {
    if (!this.audioBuffer || !this.audioContext) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    // Fade in: start silent, ramp to target volume over 1.5s
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.7, this.audioContext.currentTime + 1.5);

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
        // Fade out over 0.5s before stopping
        const now = this.audioContext.currentTime;
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        const src = this.source;
        setTimeout(() => {
          try { src.stop(); } catch { /* already stopped */ }
          try { src.disconnect(); } catch { /* already disconnected */ }
        }, 550);
      } catch {
        try { this.source.stop(); } catch { /* already stopped */ }
        try { this.source.disconnect(); } catch { /* already disconnected */ }
      }
      this.source = null;
      this.isPlaying = false;
    }
  }

  stop() {
    this.pause();
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioManager = new AudioManager();
