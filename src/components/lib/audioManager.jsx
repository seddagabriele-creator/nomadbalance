// Global audio manager with Web Audio API for gapless looping
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
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
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

  startPlayback() {
    if (!this.audioBuffer || !this.audioContext) return;

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
        this.source.stop();
      } catch {
        // Source may have already been stopped
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
