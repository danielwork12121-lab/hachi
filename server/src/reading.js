/**
 * Orchestration: chart -> prompt -> LLM -> validated reading, with fallback.
 *
 * The LLM is injected rather than imported so tests run without a network or a
 * key, and so a different provider can be dropped in without touching this file.
 */
import { buildChart } from './chart.js';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt.js';
import { buildFallbackReading } from './fallback.js';
import { LLMNotConfigured } from './llm.js';

const REQUIRED_FIELDS = ['summary', 'personality', 'bondingStyle', 'quirks'];

/** Parse the model's reply, tolerating a markdown fence. Returns null if unusable. */
export function parseReading(raw) {
  if (typeof raw !== 'string') return null;
  let text = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

  const out = {};
  for (const field of REQUIRED_FIELDS) {
    const value = parsed[field];
    if (typeof value !== 'string' || !value.trim()) return null;
    out[field] = value.trim();
  }
  return out;
}

export function createReadingService({ generate = null, logger = console } = {}) {
  /**
   * @returns {{reading: object, chart: object, source: 'llm'|'fallback', fallbackReason: string|null}}
   */
  return async function getReading(input) {
    const chart = buildChart(input);
    const pet = { name: input?.petName, species: input?.species };

    const fallback = (reason) => ({
      reading: buildFallbackReading(chart, pet),
      chart,
      source: 'fallback',
      fallbackReason: reason,
    });

    if (!generate) return fallback('llm-not-configured');

    let raw;
    try {
      raw = await generate(SYSTEM_PROMPT, buildUserPrompt(chart, pet));
    } catch (err) {
      if (err instanceof LLMNotConfigured) return fallback('llm-not-configured');
      logger.warn?.(`[reading] LLM call failed, falling back: ${err.message}`);
      return fallback('llm-error');
    }

    const parsed = parseReading(raw);
    if (!parsed) {
      logger.warn?.('[reading] LLM returned an unparseable reading, falling back.');
      return fallback('llm-unparseable');
    }
    return { reading: parsed, chart, source: 'llm', fallbackReason: null };
  };
}
