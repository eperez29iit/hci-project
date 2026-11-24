import { useEffect, useRef, useState } from 'react';
import { createChime } from './chime.js';

export default function useChime(phase, demo) {
  const engine = useRef(null);
  const [ready, setReady] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [audioError, setAudioError] = useState('');

  useEffect(() => {
    engine.current = createChime(setReady);
    return () => { engine.current.close(); engine.current = null; };
  }, []);

  async function enable() {
    setAudioError('');
    if (!(await engine.current?.prepare())) {
      setAudioError('Sound is paused. Tap the speaker to try again.');
    }
  }

  function stop() {
    engine.current?.stop();
    setPreviewing(false);
  }

  async function preview() {
    if (previewing) { stop(); return; }
    setAudioError('');
    setPreviewing(true);
    const played = await engine.current?.play(false, () => setPreviewing(false));
    if (!played) setPreviewing(false);
  }

  useEffect(() => {
    if (phase !== 'wake' || !ready) return;
    const audio = engine.current;
    const abort = new AbortController();
    // Tabs sharing this plan also share one audible wake-up alarm.
    const ring = async () => {
      if (abort.signal.aborted) return;
      const started = await audio.play(true);
      if (abort.signal.aborted) return;
      setRinging(started);
      await new Promise(resolve => abort.signal.addEventListener('abort', resolve, { once: true }));
    };
    if (navigator.locks) {
      navigator.locks.request('stillwood-chime-' + (demo ? 'demo' : 'night'),
        { signal: abort.signal }, ring).catch(() => { if (!abort.signal.aborted) void ring(); });
    } else { void ring(); }
    return () => { abort.abort(); audio.stop(); setRinging(false); };
  }, [phase, ready, demo]);

  return { ready, ringing, previewing, preview, enable, stop, audioError };
}
