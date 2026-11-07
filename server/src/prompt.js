/**
 * Prompt construction.
 *
 * The LLM is never asked to do Bazi math. The chart is computed
 * deterministically first; the model only turns an already-correct chart into
 * readable prose. That keeps the astrology logic testable and stops the model
 * from inventing pillars.
 */

export const SYSTEM_PROMPT = [
  'You write short, warm personality readings for pets, based on a Chinese Bazi (四柱) chart',
  'that has ALREADY been calculated for you.',
  '',
  'Rules:',
  '- Never recalculate, question, or contradict the pillars you are given. They are correct.',
  '- Write for an English-speaking pet owner who knows nothing about Bazi. Explain through',
  '  imagery and behaviour, not jargon. You may mention a stem/branch character once if it',
  '  earns its place.',
  '- This is entertainment and emotional insight. Never give medical, behavioural, or',
  '  veterinary advice, and never predict illness, injury, or death.',
  '- Be specific and affectionate, not generic. Describe how this pet actually behaves.',
  '- Respond with JSON only, no markdown fence, matching exactly this shape:',
  '  {"summary": string, "personality": string, "bondingStyle": string, "quirks": string}',
  '- summary: 1-2 sentences. The others: 2-4 sentences each.',
].join('\n');

/**
 * @param {object} chart  result of buildChart()
 * @param {object} pet    { name?, species? }
 */
export function buildUserPrompt(chart, pet = {}) {
  const name = (pet.name || '').trim() || 'this pet';
  const species = (pet.species || '').trim() || 'pet';
  const p = chart.pillars;

  return [
    `Pet name: ${name}`,
    `Species: ${species}`,
    `Birth date: ${chart.input.birthDate}`,
    `Birth time: ${chart.input.birthTime}${chart.input.birthTimeWasDefaulted ? ' (not provided by the owner; defaulted)' : ''}`,
    `Chinese zodiac: ${chart.zodiac}`,
    `Day Master (core self): ${chart.dayMaster}`,
    '',
    'Four Pillars:',
    `  Year  ${p.year.stem}${p.year.branch}  — ${chart.elements.year}`,
    `  Month ${p.month.stem}${p.month.branch}  — ${chart.elements.month}`,
    `  Day   ${p.day.stem}${p.day.branch}  — ${chart.elements.day}`,
    `  Hour  ${p.hour.stem}${p.hour.branch}  — ${chart.elements.hour}`,
    '',
    'Guidance on which pillar governs what:',
    '  Year pillar  -> early life and first impressions',
    '  Month pillar -> how it grew up and how it handles its daily routine',
    '  Day pillar   -> its core personality and how it bonds with its owner',
    '  Hour pillar  -> its private, inner self when nobody is watching',
    '',
    chart.input.birthTimeWasDefaulted
      ? 'Because the birth time was defaulted, keep claims about the inner self (Hour pillar) gentle and non-committal.'
      : '',
    `Write the reading for ${name}.`,
  ].filter(Boolean).join('\n');
}
