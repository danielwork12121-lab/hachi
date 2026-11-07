import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChart, pillarKey, InvalidChartInput } from '../src/chart.js';
import { computeZipingBazi } from '../../src/utils/zipingBazi.js';

test('buildChart matches the app engine exactly (no divergent math)', () => {
  const input = { birthDate: '2021-06-15', birthTime: '08:30', birthLocation: 'Atlanta, USA' };
  const viaServer = buildChart(input);
  const viaApp = computeZipingBazi({ ...input, birthTimeWasDefaulted: false, birthLocationWasDefaulted: false });
  assert.equal(viaServer.eightCharacters, viaApp.eightCharacters);
  assert.deepEqual(viaServer.pillars, viaApp.pillars);
  assert.deepEqual(viaServer.elements, viaApp.elements);
  assert.equal(viaServer.dayMaster, viaApp.dayMaster);
});

test('known chart is computed correctly', () => {
  const chart = buildChart({ birthDate: '2021-06-15', birthTime: '08:30', birthLocation: 'Atlanta, USA' });
  assert.equal(chart.success, true);
  assert.equal(chart.eightCharacters, '辛丑 甲午 甲午 戊辰');
  assert.equal(chart.dayMaster, '甲');
  assert.equal(chart.zodiac, 'Ox');
});

test('missing birth time is flagged as defaulted, not silently invented', () => {
  const chart = buildChart({ birthDate: '2021-06-15' });
  assert.equal(chart.input.birthTimeWasDefaulted, true);
  assert.ok(chart.calculationNotes.some((n) => /defaulted/i.test(n)));
});

test('rejects a malformed birth date', () => {
  assert.throws(() => buildChart({ birthDate: '15/06/2021' }), InvalidChartInput);
  assert.throws(() => buildChart({}), InvalidChartInput);
  assert.throws(() => buildChart({ birthDate: '2021-06-15', birthTime: 42 }), InvalidChartInput);
});

test('pillarKey joins stem and branch', () => {
  const chart = buildChart({ birthDate: '2021-06-15', birthTime: '08:30' });
  assert.equal(pillarKey(chart.pillars.day), '甲午');
});
