import './style.css'

import Peaks from 'peaks.js';
import Multitrack from './multitrack.ts';
import * as Tone from 'tone';

const audioContext = Tone.context;
const multitrack = new Multitrack(audioContext);

const track01 = document.getElementById('track-01')!
const track02 = document.getElementById('track-02')!
const play = document.getElementById('play')!
const pause = document.getElementById('pause')!

function options(container: HTMLElement, audioBuffer: AudioBuffer) {
  return {
    zoomview: {
      container,
      
    },
    player: multitrack,
    webAudio: {
      audioBuffer,
    },
    playheadColor: 'rgba(255, 0, 0, 1)',
    playheadTextColor: 'red',
    zoomLevels: [4096],
  };
}

async function initPeaksInstances(audioBuffers: AudioBuffer[]) {
  Peaks.init(options(track01, audioBuffers[0]), function(err, peaks) {
    if (err) {
      console.error('Failed to initialize Peaks instance: ' + err.message);
      return;
    }

    // Do something when the waveform is displayed and ready
  });

  Peaks.init(options(track02, audioBuffers[1]), function(err, peaks) {
    if (err) {
      console.error('Failed to initialize Peaks instance: ' + err.message);
      return;
    }

    // Do something when the waveform is displayed and ready
  });
}

async function readAudios() {
  const response1 = await fetch('/audios/sample.mp3');
  const buffer1 = await response1.arrayBuffer();
  const audio1 = await multitrack.addTrack(buffer1);

  const response2 = await fetch('/audios/sample2.mp3');
  const buffer2 = await response2.arrayBuffer();
  const audio2 = await multitrack.addTrack(buffer2);

  return [audio1, audio2];

}

async function init() {
  const audioBuffers = await readAudios()
  initPeaksInstances(audioBuffers);

  play.addEventListener('click', () => {
    multitrack.play();
  })

  pause.addEventListener('click', () => {
    multitrack.pause();
  })
}


init();
