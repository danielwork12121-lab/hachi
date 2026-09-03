import { STEM_ELEMENT_EN } from './zipingBazi';

/** Day Master element for hero / core reading display. */
export function getDayMasterElement(chart) {
  const stem = chart?.dayMaster;
  if (!stem) return null;
  return STEM_ELEMENT_EN[stem] ?? null;
}

function parseAttachmentScore(attachmentLevel) {
  const match = String(attachmentLevel || '').match(/(\d)\s*\/\s*5/);
  return match ? Number(match[1]) : null;
}

const ATTACHMENT_BOND_LABELS = {
  5: 'Devoted & close',
  4: 'Warm & attentive',
  3: 'Balanced companion',
  2: 'Gently independent',
  1: 'Calm & self-paced',
};

/**
 * Hero bond chip — aligned with Day Pillar library attachment level.
 */
export function getHeroBondLabel(dayPillarEntry) {
  if (!dayPillarEntry?.attachmentLevel) return null;
  const score = parseAttachmentScore(dayPillarEntry.attachmentLevel);
  if (score != null && ATTACHMENT_BOND_LABELS[score]) {
    return ATTACHMENT_BOND_LABELS[score];
  }
  return `Attachment ${dayPillarEntry.attachmentLevel}`;
}
