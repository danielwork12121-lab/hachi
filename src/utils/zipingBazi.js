/**
 * Traditional Zi Ping BaZi (Four Pillars / Eight Characters).
 * Beijing civil time as entered; no true solar time or longitude correction.
 */
import { parseOptionalTime } from './inputParsing';

export const DEFAULT_BIRTH_TIME = '12:00';
export const DEFAULT_BIRTH_LOCATION = 'Chengdu, China';
export const TIMEZONE_POLICY =
  'Beijing Time / UTC+8, no true solar time correction';

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const STEM_ELEMENT_EN = {
  甲: 'Wood',
  乙: 'Wood',
  丙: 'Fire',
  丁: 'Fire',
  戊: 'Earth',
  己: 'Earth',
  庚: 'Metal',
  辛: 'Metal',
  壬: 'Water',
  癸: 'Water',
};

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

const BRANCH_ZODIAC_EN = {
  子: 'Rat',
  丑: 'Ox',
  寅: 'Tiger',
  卯: 'Rabbit',
  辰: 'Dragon',
  巳: 'Snake',
  午: 'Horse',
  未: 'Goat',
  申: 'Monkey',
  酉: 'Rooster',
  戌: 'Dog',
  亥: 'Pig',
};

/** Solar-term ecliptic longitudes: 小寒 … 冬至 */
const TERM_LONGITUDES = [
  285, 300, 315, 330, 345, 0, 15, 30, 45, 60, 75, 90,
  105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270,
];

/** Month starts at these 节 (term index). Branches: 寅 … 丑 */
const MONTH_START_TERM_INDEX = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 0];
const MONTH_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

/** 甲己 … 戊癸 — stem index at 子时 for 日干起时法 */
const HOUR_STEM_BASE = {
  甲: 0,
  己: 0,
  乙: 2,
  庚: 2,
  丙: 4,
  辛: 4,
  丁: 6,
  壬: 6,
  戊: 8,
  癸: 8,
};

const YEAR_STEM_MONTH_BASE = {
  甲: 2,
  己: 2,
  乙: 4,
  庚: 4,
  丙: 6,
  辛: 6,
  丁: 8,
  壬: 8,
  戊: 0,
  癸: 0,
};

const VALIDATION_ANCHOR = { year: 2008, month: 2, day: 22, stem: '壬', branch: '辰' };

const TERM_APPROX = [
  { month: 1, day: 6 },
  { month: 1, day: 20 },
  { month: 2, day: 4 },
  { month: 2, day: 19 },
  { month: 3, day: 6 },
  { month: 3, day: 21 },
  { month: 4, day: 5 },
  { month: 4, day: 20 },
  { month: 5, day: 6 },
  { month: 5, day: 21 },
  { month: 6, day: 6 },
  { month: 6, day: 22 },
  { month: 7, day: 7 },
  { month: 7, day: 23 },
  { month: 8, day: 8 },
  { month: 8, day: 23 },
  { month: 9, day: 8 },
  { month: 9, day: 23 },
  { month: 10, day: 8 },
  { month: 10, day: 24 },
  { month: 11, day: 8 },
  { month: 11, day: 22 },
  { month: 12, day: 7 },
  { month: 12, day: 22 },
];

function normalizeAngle(deg) {
  let a = deg % 360;
  if (a < 0) a += 360;
  return a;
}

