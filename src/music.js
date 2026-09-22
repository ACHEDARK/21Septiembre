export const MUSIC_TRACKS = [
  {
    title: "Idea 10 · Gibran Alcocer",
    src: "./musics/Gibran%20Alcocer%20-%20Idea%2010.mp3",
  },
  {
    title: "Idea 15 · Gibran Alcocer",
    src: "./musics/Gibran%20Alcocer%20-%20Idea%2015.mp3",
  },
  {
    title: "Idea 22 · Gibran Alcocer",
    src: "./musics/Idea%2022.mp3",
  },
  {
    title: "21g · Juan Arenosa",
    src: "./musics/Juan%20Arenosa%20-%2021%20g.mp3",
  },
];

export class MusicPlayer {
  constructor() {
    this.element = new Audio();
    this.element.preload = "metadata";
    this.element.loop = true;
    this.element.volume = 0.34;
    this.index = 0;
    this.enabled = false;
    this.suspended = false;
    this.selectTrack(0);
  }

  get track() {
    return MUSIC_TRACKS[this.index];
  }

  async selectTrack(index) {
    const nextIndex = Math.min(
      MUSIC_TRACKS.length - 1,
      Math.max(0, Number(index) || 0),
    );
    const wasPlaying = this.enabled && !this.element.paused;
    this.element.pause();
    this.index = nextIndex;
    this.element.src = this.track.src;
    this.element.load();
    if (wasPlaying) await this.play();
    return this.track;
  }

  async play() {
    await this.element.play();
    this.enabled = true;
    return true;
  }

  pause() {
    this.element.pause();
  }

  async toggle() {
    if (this.enabled) {
      this.pause();
      this.enabled = false;
      return false;
    }
    return this.play();
  }

  suspend(paused) {
    this.suspended = paused;
    if (paused) {
      this.pause();
    } else if (this.enabled) {
      this.play().catch(() => {
        this.enabled = false;
      });
    }
  }

  mute() {
    this.pause();
    this.element.currentTime = 0;
    this.enabled = false;
    this.suspended = false;
  }
}
