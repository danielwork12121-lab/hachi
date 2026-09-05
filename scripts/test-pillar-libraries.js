/**
 * Verifies the four stem+branch personality libraries (Day, Hour, Month,
 * Year) each cover all 60 valid sexagenary combinations and that every
 * text field the UI actually reads from each library is non-empty.
 *
 * Regression: HOUR_PILLAR_INNER_SELF_LIBRARY was missing "庚午" and "辛未"
 * (58/60 entries) -- any pet whose computed Hour Pillar landed on one of
 * those two combos got a broken-looking stage card: no Greatest
 * Accomplishment / What It Wants You To Know fields, just the "we could
 * not find this Hour Pillar yet" fallback message and the raw combo text.
 * The source docx (src/data/Raw/innerself-60 pillars.docx) itself skips
 * straight from 庚辰 to 辛巳, confirming the gap predates conversion.
 *
 * The required-field lists below previously only checked each library's
 * `reading` field, missing every other field the screens render (e.g.
 * DAY_PILLAR_LIBRARY's `attachmentLevel`/`troublemakingScore` stats card
 * in PetReadingScreen.js, or MONTH/YEAR's five and four extra copy
 * fields in monthPillarYoungGrowthReading.js / yearPillarChildhoodReading.js).
 * A single blank field in any of those would silently render as an empty
 * row instead of failing loudly here, so the lists now mirror exactly
 * what each screen/reading-builder consumes.
 *
 * Run: node scripts/test-pillar-libraries.js
 */
const path = require('path');

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function allSexagenaryCombos() {
  const combos = [];
  for (let i = 0; i < 60; i += 1) {
    combos.push(STEMS[i % 10] + BRANCHES[i % 12]);
  }
  return combos;
}

let failed = false;
const assert = (cond, msg) => {
  if (!cond) {
    console.error('ASSERT FAIL:', msg);
    failed = true;
  }
};

function checkLibraryCoverage(name, library, requiredFields) {
  const combos = allSexagenaryCombos();
  const missing = combos.filter((combo) => !(combo in library));
  console.log(`\n--- ${name}: ${Object.keys(library).length}/60 entries ---`);
  assert(missing.length === 0, `${name} missing combos: ${JSON.stringify(missing)}`);

  const emptyFieldEntries = [];
  for (const combo of combos) {
    const entry = library[combo];
    if (!entry) continue;
    for (const field of requiredFields) {
      if (!entry[field] || !String(entry[field]).trim()) {
        emptyFieldEntries.push(`${combo}.${field}`);
      }
    }
  }
  assert(
    emptyFieldEntries.length === 0,
    `${name} has empty required fields: ${JSON.stringify(emptyFieldEntries)}`
  );
}

async function main() {
  const dayPath = path.join(__dirname, '../src/data/dayPillarLibrary.js');
  const hourPath = path.join(__dirname, '../src/data/hourPillarInnerSelfLibrary.js');
  const monthPath = path.join(__dirname, '../src/data/monthPillarYoungGrowthLibrary.js');
  const yearPath = path.join(__dirname, '../src/data/yearPillarChildhoodLibrary.js');

  const { DAY_PILLAR_LIBRARY } = await import(`file://${dayPath}`);
  const { HOUR_PILLAR_INNER_SELF_LIBRARY } = await import(`file://${hourPath}`);
  const { MONTH_PILLAR_YOUNG_GROWTH_LIBRARY } = await import(`file://${monthPath}`);
  const { YEAR_PILLAR_CHILDHOOD_LIBRARY } = await import(`file://${yearPath}`);

  // Fields below mirror what each screen/reading-builder actually renders:
  // - Day: PetReadingScreen.js CORE_STATS + readingDisplay.js getHeroBondLabel
  //   (attachmentLevel), plus `reading`.
  // - Hour: hourPillarInnerSelfReading.js's fields array + `reading`.
  // - Month: monthPillarYoungGrowthReading.js's fields array + `reading`.
  // - Year: yearPillarChildhoodReading.js's fields array + `reading`.
  checkLibraryCoverage('DAY_PILLAR_LIBRARY', DAY_PILLAR_LIBRARY, [
    'reading',
    'extroversion',
    'likelyCatBreed',
    'likelyDogBreed',
    'troublemakingScore',
    'attachmentLevel',
  ]);
  checkLibraryCoverage('HOUR_PILLAR_INNER_SELF_LIBRARY', HOUR_PILLAR_INNER_SELF_LIBRARY, [
    'reading',
    'greatestAccomplishment',
    'wantsYouToKnow',
  ]);
  checkLibraryCoverage('MONTH_PILLAR_YOUNG_GROWTH_LIBRARY', MONTH_PILLAR_YOUNG_GROWTH_LIBRARY, [
    'reading',
    'favoriteActivity',
    'energyLevel',
    'attractedTo',
    'impressesBy',
    'secretWant',
  ]);
  checkLibraryCoverage('YEAR_PILLAR_CHILDHOOD_LIBRARY', YEAR_PILLAR_CHILDHOOD_LIBRARY, [
    'reading',
    'favoriteToy',
    'animalMom',
    'animalDad',
    'humanOwner',
  ]);

  // Regression: the day pillar's attachmentLevel/troublemakingScore feed a
  // "X/5" score parser (readingDisplay.js parseAttachmentScore); a value in
  // any other shape silently falls back to a raw, unstyled label instead of
  // a proper "n/5" bond chip.
  console.log('\n--- Regression: Day Pillar score fields are all "n/5" ---');
  const combos = allSexagenaryCombos();
  const badScoreFormat = [];
  for (const combo of combos) {
    const entry = DAY_PILLAR_LIBRARY[combo];
    if (!entry) continue;
    if (!/^[1-5]\/5$/.test(entry.attachmentLevel || '')) {
      badScoreFormat.push(`${combo}.attachmentLevel=${entry.attachmentLevel}`);
    }
    if (!/^[1-5]\/5$/.test(entry.troublemakingScore || '')) {
      badScoreFormat.push(`${combo}.troublemakingScore=${entry.troublemakingScore}`);
    }
  }
  assert(
    badScoreFormat.length === 0,
    `DAY_PILLAR_LIBRARY has score fields not shaped like "n/5": ${JSON.stringify(badScoreFormat)}`
  );

  // Regression: the two previously-missing Hour Pillar combos now resolve
  // to real, non-fallback content.
  console.log('\n--- Regression: 庚午 / 辛未 hour-pillar entries exist ---');
  assert('庚午' in HOUR_PILLAR_INNER_SELF_LIBRARY, '庚午 should now be present in HOUR_PILLAR_INNER_SELF_LIBRARY');
  assert('辛未' in HOUR_PILLAR_INNER_SELF_LIBRARY, '辛未 should now be present in HOUR_PILLAR_INNER_SELF_LIBRARY');

  if (failed) {
    console.error('\nSome assertions failed.');
    process.exitCode = 1;
  } else {
    console.log('\nAll assertions passed.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