function angleDiff(lon, target) {
  let d = normalizeAngle(lon) - normalizeAngle(target);
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

function gregorianToJdn(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn) {
  const z = Math.floor(jdn + 0.5);
  const f = jdn + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const hours = f * 24;
  const hour = Math.floor(hours);
  const minute = Math.floor((hours - hour) * 60);
  const second = Math.round(((hours - hour) * 60 - minute) * 60);
  return { year, month, day: Math.floor(day), hour, minute, second };
}

function julianCenturies(jd) {
  return (jd - 2451545.0) / 36525.0;
}

/** Apparent geocentric ecliptic longitude of the Sun (degrees). */
function sunApparentLongitude(jd) {
  const T = julianCenturies(jd);
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = (M * Math.PI) / 180;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda =
    trueLong - 0.00569 - 0.00478 * Math.sin((omega * Math.PI) / 180);
  return normalizeAngle(lambda);
}

function jdFromBeijingDateTime(year, month, day, hour, minute, second = 0) {
  const utcHour = hour - 8;
  const utcMs = Date.UTC(year, month - 1, day, utcHour, minute, second);
  return utcMs / 86400000 + 2440587.5;
}

function beijingDateTimeToMs(year, month, day, hour, minute, second = 0) {
  return Date.UTC(year, month - 1, day, hour - 8, minute, second);
}

function jdToBeijingMs(jd) {
  const utcMs = (jd - 2440587.5) * 86400000;
  return utcMs + 8 * 3600000;
}

function findSolarTermJd(year, termIndex) {
  const approx = TERM_APPROX[termIndex];
  let jd = jdFromBeijingDateTime(year, approx.month, approx.day, 12, 0);
  let low = jd - 2;
  let high = jd + 2;
  const target = TERM_LONGITUDES[termIndex];

  for (let i = 0; i < 64; i += 1) {
    const mid = (low + high) / 2;
    const diff = angleDiff(sunApparentLongitude(mid), target);
    if (Math.abs(diff) < 1e-6) return mid;
    if (diff < 0) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

function getSolarTermBeijingMs(year, termIndex) {
  return jdToBeijingMs(findSolarTermJd(year, termIndex));
}

function sexagenaryFromIndex(index) {
  const i = ((index % 60) + 60) % 60;
  return {
    stem: HEAVENLY_STEMS[i % 10],
    branch: EARTHLY_BRANCHES[i % 12],
    index: i,
  };
}

function getDayPillarIndex(year, month, day) {
  const jdn = gregorianToJdn(year, month, day);
  return (jdn + 49) % 60;
}

function validateDayPillarEngine() {
  const idx = getDayPillarIndex(
    VALIDATION_ANCHOR.year,
    VALIDATION_ANCHOR.month,
    VALIDATION_ANCHOR.day
  );
  const { stem, branch } = sexagenaryFromIndex(idx);
  if (stem !== VALIDATION_ANCHOR.stem || branch !== VALIDATION_ANCHOR.branch) {
    return {
      ok: false,
      error: `Day pillar validation failed: ${VALIDATION_ANCHOR.year}-${String(
        VALIDATION_ANCHOR.month
      ).padStart(2, '0')}-${String(VALIDATION_ANCHOR.day).padStart(2, '0')} expected ${
        VALIDATION_ANCHOR.stem
      }${VALIDATION_ANCHOR.branch}, got ${stem}${branch}.`,
    };
  }
  return { ok: true };
}

function parseBirthDate(birthDate) {
  if (birthDate instanceof Date) {
    return {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
    };
  }
  if (typeof birthDate === 'string') {
    const [y, m, d] = birthDate.split(/[-/]/).map((n) => parseInt(n, 10));
    return { year: y, month: m, day: d };
  }
  if (birthDate && typeof birthDate === 'object') {
    return {
      year: birthDate.year,
      month: birthDate.month,
      day: birthDate.day,
    };
  }
  throw new Error('Invalid birthDate');
}

/** Normalize UI birth time (hour number or HH:mm) for BaZi and pet profile. */
export function normalizeBirthTimeForBazi(birthTime) {
  if (birthTime == null) return DEFAULT_BIRTH_TIME;
  if (typeof birthTime === 'number') {
    const h = Math.max(0, Math.min(23, Math.floor(birthTime)));
    return `${String(h).padStart(2, '0')}:00`;
  }
  if (typeof birthTime === 'string') {
    const parsed = parseOptionalTime(birthTime);
    if (parsed.ok) return parsed.value || DEFAULT_BIRTH_TIME;
  }
  if (birthTime instanceof Date) {
    return formatTimeInput({
      hour: birthTime.getHours(),
      minute: birthTime.getMinutes(),
    });
  }
  if (typeof birthTime === 'object') {
    return formatTimeInput({
      hour: birthTime.hour ?? birthTime.hours ?? 12,
      minute: birthTime.minute ?? birthTime.minutes ?? 0,
    });
  }
  return DEFAULT_BIRTH_TIME;
}

/** Hour (0–23) for simplified pet profile / bonding logic. */
export function birthTimeToHour(birthTime) {
  const normalized = normalizeBirthTimeForBazi(birthTime);
  const [h] = normalized.split(':');
  return parseInt(h, 10) || 12;
}

function parseBirthTime(birthTime) {
  if (birthTime == null) return { hour: 12, minute: 0 };
  if (typeof birthTime === 'number') {
    return { hour: Math.floor(birthTime), minute: 0 };
  }
  if (typeof birthTime === 'string') {
    const parts = normalizeBirthTimeForBazi(birthTime).split(':');
    return {
      hour: parseInt(parts[0], 10) || 0,
      minute: parseInt(parts[1], 10) || 0,
    };
  }
  if (birthTime instanceof Date) {
    return { hour: birthTime.getHours(), minute: birthTime.getMinutes() };
  }
  if (typeof birthTime === 'object') {
    return {
      hour: birthTime.hour ?? birthTime.hours ?? 0,
      minute: birthTime.minute ?? birthTime.minutes ?? 0,
    };
  }
  throw new Error('Invalid birthTime');
}

function formatDateInput({ year, month, day }) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatTimeInput({ hour, minute }) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getBaziYear(calendarYear, beijingMs) {
  const liChunMs = getSolarTermBeijingMs(calendarYear, 2);
  if (beijingMs < liChunMs) {
    return calendarYear - 1;
  }
  return calendarYear;
}

function getYearPillar(baziYear) {
  const index = (baziYear - 4) % 60;
  return sexagenaryFromIndex(index);
}

function getMonthBranchIndex(beijingMs, calendarYear) {
  const boundaries = MONTH_START_TERM_INDEX.map((termIdx, monthIdx) => {
    let termYear = calendarYear;
    if (termIdx === 0) {
      termYear = calendarYear + 1;
    }
    return {
      monthIdx,
      ms: getSolarTermBeijingMs(termYear, termIdx),
    };
  }).sort((a, b) => a.ms - b.ms);

  let branchIdx = MONTH_BRANCHES.length - 1;
  for (let i = boundaries.length - 1; i >= 0; i -= 1) {
    if (beijingMs >= boundaries[i].ms) {
      branchIdx = boundaries[i].monthIdx;
      break;
    }
  }
  return branchIdx;
}

function getMonthPillar(yearStem, monthBranchIdx) {
  const branch = MONTH_BRANCHES[monthBranchIdx];
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  const base = YEAR_STEM_MONTH_BASE[yearStem];
  const monthOffset = (branchIndex - 2 + 12) % 12;
  const stemIndex = (base + monthOffset) % 10;
  return { stem: HEAVENLY_STEMS[stemIndex], branch };
}

function getHourBranch(hour, minute) {
  const totalMinutes = hour * 60 + minute;
  if (totalMinutes >= 0 && totalMinutes < 60) return '子';
  if (totalMinutes >= 60 && totalMinutes < 180) return '丑';
  if (totalMinutes >= 180 && totalMinutes < 300) return '寅';
  if (totalMinutes >= 300 && totalMinutes < 420) return '卯';
  if (totalMinutes >= 420 && totalMinutes < 540) return '辰';
  if (totalMinutes >= 540 && totalMinutes < 660) return '巳';
  if (totalMinutes >= 660 && totalMinutes < 780) return '午';
  if (totalMinutes >= 780 && totalMinutes < 900) return '未';
  if (totalMinutes >= 900 && totalMinutes < 1020) return '申';
  if (totalMinutes >= 1020 && totalMinutes < 1140) return '酉';
  if (totalMinutes >= 1140 && totalMinutes < 1260) return '戌';
  if (totalMinutes >= 1260 && totalMinutes <= 1439) return '亥';
  return '子';
}

function getHourPillar(dayStem, hourBranch) {
  const branchIndex = EARTHLY_BRANCHES.indexOf(hourBranch);
  const stemIndex = (HOUR_STEM_BASE[dayStem] + branchIndex) % 10;
  return { stem: HEAVENLY_STEMS[stemIndex], branch: hourBranch };
}

function pillarElementLabel(stem, branch) {
  return `${stem} ${STEM_ELEMENT_EN[stem]} / ${branch} ${BRANCH_ELEMENT_EN[branch]}`;
}

function makePillar(stem, branch, label) {
  return { stem, branch, label };
}

function formatEightCharacters(pillars) {
  return ['year', 'month', 'day', 'hour']
    .map((k) => `${pillars[k].stem}${pillars[k].branch}`)
    .join(' ');
}

/**
 * @param {object} params
 * @param {Date|string|object} params.birthDate
 * @param {Date|string|number|object|null} [params.birthTime]
 * @param {string} [params.birthLocation]
 * @param {string} [params.gender]
 * @param {boolean} [params.birthTimeWasDefaulted]
 * @param {boolean} [params.birthLocationWasDefaulted]
 */
export function computeZipingBazi({
  birthDate,
  birthTime,
  birthLocation,
  gender,
  birthTimeWasDefaulted = false,
  birthLocationWasDefaulted = false,
}) {
  const dayCheck = validateDayPillarEngine();
  if (!dayCheck.ok) {
    return {
      success: false,
      error: dayCheck.error,
      failedStep: 'day-pillar-validation',
    };
  }

  const resolvedBirthTime = normalizeBirthTimeForBazi(birthTime);
  const resolvedBirthLocation =
    birthLocation?.trim() || DEFAULT_BIRTH_LOCATION;

  let dateParts;
  let timeParts;
  try {
    dateParts = parseBirthDate(birthDate);
    timeParts = parseBirthTime(resolvedBirthTime);
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Invalid birth input.',
      failedStep: 'input-parse',
    };
  }

  const beijingMs = beijingDateTimeToMs(
    dateParts.year,
    dateParts.month,
    dateParts.day,
    timeParts.hour,
    timeParts.minute
  );

  const dayIndex = getDayPillarIndex(dateParts.year, dateParts.month, dateParts.day);
  const dayPillar = sexagenaryFromIndex(dayIndex);

  const baziYear = getBaziYear(dateParts.year, beijingMs);
  const yearPillar = getYearPillar(baziYear);

  const monthBranchIdx = getMonthBranchIndex(beijingMs, dateParts.year);
  const monthPillar = getMonthPillar(yearPillar.stem, monthBranchIdx);

  const hourBranch = getHourBranch(timeParts.hour, timeParts.minute);
  const hourPillar = getHourPillar(dayPillar.stem, hourBranch);

  const pillars = {
    year: makePillar(yearPillar.stem, yearPillar.branch, 'Year Pillar'),
    month: makePillar(monthPillar.stem, monthPillar.branch, 'Month Pillar'),
    day: makePillar(dayPillar.stem, dayPillar.branch, 'Day Pillar'),
    hour: makePillar(hourPillar.stem, hourPillar.branch, 'Hour Pillar'),
  };

  const elements = {
    year: pillarElementLabel(pillars.year.stem, pillars.year.branch),
    month: pillarElementLabel(pillars.month.stem, pillars.month.branch),
    day: pillarElementLabel(pillars.day.stem, pillars.day.branch),
    hour: pillarElementLabel(pillars.hour.stem, pillars.hour.branch),
  };

  const calculationNotes = [
    'Year pillar uses Li Chun boundary.',
    'Month pillar uses solar term month boundary.',
    `Day pillar validation passed: ${VALIDATION_ANCHOR.year}-${String(
      VALIDATION_ANCHOR.month
    ).padStart(2, '0')}-${String(VALIDATION_ANCHOR.day).padStart(2, '0')} = ${
      VALIDATION_ANCHOR.stem
    }${VALIDATION_ANCHOR.branch}.`,
    `${formatTimeInput(timeParts)} falls in ${hourBranch} hour.`,
    `${dayPillar.stem} day uses 日干起时法, producing ${hourPillar.stem}${hourPillar.branch} hour.`,
  ];

  if (gender) {
    calculationNotes.push(`Gender recorded (${gender}); not used in pillar calculation.`);
  }
  calculationNotes.push(
    `Birth location: ${resolvedBirthLocation}; ${TIMEZONE_POLICY}.`
  );
  if (birthTimeWasDefaulted) {
    calculationNotes.push(
      `Birth time defaulted to ${DEFAULT_BIRTH_TIME} (not provided).`
    );
  }
  if (birthLocationWasDefaulted) {
    calculationNotes.push(
      `Birth location defaulted to ${DEFAULT_BIRTH_LOCATION} (not provided).`
    );
  }

  return {
    success: true,
    input: {
      birthDate: formatDateInput(dateParts),
      birthTime: formatTimeInput(timeParts),
      birthLocation: resolvedBirthLocation,
      timezonePolicy: TIMEZONE_POLICY,
      birthTimeWasDefaulted,
      birthLocationWasDefaulted,
    },
    pillars,
    eightCharacters: formatEightCharacters(pillars),
    dayMaster: pillars.day.stem,
    zodiac: BRANCH_ZODIAC_EN[pillars.year.branch],
    elements,
    calculationNotes,
  };
}

/** Exported for tests */
export const __test__ = {
  getDayPillarIndex,
  getHourBranch,
  getSolarTermBeijingMs,
  validateDayPillarEngine,
  gregorianToJdn,
};
