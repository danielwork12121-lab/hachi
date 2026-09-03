/**
 * Simplified Hachi astrology engine (Pet Bazi).
 *
 * This is not classical BaZi (Four Pillars). It blends a light five-element model
 * with Chinese zodiac animals and a 2-year “heavenly stem” style year element
 * cycle so readings stay fun, deterministic, and stable for the same birth inputs.
 *
 * Pillars used in logic:
 * - Month pillar → main UI element (seasonal tone; unchanged for screens).
 * - Day pillar → secondary element (day-of-month cycle).
 * - Year pillar → zodiac animal (12-year cycle, 2020 = Rat) + year element (Metal
 *   in 2020–2021, then Water/Wood/Fire/Earth in 2-year steps).
 * - Hour pillar → bonding style (time-of-day buckets), unchanged.
 *
 * Owner identity elements blend month + day with year element so the year is not
 * ignored. Compatibility scores combine main vs main, secondary vs secondary,
 * optional zodiac harmony/clash, and a small year-element echo — all without
 * Math.random().
 */

import {
  ELEMENTS,
  ELEMENT_ORDER,
  GENERATING,
  CONTROLS,
} from '../constants/elements';

/** Non-enumerable extra fields for computeCompatibility (keeps petProfile JSON/UI clean). */
const PET_PROFILE_ENGINE_META = Symbol('hachiPetProfileMeta');

// --- Chinese zodiac: 2020 = Rat (index 0), forward through 12 animals. ---
const ZODIAC_ANIMALS = [
  'Rat',
  'Ox',
  'Tiger',
  'Rabbit',
  'Dragon',
  'Snake',
  'Horse',
  'Goat',
  'Monkey',
  'Rooster',
  'Dog',
  'Pig',
];

const ZODIAC_TRINES = [
  [0, 4, 8],
  [1, 5, 9],
  [2, 6, 10],
  [3, 7, 11],
];

// Map birth month (1-12) to main element. Spread across 5 elements.
const MONTH_TO_ELEMENT = [
  ELEMENTS.WOOD, // 1
  ELEMENTS.WOOD, // 2
  ELEMENTS.FIRE, // 3
  ELEMENTS.FIRE, // 4
  ELEMENTS.EARTH, // 5
  ELEMENTS.EARTH, // 6
  ELEMENTS.METAL, // 7
  ELEMENTS.METAL, // 8
  ELEMENTS.WATER, // 9
  ELEMENTS.WATER, // 10
  ELEMENTS.WOOD, // 11
  ELEMENTS.WOOD, // 12
];

// Birth time buckets for bonding style (hour 0-23).
const TIME_BUCKETS = [
  { style: 'water', hours: [0, 1, 2, 3, 4, 5, 22, 23] },
  { style: 'wood', hours: [6, 7, 8] },
  { style: 'fire', hours: [9, 10, 11, 12, 13] },
  { style: 'earth', hours: [14, 15, 16, 17] },
  { style: 'metal', hours: [18, 19, 20, 21] },
];

const BONDING_STYLE_LABELS = {
  water: 'Sensitive & Observant',
  wood: 'Curious & Exploratory',
  fire: 'Expressive & Affectionate',
  earth: 'Loyal & Grounding',
  metal: 'Selective & Watchful',
};

const BONDING_STYLE_DESCRIPTIONS = {
  water: 'sensitive, observant, quietly attached',
  wood: 'curious, social, exploratory',
  fire: 'expressive, playful, affectionate',
  earth: 'loyal, stable, grounding',
  metal: 'selective, watchful, disciplined',
};

/**
 * Year element: 2020–2021 Metal, 2022–2023 Water, 2024–2025 Wood, 2026–2027 Fire,
 * 2028–2029 Earth, then cycles every 10 years (two calendar years per element).
 */
function getYearElementFromYear(year) {
  const y = Math.floor(year);
  const pairOffset = Math.floor((y - 2020) / 2);
  const idx = ((pairOffset % 5) + 5) % 5;
  const YEAR_ELEMENT_SEQUENCE = [
    ELEMENTS.METAL,
    ELEMENTS.WATER,
    ELEMENTS.WOOD,
    ELEMENTS.FIRE,
    ELEMENTS.EARTH,
  ];
  return YEAR_ELEMENT_SEQUENCE[idx];
}

/**
 * Chinese zodiac animal from Gregorian year; 2020 maps to Rat.
 */
