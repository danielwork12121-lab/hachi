import { Platform } from 'react-native';
import { ELEMENTS } from '../constants/elements';
import { hanziFont } from '../constants/typography';

/** Heavenly stems → element (Zi Ping). */
const STEM_TO_ELEMENT = {
  甲: ELEMENTS.WOOD,
  乙: ELEMENTS.WOOD,
  丙: ELEMENTS.FIRE,
  丁: ELEMENTS.FIRE,
  戊: ELEMENTS.EARTH,
  己: ELEMENTS.EARTH,
  庚: ELEMENTS.METAL,
  辛: ELEMENTS.METAL,
  壬: ELEMENTS.WATER,
  癸: ELEMENTS.WATER,
};

/** Earthly branches → element (Zi Ping). */
const BRANCH_TO_ELEMENT = {
  寅: ELEMENTS.WOOD,
  卯: ELEMENTS.WOOD,
  巳: ELEMENTS.FIRE,
  午: ELEMENTS.FIRE,
  辰: ELEMENTS.EARTH,
  戌: ELEMENTS.EARTH,
  丑: ELEMENTS.EARTH,
  未: ELEMENTS.EARTH,
  申: ELEMENTS.METAL,
  酉: ELEMENTS.METAL,
  子: ELEMENTS.WATER,
  亥: ELEMENTS.WATER,
};

/**
 * Kanji-only palette — large stem/branch glyphs & combo blocks on PetReading only.
 * Not used for UI chrome (see ELEMENT_COLORS in constants/elements.js).
 */
export const KANJI_ELEMENT_COLORS = {
  [ELEMENTS.WOOD]: '#A4CF4A',
  [ELEMENTS.FIRE]: '#F58782',
  [ELEMENTS.EARTH]: '#FC703B',
  [ELEMENTS.METAL]: '#E8DFB0',
  [ELEMENTS.WATER]: '#55BFEF',
};

/** Pale or warm glyphs on navy — stronger shadow for contrast. */
const LIGHT_KANJI_ELEMENTS = new Set([ELEMENTS.METAL, ELEMENTS.EARTH]);

const KANJI_TEXT_SHADOW_DEFAULT = '0 1px 10px rgba(0, 0, 0, 0.55)';
const KANJI_TEXT_SHADOW_LIGHT =
  '0 1px 12px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 0, 0, 0.4)';

const KANJI_TEXT_SHADOW_GLOW = {
  [ELEMENTS.WOOD]: '0 1px 10px rgba(0, 0, 0, 0.55), 0 0 14px rgba(164, 207, 74, 0.22)',
  [ELEMENTS.FIRE]: '0 1px 10px rgba(0, 0, 0, 0.55), 0 0 12px rgba(245, 135, 130, 0.18)',
  [ELEMENTS.WATER]: '0 1px 10px rgba(0, 0, 0, 0.55), 0 0 14px rgba(85, 191, 239, 0.22)',
};

export function getStemElement(stem) {
  return STEM_TO_ELEMENT[stem] ?? null;
}

export function getBranchElement(branch) {
  return BRANCH_TO_ELEMENT[branch] ?? null;
}

/** Color for Chinese stem/branch characters only. */
export function getElementColor(element) {
  if (!element) return '#F5F0E8';
  return KANJI_ELEMENT_COLORS[element] ?? '#F5F0E8';
}

/** Stem color from stem character → element only (no pillar overrides). */
export function getStemKanjiColor(stem) {
  return getElementColor(getStemElement(stem));
}

function resolveKanjiTextShadow(element, lightOnDark) {
  if (Platform.OS !== 'web') return undefined;
  if (lightOnDark) return KANJI_TEXT_SHADOW_LIGHT;
  return KANJI_TEXT_SHADOW_GLOW[element] ?? KANJI_TEXT_SHADOW_DEFAULT;
}

/** Kanji text style from a resolved color string. */
export function getKanjiTextStyleFromColor(color, fontSize, lineHeight, element = null) {
  const lightOnDark = element != null && LIGHT_KANJI_ELEMENTS.has(element);
  const base = {
    fontFamily: hanziFont,
    fontSize,
    lineHeight,
    color,
    textAlign: 'center',
  };
  const textShadow = resolveKanjiTextShadow(element, lightOnDark);
  if (textShadow) {
    return { ...base, textShadow };
  }
  return base;
}

/** Branch / element-based kanji style. */
export function getKanjiTextStyle(element, fontSize, lineHeight) {
  return getKanjiTextStyleFromColor(
    getElementColor(element),
    fontSize,
    lineHeight,
    element
  );
}

/** Stem kanji style — color from stem element mapping only. */
export function getStemKanjiTextStyle(stem, _pillarKey, fontSize, lineHeight) {
  const element = getStemElement(stem);
  return getKanjiTextStyleFromColor(
    getElementColor(element),
    fontSize,
    lineHeight,
    element
  );
}
