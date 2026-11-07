import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

const GOOD = JSON.stringify({
  summary: 'A watchful little tree.', personality: 'Grows toward you.',
  bondingStyle: 'Picks one person.', quirks: 'Sleeps in boxes.',
});
const silent = { warn() {}, error() {} };

let server, base;
before(async () => {
  const app = createApp({ generate: async () => GOOD, logger: silent });
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server?.close());

const post = (body) => fetch(`${base}/reading`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

test('GET /health reports llm status', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, llmConfigured: true });
});

test('POST /reading returns the reading and the computed chart', async () => {
  const res = await post({ birthDate: '2021-06-15', birthTime: '08:30', petName: 'Mochi', species: 'cat' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.source, 'llm');
  assert.equal(body.reading.summary, 'A watchful little tree.');
  assert.equal(body.chart.eightCharacters, '辛丑 甲午 甲午 戊辰');
  assert.equal(body.chart.zodiac, 'Ox');
  assert.ok(Array.isArray(body.chart.calculationNotes));
});

test('POST /reading 400s on a malformed date without crashing', async () => {
  const res = await post({ birthDate: '15/06/2021' });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /YYYY-MM-DD/);
  assert.equal(body.failedStep, 'request-validation');
});

test('POST /reading 400s when birthDate is missing entirely', async () => {
  assert.equal((await post({ petName: 'Mochi' })).status, 400);
});

test('a server with no LLM still answers, labelled as fallback', async () => {
  const app = createApp({ generate: null, logger: silent });
  const s = app.listen(0);
  await new Promise((r) => s.once('listening', r));
  try {
    const res = await fetch(`http://127.0.0.1:${s.address().port}/reading`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate: '2021-06-15', birthTime: '08:30', petName: 'Mochi' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.source, 'fallback');
    assert.equal(body.fallbackReason, 'llm-not-configured');
    assert.ok(body.reading.personality.length > 80);
  } finally { s.close(); }
});
