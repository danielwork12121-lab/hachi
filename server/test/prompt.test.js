import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChart } from '../src/chart.js';
import { SYSTEM_PROMPT, buildUserPrompt } from '../src/prompt.js';

const chart = buildChart({ birthDate: '2021-06-15', birthTime: '08:30', birthLocation: 'Atlanta, USA' });

test('prompt carries the already-computed pillars', () => {
  const p = buildUserPrompt(chart, { name: 'Mochi', species: 'cat' });
  for (const pillar of ['辛丑', '甲午', '戊辰']) assert.ok(p.includes(pillar), `missing ${pillar}`);
  assert.ok(p.includes('Mochi'));
  assert.ok(p.includes('cat'));
  assert.ok(p.includes('Ox'));
});

test('system prompt forbids recalculating and forbids medical advice', () => {
  assert.match(SYSTEM_PROMPT, /Never recalculate/i);
  assert.match(SYSTEM_PROMPT, /medical/i);
  assert.match(SYSTEM_PROMPT, /JSON only/i);
});

test('defaulted birth time adds a hedging instruction; a supplied one does not', () => {
  const defaulted = buildUserPrompt(buildChart({ birthDate: '2021-06-15' }), {});
  assert.match(defaulted, /keep claims about the inner self .* gentle/i);
  assert.ok(!/gentle and non-committal/i.test(buildUserPrompt(chart, {})));
});

test('falls back to neutral labels when the pet is unnamed', () => {
  const p = buildUserPrompt(chart, {});
  assert.ok(p.includes('this pet'));
});
