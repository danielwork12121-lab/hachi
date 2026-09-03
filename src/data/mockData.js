/**
 * Sample pets and default preview data for development and testing.
 */

export const SAMPLE_PETS = [
  {
    id: '1',
    petName: 'Luna',
    species: 'cat',
    petBirthDate: new Date(2022, 2, 15), // March 15, 2022
    petBirthTime: 14, // 2 PM - Earth bonding
    ownerName: 'Alex',
    ownerBirthDate: new Date(1990, 6, 20), // July 20
    ownerBirthTime: 9,
  },
  {
    id: '2',
    petName: 'Max',
    species: 'dog',
    petBirthDate: new Date(2020, 10, 8), // Nov 8
    petBirthTime: 7, // Wood bonding
    ownerName: 'Jordan',
    ownerBirthDate: new Date(1988, 0, 14), // Jan 14
    ownerBirthTime: null,
  },
];

/**
 * Default form values for quick testing (optional).
 */
export const DEFAULT_PREVIEW = {
  petName: 'Luna',
  species: 'dog',
  petBirthDate: new Date(2022, 2, 15),
  petBirthTime: 14,
  ownerName: 'Alex',
  ownerBirthDate: new Date(1990, 6, 20),
  ownerBirthTime: null,
};
