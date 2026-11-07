import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createArkClient, readConfig, isConfigured, LLMError, LLMNotConfigured } from '../src/llm.js';

const CONFIG = { apiKey: 'k-test', modelId: 'ep-test', baseUrl: 'https://ark.example/api/v3', timeoutMs: 500 };
const okBody = (text) => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: text } }] }) });

test('readConfig strips a trailing slash and applies defaults', () => {
  const c = readConfig({ DOUBAO_API_KEY: 'a', DOUBAO_MODEL_ID: 'b', DOUBAO_BASE_URL: 'https://x/api/v3/' });
  assert.equal(c.baseUrl, 'https://x/api/v3');
  assert.equal(c.timeoutMs, 20000);
  assert.equal(isConfigured(c), true);
  assert.equal(isConfigured(readConfig({})), false);
});

test('throws LLMNotConfigured rather than calling out with an empty key', async () => {
  let called = false;
  const gen = createArkClient({ ...CONFIG, apiKey: '' }, async () => { called = true; return okBody('x'); });
  await assert.rejects(() => gen('sys', 'user'), LLMNotConfigured);
  assert.equal(called, false);
});

test('sends the right endpoint, auth header and model, and returns the content', async () => {
  let seen;
  const gen = createArkClient(CONFIG, async (url, opts) => { seen = { url, opts }; return okBody('hello'); });
  assert.equal(await gen('SYS', 'USER'), 'hello');
  assert.equal(seen.url, 'https://ark.example/api/v3/chat/completions');
  assert.equal(seen.opts.headers.Authorization, 'Bearer k-test');
  const body = JSON.parse(seen.opts.body);
  assert.equal(body.model, 'ep-test');
  assert.deepEqual(body.messages, [
    { role: 'system', content: 'SYS' },
    { role: 'user', content: 'USER' },
  ]);
});

test('retries exactly once on a retryable status, then succeeds', async () => {
  let n = 0;
  const gen = createArkClient(CONFIG, async () => {
    n += 1;
    if (n === 1) return { ok: false, status: 503, json: async () => ({}) };
    return okBody('second try');
  });
  assert.equal(await gen('s', 'u'), 'second try');
  assert.equal(n, 2);
});

test('does not retry a non-retryable status', async () => {
  let n = 0;
  const gen = createArkClient(CONFIG, async () => { n += 1; return { ok: false, status: 401, json: async () => ({}) }; });
  await assert.rejects(() => gen('s', 'u'), (e) => e instanceof LLMError && e.status === 401 && !e.retryable);
  assert.equal(n, 1);
});

test('gives up after the retry also fails', async () => {
  let n = 0;
  const gen = createArkClient(CONFIG, async () => { n += 1; return { ok: false, status: 500, json: async () => ({}) }; });
  await assert.rejects(() => gen('s', 'u'), LLMError);
  assert.equal(n, 2);
});

test('an empty completion is treated as retryable, not returned as a reading', async () => {
  let n = 0;
  const gen = createArkClient(CONFIG, async () => { n += 1; return n === 1 ? okBody('   ') : okBody('real'); });
  assert.equal(await gen('s', 'u'), 'real');
  assert.equal(n, 2);
});

test('aborts on timeout and reports it as retryable', async () => {
  let n = 0;
  const gen = createArkClient({ ...CONFIG, timeoutMs: 60 }, (_url, opts) => {
    n += 1;
    return new Promise((_resolve, reject) => {
      opts.signal.addEventListener('abort', () => {
        const e = new Error('aborted'); e.name = 'AbortError'; reject(e);
      });
    });
  });
  await assert.rejects(() => gen('s', 'u'), (e) => e instanceof LLMError && /timed out/i.test(e.message));
  assert.equal(n, 2, 'timeout is retryable, so it should be attempted twice');
});