function getZodiacAnimalFromYear(year) {
  const y = Math.floor(year);
  const idx = ((y - 2020) % 12 + 12) % 12;
  return ZODIAC_ANIMALS[idx];
}

function elementIndex(el) {
  const i = ELEMENT_ORDER.indexOf(el);
  return i >= 0 ? i : 0;
}

/**
 * Blend two elements deterministically (used for owner main/secondary with year).
 */
function blendElementPair(a, b) {
  const idx = (elementIndex(a) + elementIndex(b)) % 5;
  return ELEMENT_ORDER[idx];
}

function clampInt(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function stableChoiceIndex(parts, modulo) {
  const s = parts.join('|');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

/**
 * Classify five-element relationship from perspective of (a vs b) for scoring.
 * Returns: same | generating | generated | controlling | controlled | neutral
 */
function classifyFiveElementPair(petLike, ownerLike) {
  const petEl = petLike;
  const ownerEl = ownerLike;
  if (petEl === ownerEl) return 'same';
  if (GENERATING[ownerEl] === petEl) return 'generating';
  if (GENERATING[petEl] === ownerEl) return 'generated';
  if (CONTROLS[ownerEl] === petEl) return 'controlling';
  if (CONTROLS[petEl] === ownerEl) return 'controlled';
  return 'neutral';
}

const RELATIONSHIP_BASE_SCORE = {
  same: 88,
  generating: 85,
  generated: 83,
  controlling: 67,
  controlled: 65,
  neutral: 74,
};

const RELATIONSHIP_SECONDARY_DELTA = {
  same: 3,
  generating: 2,
  generated: 2,
  controlling: -2,
  controlled: -2,
  neutral: 0,
};

const RELATIONSHIP_YEAR_ELEMENT_DELTA = {
  same: 2,
  generating: 1,
  generated: 1,
  controlling: -1,
  controlled: -1,
  neutral: 0,
};

const BOND_LABELS = {
  same: ['Familiar soul bond', 'Kindred spirit bond'],
  generating: ['Nurturing connection', 'Protective companion bond'],
  generated: ['Inspiring bond', 'Playful emotional match'],
  controlling: ['Grounding soul bond', 'Steady anchor bond'],
  controlled: ['Balancing connection', 'Curious but balancing connection'],
  neutral: ['Harmonious match', 'Gentle harmony'],
};

function zodiacIndexFromString(animal) {
  if (!animal) return -1;
  return ZODIAC_ANIMALS.indexOf(animal);
}

/**
 * Deterministic zodiac modifier between two animals (same, trine, clash).
 */
function getZodiacCompatibilityDelta(petAnimal, ownerAnimal) {
  const ip = zodiacIndexFromString(petAnimal);
  const io = zodiacIndexFromString(ownerAnimal);
  if (ip < 0 || io < 0) return 0;
  if (ip === io) return 4;
  const diff = Math.abs(ip - io);
  if (diff === 6) return -4;
  for (const trio of ZODIAC_TRINES) {
    if (trio.includes(ip) && trio.includes(io)) return 3;
  }
  return 0;
}

/**
 * Get main element from birth month (1-12).
 */
export function getMainElementFromMonth(month) {
  const m = Math.max(1, Math.min(12, Math.floor(month)));
  return MONTH_TO_ELEMENT[m - 1];
}

/**
 * Get secondary element from birth day (1-31), using day mod 5.
 */
export function getSecondaryElementFromDay(day) {
  const d = Math.max(1, Math.min(31, Math.floor(day)));
  const idx = (d - 1) % 5;
  return ELEMENT_ORDER[idx];
}

/**
 * Get bonding style from birth hour (0-23). Returns style key and label.
 * If hour is null/undefined, default to 'earth' (balanced).
 */
export function getBondingStyleFromHour(hour) {
  if (hour == null || hour < 0 || hour > 23) {
    return {
      style: 'earth',
      label: BONDING_STYLE_LABELS.earth,
      description: BONDING_STYLE_DESCRIPTIONS.earth,
    };
  }
  const h = Math.floor(hour);
  for (const bucket of TIME_BUCKETS) {
    if (bucket.hours.includes(h)) {
      return {
        style: bucket.style,
        label: BONDING_STYLE_LABELS[bucket.style],
        description: BONDING_STYLE_DESCRIPTIONS[bucket.style],
      };
    }
  }
  return {
    style: 'earth',
    label: BONDING_STYLE_LABELS.earth,
    description: BONDING_STYLE_DESCRIPTIONS.earth,
  };
}

/**
 * Owner elements from full birthday: month + day pillars blended with year element;
 * also exposes zodiac animal + year element for compatibility.
 */
export function getOwnerElement(birthDate) {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const monthMain = getMainElementFromMonth(month);
  const yearEl = getYearElementFromYear(year);
  const main = blendElementPair(monthMain, yearEl);
  const daySecondary = getSecondaryElementFromDay(day);
  const secondary = blendElementPair(daySecondary, yearEl);
  return {
    main,
    secondary,
    yearElement: yearEl,
    zodiacAnimal: getZodiacAnimalFromYear(year),
  };
}

/**
 * Compatibility between pet main element and owner main element.
 * Score is a deterministic base (relationship only); computeCompatibility adds layers.
 */
export function getCompatibility(petElement, ownerElement) {
  const relationship = classifyFiveElementPair(petElement, ownerElement);
  const score = RELATIONSHIP_BASE_SCORE[relationship];
  const labels = BOND_LABELS[relationship];
  const label =
    labels[stableChoiceIndex([petElement, ownerElement, relationship], labels.length)];
  return { score, relationship, label };
}

/**
 * Resolve bond label to a display string (can be overridden by copy later).
 */
export function getBondLabel(relationship, petName, ownerName) {
  const labels = {
    same: 'Familiar soul bond',
    generating: 'Nurturing connection',
    generated: 'Inspiring bond',
    controlling: 'Grounding soul bond',
    controlled: 'Balancing connection',
    neutral: 'Harmonious match',
  };
  return labels[relationship] || 'Unique bond';
}

/**
 * Full pet profile from inputs. mainElement / secondaryElement stay month+day for UI.
 * Year-only data hangs off PET_PROFILE_ENGINE_META for downstream scoring.
 */
export function computePetProfile(petBirthDate, petBirthHour) {
  const month = petBirthDate.getMonth() + 1;
  const day = petBirthDate.getDate();
  const year = petBirthDate.getFullYear();
  const main = getMainElementFromMonth(month);
  const secondary = getSecondaryElementFromDay(day);
  const bonding = getBondingStyleFromHour(petBirthHour);
  const zodiacAnimal = getZodiacAnimalFromYear(year);
  const yearElement = getYearElementFromYear(year);
  const profile = {
    mainElement: main,
    secondaryElement: secondary,
    bondingStyle: bonding.style,
    bondingLabel: bonding.label,
    bondingDescription: bonding.description,
    zodiacAnimal,
    yearElement,
  };
  Object.defineProperty(profile, PET_PROFILE_ENGINE_META, {
    value: {
      birthYear: year,
      zodiacAnimal,
      yearElement,
    },
    enumerable: false,
  });
  return profile;
}

/**
 * Full compatibility result from pet and owner data.
 */
export function computeCompatibility(petProfile, ownerBirthDate) {
  const owner = getOwnerElement(ownerBirthDate);
  const base = getCompatibility(petProfile.mainElement, owner.main);

  let score = base.score;

  const secRel = classifyFiveElementPair(
    petProfile.secondaryElement,
    owner.secondary
  );
  score += RELATIONSHIP_SECONDARY_DELTA[secRel];

  const meta = petProfile[PET_PROFILE_ENGINE_META];
  if (meta && meta.yearElement && owner.yearElement) {
    const yearRel = classifyFiveElementPair(meta.yearElement, owner.yearElement);
    score += RELATIONSHIP_YEAR_ELEMENT_DELTA[yearRel];
  }

  if (meta && meta.zodiacAnimal && owner.zodiacAnimal) {
    score += getZodiacCompatibilityDelta(meta.zodiacAnimal, owner.zodiacAnimal);
  }

  score = clampInt(score, 52, 97);

  const labels = BOND_LABELS[base.relationship];
  const label =
    labels[
      stableChoiceIndex(
        [
          petProfile.mainElement,
          owner.main,
          petProfile.secondaryElement,
          owner.secondary,
          meta?.zodiacAnimal || '',
          owner.zodiacAnimal || '',
          String(score),
          base.relationship,
        ],
        labels.length
      )
    ];

  return {
    score,
    relationship: base.relationship,
    label,
    ownerElement: owner.main,
  };
}
