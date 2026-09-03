import { STEM_ELEMENT_EN } from './zipingBazi';

const BRANCH_ELEMENT_EN = {
  子: 'Water',
  丑: 'Earth',
  寅: 'Wood',
  卯: 'Wood',
  辰: 'Earth',
  巳: 'Fire',
  午: 'Fire',
  未: 'Earth',
  申: 'Metal',
  酉: 'Metal',
  戌: 'Earth',
  亥: 'Water',
};

export const PILLAR_STAGE_META = {
  year: {
    key: 'year',
    english: 'Year',
    chinese: '年柱',
    stageTitle: 'Early Bond',
    stageChinese: '幼年',
    ageRange: 'First 10 months',
    themes: 'early temperament, first attachment patterns, instinctive reactions, comfort needs',
  },
  month: {
    key: 'month',
    english: 'Month',
    chinese: '月柱',
    stageTitle: 'Young Growth',
    stageChinese: '壮年',
    ageRange: '1–4 years',
    themes: 'active development, confidence, training style, play style, daily habits',
  },
  day: {
    key: 'day',
    english: 'Day',
    chinese: '日柱',
    stageTitle: 'Core Self',
    stageChinese: '成熟期',
    ageRange: '5–9 years',
    themes: 'stable personality, deeper preferences, emotional rhythm, family bond',
  },
  hour: {
    key: 'hour',
    english: 'Hour',
    chinese: '时柱',
    stageTitle: 'Inner/Senior Nature',
    stageChinese: '晚年',
    ageRange: '10+ years',
    themes: 'older-age tendencies, inner world, comfort rituals, long-term attachment, sensitivity',
  },
};

const PILLAR_ORDER = ['year', 'month', 'day', 'hour'];

function elementTone(element) {
  const tones = {
    Wood: 'curious, growing, and responsive to gentle structure',
    Fire: 'expressive, warm, and drawn to interaction',
    Earth: 'steady, grounding, and comfort-seeking',
    Metal: 'alert, selective, and quietly observant',
    Water: 'sensitive, intuitive, and attuned to mood and environment',
  };
  return tones[element] || 'balanced and adaptable';
}

function buildComboLine(stem, branch) {
  const stemEl = STEM_ELEMENT_EN[stem];
  const branchEl = BRANCH_ELEMENT_EN[branch];
  return `${stem}${branch} · ${stem} ${stemEl} / ${branch} ${branchEl}`;
}

export function buildPillarStages(chart) {
  if (!chart?.pillars) return [];
  return PILLAR_ORDER.map((key) => {
    const meta = PILLAR_STAGE_META[key];
    const { stem, branch } = chart.pillars[key];
    return {
      ...meta,
      stem,
      branch,
      combo: `${stem}${branch}`,
      stemElement: STEM_ELEMENT_EN[stem],
      branchElement: BRANCH_ELEMENT_EN[branch],
      stageLine: `${meta.stageTitle} · ${meta.ageRange}`,
    };
  });
}

export function getOverallStageReading(petName, chart) {
  const name = petName || 'your pet';
  const pillars = buildPillarStages(chart);
  const combos = pillars.map((p) => p.combo).join(' · ');

  return {
    title: 'Overall Bond Pattern',
    subtitle: "How the Four Pillars blend across your pet's life stages",
    age: null,
    combo: null,
    comboDetail: combos,
    body: [
      `Taken together, ${name}'s chart (${combos}) symbolically suggests how personality may unfold from first instincts through mature habits and later sensitivity.`,
      `The Year Pillar (${pillars[0].combo}) may reflect early bonding and comfort needs in the first months. The Month Pillar (${pillars[1].combo}) can echo young growth between 1–4 years — play style, confidence, and daily rhythm.`,
      `The Day Pillar (${pillars[2].combo}) often mirrors the mature self from 5–9 years: steadier preferences and how ${name} relates to family. The Hour Pillar (${pillars[3].combo}) may hint at inner, senior nature from 10+ years — rituals, quiet attachment, and what soothes over time.`,
      'This is a symbolic life-stage reading inspired by BaZi, not a medical or behavioral guarantee. Tap any pillar above to explore one stage in more detail.',
    ].join('\n\n'),
  };
}

