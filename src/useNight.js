import { useCallback, useEffect, useState } from 'react';
import { clockTime, phaseOf, planNight, respond, validNight } from './night.js';

function readNight(key) {
  try {
    const night = JSON.parse(window.localStorage.getItem(key));
    return validNight(night) ? night : null;
  } catch { return undefined; }
}

export default function useNight(demo) {
  const projectPath = new URL('.', window.location.href).pathname;
  const key = 'stillwood:' + projectPath + (demo ? ':class-demo.v1' : ':night.v1');
  const [night, setNight] = useState(() => readNight(key) ?? null);
  const [realTime, setRealTime] = useState(Date.now);
  const now = clockTime(night, realTime, demo);
  const phase = phaseOf(night, now);

  useEffect(() => {
    const tick = () => setRealTime(Date.now());
    const sync = event => {
      if (event.key === key || event.key === null) {
        setNight(readNight(key) ?? null);
        tick();
      }
    };
    window.addEventListener('storage', sync);
    window.addEventListener('pageshow', tick);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    const timer = window.setInterval(tick, night ? (demo ? 100 : 250) : 30000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', sync);
      window.removeEventListener('pageshow', tick);
      window.removeEventListener('focus', tick);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [key, night, demo]);

  const save = useCallback(next => {
    try {
      if (next) window.localStorage.setItem(key, JSON.stringify(next));
      else window.localStorage.removeItem(key);
    } catch { /* The current tab still works if browser storage is unavailable. */ }
    setNight(next);
    setRealTime(Date.now());
  }, [key]);

  function begin(bed, wake) {
    const realNow = Date.now();
    save(planNight(bed, wake, realNow, demo, night?.startedAt ?? realNow));
  }

  function act(action) {
    const stored = readNight(key);
    const latest = stored === undefined ? night : stored;
    const next = respond(latest, action, clockTime(latest, Date.now(), demo));
    if (next !== latest) save(next);
  }

  return { night, now, phase, begin, act };
}
