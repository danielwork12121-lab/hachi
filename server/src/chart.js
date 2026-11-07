/**
 * Chart adapter.
 *
 * The Bazi math is NOT reimplemented here. This imports the exact same
 * `computeZipingBazi` the React Native app uses, so the server and the client
 * can never disagree about a pillar. If the engine changes, both change.
 */
import { computeZipingBazi } from '../../src/utils/zipingBazi.js';

export class InvalidChartInput extends Error {
  constructor(message, failedStep) {
    super(message);
    this.name = 'InvalidChartInput';
    this.failedStep = failedStep;
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate request input and compute the chart.
 * @returns the engine's chart object (pillars, elements, dayMaster, zodiac, ...)
 */
export function buildChart({ birthDate, birthTime, birthLocation, gender } = {}) {
  if (typeof birthDate !== 'string' || !DATE_RE.test(birthDate)) {
    throw new InvalidChartInput('birthDate is required as YYYY-MM-DD.', 'request-validation');
  }
  if (birthTime != null && typeof birthTime !== 'string') {
    throw new InvalidChartInput('birthTime must be a string like "08:30".', 'request-validation');
  }

  const result = computeZipingBazi({
    birthDate,
    birthTime: birthTime ?? undefined,
    birthLocation: birthLocation ?? undefined,
    gender: gender ?? undefined,
    birthTimeWasDefaulted: birthTime == null,
    birthLocationWasDefaulted: birthLocation == null,
  });

  if (!result.success) {
    throw new InvalidChartInput(result.error || 'Chart computation failed.', result.failedStep);
  }
  return result;
}

/** The pillar key ("甲子") used to look up the deterministic copy libraries. */
export function pillarKey(pillar) {
  return `${pillar.stem}${pillar.branch}`;
}
