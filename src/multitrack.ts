import { EventEmitterForPlayerEvents, PlayerAdapter } from "peaks.js";
import * as Tone from 'tone';

export default class Multitrack implements PlayerAdapter {
  audioContext: Tone.BaseContext;
  eventEmitter!: EventEmitterForPlayerEvents | null;
  tracks: {
    player: Tone.Player,
    audioBuffer: AudioBuffer,
  }[] = [];


  constructor(audioContext: Tone.BaseContext) {
    this.audioContext = audioContext;
  }
  init(eventEmitter: EventEmitterForPlayerEvents) {
    this.eventEmitter = eventEmitter;


    Tone.Transport.scheduleRepeat(() => {
      const time = this.getCurrentTime();
      eventEmitter.emit('player.timeupdate', time);

      if (time >= this.getDuration()) {
        Tone.Transport.stop();
      }
    }, 0.25);

    return Promise.resolve();
  };
  destroy() {
    Tone.context.dispose();

    this.tracks = this.tracks.slice(-1, 0);
    this.eventEmitter = null;
  };
  isPlaying() {
    return Tone.Transport.state === "started";
  }
  isSeeking() { return false };
  getCurrentTime() {
    return Tone.Transport.seconds;
  };
  getDuration() {
    const duration = this.tracks.reduce((previous, current) => {
      if (current.audioBuffer.duration > previous) return current.audioBuffer.duration;
      return previous;
    }, 0);
    return duration;
  }
  seek(time: number) {
    Tone.Transport.seconds = time;

    this.eventEmitter?.emit('player.seeked', this.getCurrentTime());
    this.eventEmitter?.emit('player.timeupdate', this.getCurrentTime());
  }

  play() {
    return Tone.start().then(() => {
      Tone.Transport.start();

      this.eventEmitter?.emit('player.playing', this.getCurrentTime());
    });
  }

  pause() {
    Tone.Transport.pause();

    this.eventEmitter?.emit('player.pause', this.getCurrentTime());
  }

  async addTrack(arrayBuffer: ArrayBuffer) {
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    const player = new Tone.Player(audioBuffer).toDestination();
    player.sync();
    player.start();
    this.tracks.push({
      player,
      audioBuffer
    });
    return audioBuffer;
  }
}