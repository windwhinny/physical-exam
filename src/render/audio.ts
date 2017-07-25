const map: Map<string, HTMLAudioElement> = new Map();
for (let i = 0; i <= 10 ; i++) {
  const audio = new Audio();
  const url = `./audios/${i}.mp3`;
  audio.src = url;
  map.set(url, audio);
}
// let lastAudio: HTMLAudioElement | null = null;
export default function play(url: string) {
  // if (lastAudio) {
  //   lastAudio.pause();
  // }
  let audio: HTMLAudioElement;
  if (map.has(url)) {
    audio = map.get(url) as HTMLAudioElement;
    audio.currentTime = 0;
  } else {
    audio = new Audio();
    audio.src = url;
  }
  // lastAudio = audio;
  return new Promise((resolve) => {
    audio.onended = resolve;
    audio.onabort = resolve;
    audio.play();
  });
}

// tslint:disable-next-line:no-any
(window as any).play = play;
