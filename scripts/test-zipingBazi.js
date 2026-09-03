/**
 * Run: node scripts/test-zipingBazi.js
 */
const path = require('path');

// Minimal ESM interop for Expo project without "type": "module"
async function main() {
  const modPath = path.join(__dirname, '../src/utils/zipingBazi.js');
  const { computeZipingBazi, __test__ } = await import(
    `file://${modPath}`
  );

  console.log('--- Day pillar engine self-check ---');
  console.log(__test__.validateDayPillarEngine());

  console.log('\n--- Sample: female, 2008-02-22, 17:05, Chengdu ---');
  const result = computeZipingBazi({
    birthDate: '2008-02-22',
    birthTime: '17:05',
    birthLocation: 'Chengdu, China',
    gender: 'female',
    birthTimeWasDefaulted: false,
    birthLocationWasDefaulted: false,
  });

  console.log(JSON.stringify(result, null, 2));

  const assert = (cond, msg) => {
    if (!cond) {
      console.error('ASSERT FAIL:', msg);
      process.exitCode = 1;
    }
  };

  assert(result.success === true, 'expected success');
  assert(result.pillars.day.stem === '壬' && result.pillars.day.branch === '辰', 'day pillar');
  assert(result.pillars.hour.stem === '己' && result.pillars.hour.branch === '酉', 'hour pillar');
  assert(result.pillars.year.stem === '戊' && result.pillars.year.branch === '子', 'year pillar');
  assert(result.pillars.month.stem === '甲' && result.pillars.month.branch === '寅', 'month pillar');
  assert(__test__.getHourBranch(17, 5) === '酉', '17:05 hour branch');

  if (process.exitCode === 1) {
    console.error('\nSome assertions failed.');
  } else {
    console.log('\nAll assertions passed.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
