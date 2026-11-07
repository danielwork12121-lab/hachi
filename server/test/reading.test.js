import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseReading, createReadingService } from '../src/reading.js';
import { LLMNotConfigured } from '../src/llm.js';

const GOOD = JSON.stringify({
  summary: 'A watchful little tree.', personality: 'Grows toward you.',
  bondingStyle: 'Picks one person.', quirks: 'Sleeps in boxes.',
});
const INPUT = { birthDate: '2021-06-15', birthTime: '08:30', petName: 'Mochi', species: 'cat' };
const silent = { warn() {}, error() {} };

test('parseReading accepts clean JSON and a fenced block', () => {
  assert.equal(parseReading(GOOD).summary, 'A watchful little tree.');
  assert.equal(parseReading('```json\n' + GOOD + '\n```').quirks, 'Sleeps in boxes.');
});

test('parseReading rejects junk, arrays, and partial objects', () => {
  assert.equal(parseReading('not json'), null);
  assert.equal(parseReading('[1,2]'), null);
  assert.equal(parseReading(JSON.stringify({ summary: 'x' })), null);
  assert.equal(parseReading(JSON.stringify({ summary: '  ', personality: 'a', bondingStyle: 'b', quirks: 'c' })), null);
  assert.equal(parseReading(undefined), null);
});

test('uses the LLM reading when the call succeeds', async () => {
  let seen = null;
  const svc = createReadingService({ generate: async (sys, user) => { seen = { sys, user }; return GOOD; }, logger: silent });
  const out = await svc(INPUT);
  assert.equal(out.source, 'llm');
  assert.equal(out.fallbackReason, null);
  assert.equal(out.reading.summary, 'A watchful little tree.');
  assert.ok(seen.user.includes('Mochi'));
});

test('falls back to the library reading when the LLM throws', async () => {
  const svc = createReadingService({ generate: async () => { throw new Error('ark down'); }, logger: silent });
  const out = await svc(INPUT);
  assert.equal(out.source, 'fallback');
  assert.equal(out.fallbackReason, 'llm-error');
  assert.ok(out.reading.personality.length > 0);
});

test('falls back when the LLM returns something unparseable', async () => {
  const svc = createReadingService({ generate: async () => 'Sure! Here is a lovely reading :)', logger: silent });
  const out = await svc(INPUT);
  assert.equal(out.fallbackReason, 'llm-unparseable');
});

test('falls back when no LLM is configured at all', async () => {
  const none = createReadingService({ logger: silent });
  assert.equal((await none(INPUT)).fallbackReason, 'llm-not-configured');
  const unconf = createReadingService({ generate: async () => { throw new LLMNotConfigured(); }, logger: silent });
  assert.equal((await unconf(INPUT)).fallbackReason, 'llm-not-configured');
});

test('the fallback reading is real library copy, not a stub', async () => {
  const svc = createReadingService({ logger: silent });
  const out = await svc(INPUT);
  assert.ok(out.reading.personality.length > 80, 'expected substantive library prose');
  assert.match(out.reading.quirks, /dog|cat/i);
});

test('invalid input rejects before any LLM call is made', async () => {
  let called = false;
  const svc = createReadingService({ generate: async () => { called = true; return GOOD; }, logger: silent });
  await assert.rejects(() => svc({ birthDate: 'nope' }));
  assert.equal(called, false);
});
