/**
 * One-off build: src/data/Raw/younggrowth-60pillars.docx
 * → src/data/monthPillarYoungGrowthLibrary.js
 * Run: node scripts/build-month-pillar-young-growth-library.js
 */
const fs = require('fs');
const { execSync } = require('child_process');

const DOCX = require('path').join(
  __dirname,
  '../src/data/Raw/younggrowth-60pillars.docx'
);
const OUT = require('path').join(
  __dirname,
  '../src/data/monthPillarYoungGrowthLibrary.js'
);

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const KEY_RE = new RegExp(`^[${STEMS}][${BRANCHES}]$`);

function extractDocxParagraphs() {
  const xml = execSync(`unzip -p "${DOCX}" word/document.xml`, { encoding: 'utf8' });
  return xml
    .split(/<w:p[\s>]/)
    .slice(1)
    .map((p) => [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join(''))
    .filter(Boolean);
}

function sliceBetween(text, startLabel, endLabels) {
  const start = text.indexOf(startLabel);
  if (start === -1) return '';
  let from = start + startLabel.length;
  let end = text.length;
  for (const label of endLabels) {
    const idx = text.indexOf(label, from);
    if (idx !== -1 && idx < end) end = idx;
  }
  return text.slice(from, end).trim().replace(/\.\s*$/, '');
}

function extractSentenceStarting(body, prefix) {
  const idx = body.indexOf(prefix);
  if (idx === -1) return '';
  const rest = body.slice(idx);
  const match = rest.match(/^[^.]+\./);
  return match ? match[0].trim() : rest.trim();
}

function parseBody(body) {
  const favoriteActivity = sliceBetween(body, 'Favorite activity:', [
    ' Energy level:',
    ' Attracted to',
  ]);
  const energyLevel = sliceBetween(body, 'Energy level:', [' Attracted to', ' Tries to impress']);
  const attractedTo = extractSentenceStarting(body, 'Attracted to');
  const impressesBy = extractSentenceStarting(body, 'Tries to impress');
  const secretWant = extractSentenceStarting(body, 'Secretly wants');

  return {
    reading: body.trim(),
    favoriteActivity,
    energyLevel,
    attractedTo,
    impressesBy,
    secretWant,
  };
}

function escapeJsString(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n');
}

function formatEntry(entry) {
  const fields = [
    'reading',
    'favoriteActivity',
    'energyLevel',
    'attractedTo',
    'impressesBy',
    'secretWant',
  ];
  return fields
    .map((f) => `    ${f}: '${escapeJsString(entry[f] || '')}',`)
    .join('\n');
}

const paras = extractDocxParagraphs();
const library = {};
const keys = [];

for (let i = 0; i < paras.length; i++) {
  const line = paras[i].trim();
  if (!KEY_RE.test(line)) continue;
  const body = (paras[i + 1] || '').trim();
  keys.push(line);
  library[line] = parseBody(body);
}

const bodyLines = keys.map((key) => `  "${key}": {\n${formatEntry(library[key])}\n  },`);

const file = `/**
 * Month Pillar / Young Growth library — converted from source docx.
 * Source: src/data/Raw/younggrowth-60pillars.docx
 * Do not read .docx at runtime; import MONTH_PILLAR_YOUNG_GROWTH_LIBRARY instead.
 */

export const MONTH_PILLAR_YOUNG_GROWTH_LIBRARY = {
${bodyLines.join('\n')}
};
`;

fs.writeFileSync(OUT, file, 'utf8');

const FIELD_NAMES = [
  'reading',
  'favoriteActivity',
  'energyLevel',
  'attractedTo',
  'impressesBy',
  'secretWant',
];
const missing = {};
for (const k of keys) {
  for (const f of FIELD_NAMES) {
    if (!library[k][f]?.trim()) {
      if (!missing[k]) missing[k] = [];
      missing[k].push(f);
    }
  }
}

console.log(`Wrote ${keys.length} entries → ${OUT}`);
console.log('Missing fields:', Object.keys(missing).length ? missing : '(none)');
