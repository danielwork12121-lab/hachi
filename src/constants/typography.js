import { Platform } from 'react-native';

export const serifFont =
  Platform.OS === 'web'
    ? 'Georgia, "Noto Serif SC", "Source Han Serif CN", STSong, serif'
    : Platform.OS === 'ios'
      ? 'Georgia'
      : 'serif';

export const hanziFont =
  Platform.OS === 'web'
    ? 'Georgia, "Noto Serif SC", "Source Han Serif CN", STSong, serif'
    : Platform.OS === 'ios'
      ? 'Georgia'
      : 'serif';

export const sansFont = Platform.OS === 'ios' ? 'System' : 'sans-serif';
