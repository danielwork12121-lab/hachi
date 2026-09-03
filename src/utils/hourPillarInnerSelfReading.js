import { HOUR_PILLAR_INNER_SELF_LIBRARY } from '../data/hourPillarInnerSelfLibrary';

export function getHourPillarKey(chart) {
  const hour = chart?.pillars?.hour;
  if (!hour?.stem || !hour?.branch) return null;
  return `${hour.stem}${hour.branch}`;
}

const HOUR_STAGE_SUBTITLE =
  "Your pet's Hour Pillar reflects inner nature, later-life comfort, memory, and the quiet truth beneath the personality.";

const HOUR_LIBRARY_MISSING =
  'We could not find this Hour Pillar in the current Hachi inner-self library yet.';

/**
 * Stage Reading content when Hour Pillar is selected.
 */
export function buildHourInnerSelfStageReading(chart) {
  const combo = getHourPillarKey(chart);
  if (!combo) return null;

  const base = {
    title: 'Inner Self · 时柱',
    subtitle: HOUR_STAGE_SUBTITLE,
    age: '10+ years',
    combo,
    pillarKey: 'hour',
  };

  const entry = HOUR_PILLAR_INNER_SELF_LIBRARY[combo];
  if (!entry) {
    return {
      ...base,
      body: HOUR_LIBRARY_MISSING,
      missingKey: combo,
    };
  }

  const fields = [
    { label: 'Greatest Accomplishment', value: entry.greatestAccomplishment },
    { label: 'What It Wants You To Know', value: entry.wantsYouToKnow },
  ].filter((row) => row.value?.trim());

  return {
    ...base,
    fields,
    body: entry.reading || '',
    readingLabel: 'Main Reading',
  };
}
