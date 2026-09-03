/**
 * Generates warm, personal interpretation copy for pet reading and compatibility.
 * Uses pet/owner names and elements to feel specific — not generic astrology.
 */

import { ELEMENTS } from '../constants/elements';

const ELEMENT_PERSONALITY_TRAITS = {
  [ELEMENTS.WOOD]: {
    traits: 'growth-oriented, curious, and adaptable',
    needs: 'exploration, variety, and gentle structure',
    hidden: 'a need to feel they are growing with you',
    bondHint: 'thrives when you include them in new experiences',
  },
  [ELEMENTS.FIRE]: {
    traits: 'warm, expressive, and full of spirit',
    needs: 'attention, play, and emotional warmth',
    hidden: 'a deep desire to be your center of joy',
    bondHint: 'gets excited when you come home and seeks your presence for comfort',
  },
  [ELEMENTS.EARTH]: {
    traits: 'steady, loyal, and grounding',
    needs: 'routine, stability, and quiet closeness',
    hidden: 'a need to feel useful and part of your daily life',
    bondHint: 'becomes calm near you and may follow you around for reassurance',
  },
  [ELEMENTS.METAL]: {
    traits: 'focused, discerning, and watchful',
    needs: 'clear boundaries, respect, and predictability',
    hidden: 'a selective trust that makes their loyalty meaningful',
    bondHint: 'watches you closely and reacts to your mood with quiet support',
  },
  [ELEMENTS.WATER]: {
    traits: 'sensitive, intuitive, and emotionally attuned',
    needs: 'calm, safety, and emotional connection',
    hidden: 'a deep sensitivity to your energy and stress',
    bondHint: 'may not just enjoy your attention — they genuinely feel safer when you are near',
  },
};

/**
 * Full-sentence bonding copy per style (pet as grammatical subject).
 */
function bondingParagraph(petName, bondingStyle) {
  const style = bondingStyle || 'earth';
  switch (style) {
    case 'water':
      return `${petName} is deeply sensitive to your emotional presence and often notices when you need comfort.`;
    case 'wood':
      return `${petName} loves to explore with you and feels most connected when you share new moments together.`;
    case 'fire':
      return `${petName} brings playfulness and affection into your bond and thrives on your responsiveness.`;
    case 'metal':
      return `${petName} is selective about who they open up to — and they have chosen you.`;
    case 'earth':
    default:
      return `${petName} seeks routine with you and feels most secure when your presence is steady and predictable.`;
  }
}

/**
 * Build short poetic summary for pet (one or two sentences).
 */
