import assert from 'node:assert/strict';
import test from 'node:test';
import { createChime } from '../src/chime.js';

test('the alarm loops one sound, stops on acknowledgment, and cancels a pending start', async () => {
  const sources = [];
  class AudioContext {
    state = 'running';
    destination = {};
    decodeAudioData() { return Promise.resolve({ duration: 9.6 }); }
    close() { return Promise.resolve(); }
    createBufferSource() {
      const node = {
        starts: 0, stops: 0, connect() {}, disconnect() {},
        start() { this.starts++; }, stop() { this.stops++; },
      };
      sources.push(node);
      return node;
    }
  }
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  try {
    globalThis.window = { AudioContext };
    globalThis.fetch = async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
    const chime = createChime(() => {});
    await chime.prepare();
    await chime.play(true);
    assert.equal(sources.length, 1);
    assert.equal(sources[0].loop, true);
    assert.equal(sources[0].starts, 1);
    chime.stop();
    assert.equal(sources[0].stops, 1);
    const pending = chime.play(true);
    chime.stop();
    assert.equal(await pending, false);
    assert.equal(sources.length, 1);
    chime.close();
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    globalThis.fetch = previousFetch;
  }
});
