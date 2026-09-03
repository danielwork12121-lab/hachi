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

  // Regression: early-January dates before that year's own 小寒 (~Jan 5-6)
  // must still land in 子 month, carried over from 大雪 the prior December
  // -- not 丑. (Was wrong for every Jan 1 - 小寒 date before this fix.)
  console.log('\n--- Regression: 2024-01-03 (before 小寒) should be 子 month ---');
  const beforeXiaohan = computeZipingBazi({ birthDate: '2024-01-03', birthTime: '12:00' });
  console.log(beforeXiaohan.pillars.month);
  assert(beforeXiaohan.success === true, 'expected success (before 小寒)');
  assert(beforeXiaohan.pillars.month.branch === '子', '2024-01-03 month branch should be 子 (before 小寒)');

  // Regression: a birth just after a solar-term crossing must flip to the
  // new month immediately, not ~8 hours late. 小寒 2024 falls at roughly
  // 04:44 Beijing time on Jan 6; 05:00 is minutes after it.
  console.log('\n--- Regression: 2024-01-06 05:00 (just after 小寒) should be 丑 month ---');
  const justAfterXiaohan = computeZipingBazi({ birthDate: '2024-01-06', birthTime: '05:00' });
  console.log(justAfterXiaohan.pillars.month);
  assert(justAfterXiaohan.success === true, 'expected success (just after 小寒)');
  assert(justAfterXiaohan.pillars.month.branch === '丑', '2024-01-06 05:00 month branch should be 丑 (just after 小寒, not 8h-delayed 子)');

  // Regression: 23:00-23:59 is the first half of 子 hour (子初), which wraps
  // midnight into 01:00. getHourBranch previously extended the 21:00-23:00
  // (亥) bucket all the way to 23:59, mislabeling this window 亥 instead of
  // 子 -- and since getHourPillar derives the hour *stem* from the branch,
  // the stem was wrong too, not just the branch.
  console.log('\n--- Regression: 23:xx hour branch should be 子, not 亥 ---');
  console.log('23:00 ->', __test__.getHourBranch(23, 0));
  console.log('23:59 ->', __test__.getHourBranch(23, 59));
  console.log('22:59 ->', __test__.getHourBranch(22, 59), '(still 亥, unaffected)');
  assert(__test__.getHourBranch(23, 0) === '子', '23:00 hour branch should be 子');
  assert(__test__.getHourBranch(23, 59) === '子', '23:59 hour branch should be 子');
  assert(__test__.getHourBranch(22, 59) === '亥', '22:59 hour branch should still be 亥');

  // Regression: full hour pillar (stem + branch), not just the branch helper,
  // for a birth in the previously-mislabeled 23:00-23:59 window.
  console.log('\n--- Regression: 2024-06-15 23:30 hour pillar ---');
  const lateNight = computeZipingBazi({ birthDate: '2024-06-15', birthTime: '23:30' });
  console.log(lateNight.pillars.hour);
  assert(lateNight.success === true, 'expected success (23:30 birth)');
  assert(lateNight.pillars.hour.branch === '子', '2024-06-15 23:30 hour branch should be 子');

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
