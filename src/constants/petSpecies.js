export const SPECIES_OPTIONS = ['dog', 'cat', 'other'];

export function formatSpeciesLabel(species) {
  if (species === 'dog') return 'Dog';
  if (species === 'cat') return 'Cat';
  return 'Companion';
}

export function speciesKindNoun(species) {
  if (species === 'cat') return 'cat';
  if (species === 'dog') return 'dog';
  return 'companion';
}

export function normalizeSpecies(species) {
  return SPECIES_OPTIONS.includes(species) ? species : 'other';
}
