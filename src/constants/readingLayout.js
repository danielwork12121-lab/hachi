import { Platform } from 'react-native';

/** Desktop-first reading report width. Mobile falls back via ReadingPageContent. */
export const READING_MAX_WIDTH = 1280;
export const READING_MAX_WIDTH_NARROW = 560;
export const READING_WIDE_BREAKPOINT = 900;

export const READING_PAGE_PADDING_H = 40;
export const READING_PAGE_PADDING_H_MOBILE = 24;

export const readingScrollContent = {
  paddingBottom: 48,
  ...(Platform.OS === 'web' ? { paddingTop: 12 } : { paddingTop: 8 }),
};
