import { Platform } from 'react-native';

export const CONTENT_MAX_WIDTH = 560;
export const PAGE_PADDING_H = 24;
export const PAGE_PADDING_BOTTOM = 40;

export const contentColumn = {
  width: '100%',
  maxWidth: CONTENT_MAX_WIDTH,
  alignSelf: 'center',
};

export const scrollContent = {
  paddingHorizontal: PAGE_PADDING_H,
  paddingBottom: PAGE_PADDING_BOTTOM,
  ...(Platform.OS === 'web' ? { paddingTop: 8 } : {}),
};
