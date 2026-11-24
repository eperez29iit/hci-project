const soundUrl = new URL('./assets/woodland-chime.mp3', import.meta.url).href;

// Prepare audio inside a user gesture; a looping buffer needs no background timers.
export function createChime(onReady) {
  let context, bufferPromise, source;
  let generation = 0;

  async function prepare() {
    try {
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (!AudioEngine) return false;
      if (!context) {
        context = new AudioEngine();
        context.onstatechange = () => onReady(context?.state === 'running');
      }
      if (context.state !== 'running') await context.resume();
      if (!bufferPromise) {
        bufferPromise = fetch(soundUrl).then(response => {
          if (!response.ok) throw new Error('Chime could not load');
          return response.arrayBuffer();
        }).then(data => context.decodeAudioData(data));
      }
      await bufferPromise;
      onReady(context?.state === 'running');
      return context?.state === 'running';
    } catch {
      bufferPromise = undefined;
      onReady(false);
      return false;
    }
  }

  function stop() {
    generation += 1;
    if (source) {
      source.onended = null;
      source.stop();
      source.disconnect();
      source = null;
    }
  }

  async function play(loop, onEnded) {
    stop();
    const request = generation;
    if (!(await prepare()) || request !== generation) return false;
    const buffer = await bufferPromise;
    if (request !== generation || !context) return false;
    source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(context.destination);
    source.onended = () => {
      source?.disconnect();
      source = null;
      onEnded?.();
    };
    source.start();
    return true;
  }

  function close() {
    stop();
    if (context) {
      context.onstatechange = null;
      void context.close();
    }
    context = undefined;
  }
  return { prepare, play, stop, close };
}
