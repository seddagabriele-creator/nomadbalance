// Global audio manager with Web Audio API for gapless looping
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.audioBuffer = null;
    this.source = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.currentUrl = null;
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
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.currentUrl = url;
    } catch (err) {
      console.log("Audio load failed:", err);
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
      this.source.stop();
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