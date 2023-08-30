import { EventEmitterForPlayerEvents, PlayerAdapter } from "peaks.js";

export default class Player implements PlayerAdapter {
  eventEmitter!: EventEmitterForPlayerEvents | null;

  state!: string;

  interval!: number | null;

  // in seconds
  currentTime = 0;

  init(eventEmitter: EventEmitterForPlayerEvents) {
    this.eventEmitter = eventEmitter;
    this.state = 'paused';
    return Promise.resolve();
  }

  destroy() {
    this.eventEmitter = null;
    if (this.interval !== null) {
      clearTimeout(this.interval);
      this.interval = null;
    }
  }

  startTimeUpdate() {
    this.interval = setInterval(() => {
      this.eventEmitter?.emit('player.timeupdate', this.getCurrentTimeMilli());
      this.setCurrentTime(this.currentTime + 100);
    }, 100);
  }

  stopTimeUpdate() {
    if (this.interval !== null) {
      clearTimeout(this.interval);
      this.interval = null;
    }
  }

  play() {
    this.state = 'playing';
    this.eventEmitter?.emit('player.canplay');
    this.eventEmitter?.emit('player.playing', this.getCurrentTimeSeconds());
    this.startTimeUpdate();
    return Promise.resolve();
  }

  pause() {
    this.state = 'paused';
    this.eventEmitter?.emit('player.pause', this.getCurrentTimeSeconds());
    this.stopTimeUpdate();
  }

  seek(time: number) {
    this.state = 'seeking';
    this.setCurrentTime(time * 1000);
  }

  isPlaying() {
    return this.state === 'playing';
  }

  isSeeking() {
    return this.state === 'seeking';
  }

  getCurrentTimeMilli() {
    return this.currentTime / 1000;
  }

  getCurrentTimeSeconds() {
    return this.currentTime;
  }

  getCurrentTime() {
    return this.getCurrentTimeMilli();
  }

  setCurrentTime(time: number) {
    this.currentTime = time;
  }

  getDuration() {
    return 0;
  }
}
