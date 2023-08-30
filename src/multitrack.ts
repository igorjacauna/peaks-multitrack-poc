import Player from "./player";

export default class Multitrack {
  audioContext: AudioContext;
  player: Player;
  tracks: {
    arrayBuffer: ArrayBuffer;
    audioBuffer: AudioBuffer;
    audioSource: AudioBufferSourceNode;
  }[] = [];
  gain: GainNode;

  constructor(audioContext: AudioContext, player: Player) {
    this.audioContext = audioContext;
    this.player = player;
    this.gain = audioContext.createGain();
  }

  play() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    if (this.player.state === 'playing') return;

    // Every time will play, must create the audioSource
    this.tracks = this.tracks.map(track => {
      const audioSource = this.audioContext.createBufferSource();
      audioSource.buffer = track.audioBuffer;
      audioSource.connect(this.gain).connect(this.audioContext.destination);
      audioSource.start(
        this.audioContext.currentTime,
        this.player.getCurrentTimeSeconds(),
      );
      return {
        ...track,
        audioSource,
      };
    });
    this.player.play();
  }

  pause() {
    if (this.player.state === 'paused') return;
    this.tracks.forEach(track => {
      track.audioSource.stop(this.player.getCurrentTimeSeconds());
    });
    this.player.pause();
  }

  async addTrack(arrayBuffer: ArrayBuffer) {
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    const audioSource = this.audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(this.gain).connect(this.audioContext.destination);
    this.tracks.push({
      audioBuffer,
      arrayBuffer,
      audioSource,
    });
    return audioBuffer;
  }
}