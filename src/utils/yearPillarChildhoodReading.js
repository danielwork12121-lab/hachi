import { YEAR_PILLAR_CHILDHOOD_LIBRARY } from '../data/yearPillarChildhoodLibrary';

export function getYearPillarKey(chart) {
  const year = chart?.pillars?.year;
  if (!year?.stem || !year?.branch) return null;
  return `${year.stem}${year.branch}`;
}

const YEAR_STAGE_SUBTITLE =
  "Your pet's Year Pillar reflects early temperament, first attachment patterns, and baby-stage comfort needs.";

const YEAR_LIBRARY_MISSING =
  'We could not find this Year Pillar in the current Hachi childhood library yet.';

/**
 * Stage Reading content when Year Pillar is selected.
 */
export function buildYearChildhoodStageReading(chart) {
  const combo = getYearPillarKey(chart);
  if (!combo) return null;

  const base = {
    title: 'Early Bond · 年柱',
    subtitle: YEAR_STAGE_SUBTITLE,
    age: 'First 10 months',
    combo,
    pillarKey: 'year',
  };

  const entry = YEAR_PILLAR_CHILDHOOD_LIBRARY[combo];
  if (!entry) {
    return {
      ...base,
      body: YEAR_LIBRARY_MISSING,
      missingKey: combo,
    };
  }

  const fields = [
    { label: 'Favorite Toy', value: entry.favoriteToy },
    { label: 'Animal Mom', value: entry.animalMom },
    { label: 'Animal Dad', value: entry.animalDad },
    { label: 'Human Owner', value: entry.humanOwner },
  ].filter((row) => row.value?.trim());

  return {
    ...base,
    fields,
    body: entry.reading || '',
  };
}
