// Global audio manager for seamless background music
class AudioManager {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.currentUrl = null;
  }

  play(url) {
    if (this.currentUrl !== url) {
      this.stop();
      this.audio = new Audio(url);
      this.audio.loop = true;
      this.audio.volume = 0.7;
      this.currentUrl = url;
    }

    if (this.audio && !this.isPlaying) {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
        }).catch(err => {
          console.log("Audio play failed:", err);
        });
      }
    }
  }

  pause() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioManager = new AudioManager();