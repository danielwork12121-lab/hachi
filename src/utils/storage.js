/**
 * Simple local storage for last pet profile (MVP).
 * Uses AsyncStorage so it works on device.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_LAST_PET = '@petbazi_last_pet';
const KEY_LAST_READING = '@petbazi_last_reading';

/**
 * Save last pet + owner input for quick return.
 * Shape: { petName, species, petBirthDate, petBirthTime, ownerName, ownerBirthDate, ownerBirthTime }
 */
export async function saveLastPetProfile(data) {
  try {
    const toStore = {
      ...data,
      petBirthDate: data.petBirthDate?.toISOString?.() ?? null,
      ownerBirthDate: data.ownerBirthDate?.toISOString?.() ?? null,
    };
    await AsyncStorage.setItem(KEY_LAST_PET, JSON.stringify(toStore));
  } catch (e) {
    // ignore
  }
}

/**
 * Load last pet profile. Returns null if none or parse error.
 */
export async function loadLastPetProfile() {
  try {
    const raw = await AsyncStorage.getItem(KEY_LAST_PET);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.petBirthDate) data.petBirthDate = new Date(data.petBirthDate);
    if (data.ownerBirthDate) data.ownerBirthDate = new Date(data.ownerBirthDate);
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Save last full reading result for share card / revisit.
 */
export async function saveLastReading(result) {
  try {
    await AsyncStorage.setItem(KEY_LAST_READING, JSON.stringify(result));
  } catch (e) {
    // ignore
  }
}

/**
 * Load last reading. Returns null if none.
 */
export async function loadLastReading() {
  try {
    const raw = await AsyncStorage.getItem(KEY_LAST_READING);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
