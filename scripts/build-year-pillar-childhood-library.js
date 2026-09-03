/**
 * One-off build: src/data/Raw/60 pillars-year pillar-childhood stage.docx
 * → src/data/yearPillarChildhoodLibrary.js
 * Run: node scripts/build-year-pillar-childhood-library.js
 */
const fs = require('fs');
const { execSync } = require('child_process');

const DOCX = require('path').join(
  __dirname,
  '../src/data/Raw/60 pillars-year pillar-childhood stage.docx'
);
const OUT = require('path').join(__dirname, '../src/data/yearPillarChildhoodLibrary.js');

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

function parseBody(body) {
  const favoriteToy = sliceBetween(body, 'Favorite toy:', [
    '. As a baby',
    ' As a baby',
    ' Bonds',
    ' Animal mom is',
  ]);

  let bondTiming = '';
  const bondStart = body.indexOf('Bonds');
  if (bondStart !== -1) {
    let end = body.length;
    for (const label of [
      ' Animal mom is',
      ' Animal dad is',
      ' Human owner tends to',
      ' This baby needs',
    ]) {
      const idx = body.indexOf(label, bondStart);
      if (idx !== -1 && idx < end) end = idx;
    }
    bondTiming = body.slice(bondStart, end).trim();
  }

  const animalMom = sliceBetween(body, 'Animal mom is', [
    ' Animal dad is',
    ' Human owner tends to',
    ' This baby needs',
  ]);
  const animalDad = sliceBetween(body, 'Animal dad is', [
    ' Human owner tends to',
    ' This baby needs',
  ]);
  const humanOwner = sliceBetween(body, 'Human owner tends to', [' This baby needs']);
  const needsIdx = body.indexOf('This baby needs');
  const needs =
    needsIdx === -1 ? '' : body.slice(needsIdx + 'This baby needs'.length).trim();

  return {
    reading: body.trim(),
    favoriteToy,
    bondTiming,
    animalMom,
    animalDad,
    humanOwner,
    needs,
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
    'favoriteToy',
    'bondTiming',
    'animalMom',
    'animalDad',
    'humanOwner',
    'needs',
  ];
  const lines = fields.map(
    (f) => `    ${f}: '${escapeJsString(entry[f] || '')}',`
  );
  return lines.join('\n');
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

const bodyLines = keys.map((key) => {
  return `  "${key}": {\n${formatEntry(library[key])}\n  },`;
});

const file = `/**
 * Year Pillar / childhood-stage library — converted from source docx.
 * Source: src/data/Raw/60 pillars-year pillar-childhood stage.docx
 * Do not read .docx at runtime; import YEAR_PILLAR_CHILDHOOD_LIBRARY instead.
 */

export const YEAR_PILLAR_CHILDHOOD_LIBRARY = {
${bodyLines.join('\n')}
};
`;

fs.writeFileSync(OUT, file, 'utf8');

const FIELD_NAMES = [
  'reading',
  'favoriteToy',
  'bondTiming',
  'animalMom',
  'animalDad',
  'humanOwner',
  'needs',
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
