/**
 * Deterministic fallback reading.
 *
 * If the LLM is unconfigured, down, or returns something unusable, the service
 * still answers — with the same hand-written pillar libraries the app shipped
 * before this backend existed. A reading is never fabricated and the response
 * always says which path produced it.
 */
import { DAY_PILLAR_LIBRARY } from '../../src/data/dayPillarLibrary.js';
import { pillarKey } from './chart.js';

export function buildFallbackReading(chart, pet = {}) {
  const name = (pet.name || '').trim() || 'This pet';
  const key = pillarKey(chart.pillars.day);
  const entry = DAY_PILLAR_LIBRARY[key];

  if (!entry) {
    return {
      summary: `${name}'s chart centres on the ${key} day pillar (${chart.elements.day}).`,
      personality: `${name}'s core self is ${chart.dayMaster}, shaped by the ${chart.zodiac} year.`,
      bondingStyle: 'Bonding style is drawn from the Day Pillar, which is not in the library yet.',
      quirks: 'No library entry for this pillar yet.',
    };
  }

  return {
    summary: `${name} is a ${key} day pillar (${chart.elements.day}) — ${entry.extroversion}.`,
    personality: entry.reading,
    bondingStyle: `Attachment level ${entry.attachmentLevel}. Troublemaking ${entry.troublemakingScore}.`,
    quirks: `If ${name} were a dog, think ${entry.likelyDogBreed}; as a cat, a ${entry.likelyCatBreed}.`,
  };
}