export function getPetSummary(petName, mainElement, secondaryElement, bondingStyle) {
  const main = ELEMENT_PERSONALITY_TRAITS[mainElement];
  const style = bondingStyle || 'earth';
  const bond = bondingParagraph(petName, style);
  const templates = [
    `${petName} carries ${main.traits} energy — ${bond}`,
    `${petName}'s nature blends ${main.traits} with the way ${bond}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Personality section copy.
 */
export function getPersonalityCopy(petName, mainElement, secondaryElement) {
  const main = ELEMENT_PERSONALITY_TRAITS[mainElement];
  const secondary = ELEMENT_PERSONALITY_TRAITS[secondaryElement];
  return `${petName} is ${main.traits}. With a touch of ${secondary.traits}, they bring a balance that makes their presence both comforting and surprising.`;
}

/**
 * Emotional needs section.
 */
export function getEmotionalNeedsCopy(petName, mainElement) {
  const main = ELEMENT_PERSONALITY_TRAITS[mainElement];
  return `${petName} needs ${main.needs}. Meeting these needs helps them feel secure and deepens your connection.`;
}

/**
 * Hidden tendencies section.
 */
export function getHiddenTendenciesCopy(petName, mainElement) {
  const main = ELEMENT_PERSONALITY_TRAITS[mainElement];
  return `Beneath the surface, ${petName} holds ${main.hidden}. Understanding this can help you support them in ways they may not show openly.`;
}

/**
 * How this pet bonds with you.
 */
export function getBondingCopy(petName, bondingStyle) {
  return bondingParagraph(petName, bondingStyle);
}

// --- Compatibility copy ---

const RELATIONSHIP_EXPLANATIONS = {
  same: (petName, ownerName) =>
    `You and ${petName} share similar energetic roots. ${ownerName}, your steady presence mirrors what ${petName} needs — a sense of familiarity and "home" that makes your bond feel natural and easy.`,
  generating: (petName, ownerName) =>
    `Your energy nurtures ${petName}'s spirit. ${ownerName}, you provide the kind of support that helps ${petName} feel safe to be themselves, creating a bond where your pet feels both excited by you and emotionally protected by your presence.`,
  generated: (petName, ownerName) =>
    `${petName}'s energy inspires and uplifts yours. ${ownerName}, this bond is one where your pet often seeks you out not just for comfort but for connection — they feel alive in your company.`,
  controlling: (petName, ownerName) =>
    `Your steady energy gives ${petName}'s spirit a place to settle. ${ownerName}, you offer the grounding that helps your pet feel secure. This can create a bond where ${petName} may follow you around and become calm near you.`,
  controlled: (petName, ownerName) =>
    `${petName} brings a balancing energy to your life. ${ownerName}, your pet may react to your mood and seek to be close when you need them most — a curious but balancing connection.`,
  neutral: (petName, ownerName) =>
    `You and ${petName} share a harmonious match. ${ownerName}, your energies complement each other without conflict, creating a bond where your pet feels attached to you and seeks routine with you.`,
};

const RELATIONSHIP_ADVICE = {
  same: (petName) =>
    `Keep offering ${petName} the consistency they love. Small rituals — same walk time, same cozy spot — deepen your natural fit.`,
  generating: (petName) =>
    `Continue to be the calm, supportive presence ${petName} relies on. Your patience and attention are what make this bond strong.`,
  generated: (petName) =>
    `Let ${petName} lead sometimes — play when they want to play, and give them space when they need to recharge. They'll come back to you.`,
  controlling: (petName) =>
    `Your stability is a gift to ${petName}. Keep boundaries gentle but clear so they feel safe and grounded with you.`,
  controlled: (petName) =>
    `Notice how ${petName} responds to your emotions. They're tuned in; your calm and your joy both matter to them.`,
  neutral: (petName) =>
    `Nurture the daily moments — feeding, walks, quiet time. ${petName} thrives on the simple, steady connection you share.`,
};

const WHY_ATTACHED = {
  same: (petName, ownerName) =>
    `${petName} feels at home with you because your energy feels familiar. They may stick close because you represent safety and routine.`,
  generating: (petName, ownerName) =>
    `${petName} is attached to you because you make them feel seen and safe. Your presence is where they can be themselves.`,
  generated: (petName, ownerName) =>
    `${petName} is drawn to you because you bring out their playful, connected side. They feel more like themselves when you're near.`,
  controlling: (petName, ownerName) =>
    `${petName} may feel attached to you because you provide the grounding they need. You're their anchor.`,
  controlled: (petName, ownerName) =>
    `${petName} stays close because they're tuned into you — they sense your mood and want to be part of your world.`,
  neutral: (petName, ownerName) =>
    `${petName} bonds with you because your energies align without pressure. They choose to be with you.`,
};

export function getCompatibilityExplanation(petName, ownerName, relationship) {
  return RELATIONSHIP_EXPLANATIONS[relationship]?.(petName, ownerName) ?? RELATIONSHIP_EXPLANATIONS.neutral(petName, ownerName);
}

export function getRelationshipAdvice(petName, relationship) {
  return RELATIONSHIP_ADVICE[relationship]?.(petName) ?? RELATIONSHIP_ADVICE.neutral(petName);
}

export function getWhyAttachedCopy(petName, ownerName, relationship) {
  return WHY_ATTACHED[relationship]?.(petName, ownerName) ?? WHY_ATTACHED.neutral(petName, ownerName);
}

/**
 * Short quote for share card (pet + bond focused).
 */
export function getShareQuote(petName, bondingLabel, compatibilityScore) {
  const quotes = [
    `${petName} — a bond that speaks in moments.`,
    `Your connection with ${petName} is one of a kind.`,
    `${petName} & you: ${bondingLabel}.`,
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
