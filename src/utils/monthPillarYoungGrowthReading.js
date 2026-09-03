import { MONTH_PILLAR_YOUNG_GROWTH_LIBRARY } from '../data/monthPillarYoungGrowthLibrary';

export function getMonthPillarKey(chart) {
  const month = chart?.pillars?.month;
  if (!month?.stem || !month?.branch) return null;
  return `${month.stem}${month.branch}`;
}

const MONTH_STAGE_SUBTITLE =
  "Your pet's Month Pillar reflects young-growth behavior, play style, energy, social attraction, and developing habits.";

const MONTH_LIBRARY_MISSING =
  'We could not find this Month Pillar in the current Hachi young-growth library yet.';

/**
 * Stage Reading content when Month Pillar is selected.
 */
export function buildMonthYoungGrowthStageReading(chart) {
  const combo = getMonthPillarKey(chart);
  if (!combo) return null;

  const base = {
    title: 'Young Growth · 月柱',
    subtitle: MONTH_STAGE_SUBTITLE,
    age: '1–4 years',
    combo,
    pillarKey: 'month',
  };

  const entry = MONTH_PILLAR_YOUNG_GROWTH_LIBRARY[combo];
  if (!entry) {
    return {
      ...base,
      body: MONTH_LIBRARY_MISSING,
      missingKey: combo,
    };
  }

  const fields = [
    { label: 'Favorite Activity', value: entry.favoriteActivity },
    { label: 'Energy Level', value: entry.energyLevel },
    { label: 'Attracted To', value: entry.attractedTo },
    { label: 'Impresses By', value: entry.impressesBy },
    { label: 'Secret Want', value: entry.secretWant },
  ].filter((row) => row.value?.trim());

  return {
    ...base,
    fields,
    body: entry.reading || '',
  };
}
