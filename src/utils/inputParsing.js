export const DATE_HELPER_TEXT = 'Use YYYY-MM-DD';
export const TIME_HELPER_TEXT = 'Optional · leave blank to use 12:00 PM';
export const LOCATION_HELPER_TEXT =
  'Optional · leave blank to use Chengdu, China / Beijing Time';
export const DEFAULT_TIME_STRING = '12:00';

export function formatDateYYYYMMDD(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateYYYYMMDD(input, { minimumDate, maximumDate } = {}) {
  const text = typeof input === 'string' ? input.trim() : '';
  if (!text) {
    return { ok: false, value: null, error: 'Birth date is required.' };
  }

  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return { ok: false, value: null, error: 'Enter birth date as YYYY-MM-DD.' };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  const isCalendarDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isCalendarDate) {
    return { ok: false, value: null, error: 'Enter a valid calendar date.' };
  }

  if (minimumDate && date < startOfDay(minimumDate)) {
    return { ok: false, value: null, error: 'Birth date is earlier than allowed.' };
  }

  if (maximumDate && date > startOfDay(maximumDate)) {
    return { ok: false, value: null, error: 'Birth date cannot be in the future.' };
  }

  return { ok: true, value: date, error: '' };
}

export function formatTimeHHMM(value) {
  const normalized = normalizeTimeParts(value);
  if (!normalized) return '';
  return `${String(normalized.hour).padStart(2, '0')}:${String(
    normalized.minute
  ).padStart(2, '0')}`;
}

export function formatTimeDisplay(value) {
  const normalized = normalizeTimeParts(value);
  if (!normalized) return '';
  const hour12 = normalized.hour % 12 || 12;
  const ampm = normalized.hour < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(normalized.minute).padStart(2, '0')} ${ampm}`;
}

export function parseOptionalTime(input) {
  const text = typeof input === 'string' ? input.trim() : '';
  if (!text) {
    return { ok: true, value: null, defaulted: true, error: '' };
  }

  const match = text
    .toLowerCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/);

  if (!match) {
    return { ok: false, value: null, defaulted: false, error: 'Enter a valid time, or leave blank.' };
  }

  let hour = Number(match[1]);
  const minute = match[2] == null ? 0 : Number(match[2]);
  const meridiem = match[3]?.replace(/\./g, '');

  if (minute < 0 || minute > 59) {
    return { ok: false, value: null, defaulted: false, error: 'Minutes must be between 00 and 59.' };
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) {
      return { ok: false, value: null, defaulted: false, error: 'Use 1-12 with AM or PM.' };
    }
    if (meridiem === 'am') hour = hour === 12 ? 0 : hour;
    if (meridiem === 'pm') hour = hour === 12 ? 12 : hour + 12;
  } else if (hour < 0 || hour > 23) {
    return { ok: false, value: null, defaulted: false, error: 'Use a 24-hour time from 0 to 23.' };
  }

  return {
    ok: true,
    value: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    defaulted: false,
    error: '',
  };
}

function normalizeTimeParts(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && value >= 0 && value <= 23) {
    return { hour: Math.floor(value), minute: 0 };
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { hour: value.getHours(), minute: value.getMinutes() };
  }
  if (typeof value === 'string') {
    const [hourText, minuteText = '0'] = value.split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
  }
  if (typeof value === 'object') {
    const hour = value.hour ?? value.hours;
    const minute = value.minute ?? value.minutes ?? 0;
    if (Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
  }
  return null;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