function stageIntro(meta, petName) {
  return `${petName}'s ${meta.english} Pillar (${meta.chinese}) for ${meta.stageTitle} · ${meta.stageChinese} symbolically maps to ${meta.ageRange.toLowerCase()}.`;
}

export function getPillarStageReading(pillarKey, petName, chart) {
  const meta = PILLAR_STAGE_META[pillarKey];
  const { stem, branch } = chart.pillars[pillarKey];
  const stemEl = STEM_ELEMENT_EN[stem];
  const branchEl = BRANCH_ELEMENT_EN[branch];
  const name = petName || 'Your pet';
  const combo = `${stem}${branch}`;
  const stemTone = elementTone(stemEl);
  const branchTone = elementTone(branchEl);

  const shared = {
    title: `${meta.stageTitle} · ${meta.stageChinese}`,
    subtitle: meta.english + ' Pillar · ' + meta.chinese,
    age: meta.ageRange,
    combo,
    comboDetail: buildComboLine(stem, branch),
  };

  if (pillarKey === 'year') {
    return {
      ...shared,
      body: [
        stageIntro(meta, name),
        `${combo} pairs ${stem} ${stemEl} with ${branch} ${branchEl}. In early life this may show a first impression that is ${stemTone}, while instinctive reactions can also be ${branchTone}.`,
        `${name} may seek reassurance through familiar scents, voices, and routines in the first months. Attachment patterns suggested here can reflect how quickly they warm up, startle, or settle — not as fixed traits, but as early symbolic tones.`,
        'Use this as a gentle lens on first bonding, not a diagnosis of temperament or health.',
      ].join('\n\n'),
    };
  }

  if (pillarKey === 'month') {
    return {
      ...shared,
      body: [
        stageIntro(meta, name),
        `${combo} highlights young growth energy: ${stem} ${stemEl} over ${branch} ${branchEl}. Activity and confidence may read as ${stemTone}, while play and habit-building can feel ${branchTone}.`,
        `Between 1–4 years, ${name} may show how they explore, learn boundaries, and repeat daily patterns. Training style and play style suggested here can reflect whether they prefer structure, novelty, calm games, or lively engagement.`,
        'This stage reading is symbolic — it does not predict obedience, aggression, or medical outcomes.',
      ].join('\n\n'),
    };
  }

  if (pillarKey === 'day') {
    return {
      ...shared,
      body: [
        stageIntro(meta, name),
        `${combo} centers the mature self: ${stem} ${stemEl} with ${branch} ${branchEl}. Core personality may settle into something ${stemTone}, while emotional rhythm and family bond can be ${branchTone}.`,
        `From 5–9 years, ${name} may express clearer likes and dislikes — who they shadow, how they rest, and what restores them after stimulation. This pillar can reflect steadier habits and how they hold their place in the home.`,
        'Treat this as reflective symbolism about mature preferences, not a guarantee of behavior.',
      ].join('\n\n'),
    };
  }

  return {
    ...shared,
    body: [
      stageIntro(meta, name),
      `${combo} (${stem} ${stemEl} / ${branch} ${branchEl}) may symbolize inner and senior nature from 10+ years onward.`,
      `Older-age comfort needs can lean ${branchTone}; the private inner world may feel ${stemTone}. Long-term attachment, quiet rituals, and sensitivity to change are common themes here.`,
      `${name} may cherish predictable warmth, softer pacing, and familiar companionship. This Hour Pillar reading is especially approximate if birth time was estimated.`,
      'It is a symbolic lens on later life, not medical or end-of-life guidance.',
    ].join('\n\n'),
  };
}

export function getStageReadingContent(selectedPillar, petName, chart) {
  if (!selectedPillar) {
    return getOverallStageReading(petName, chart);
  }
  return getPillarStageReading(selectedPillar, petName, chart);
}
