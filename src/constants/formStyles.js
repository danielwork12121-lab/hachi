import { Platform, StyleSheet } from 'react-native';
import { colors } from './colors';
import { sansFont } from './typography';

const inputPaddingV = Platform.OS === 'web' ? 12 : 14;

export const formStyles = StyleSheet.create({
  label: {
    fontFamily: sansFont,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  helper: {
    fontFamily: sansFont,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 8,
    fontStyle: 'italic',
  },
  input: {
    fontFamily: sansFont,
    backgroundColor: colors.glassInput,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingVertical: inputPaddingV,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    ...(Platform.OS === 'web'
      ? {
          outlineStyle: 'solid',
          outlineWidth: 0,
          transitionProperty: 'border-color, box-shadow, background-color',
          transitionDuration: '180ms',
        }
      : {}),
  },
  inputFocused: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(22, 34, 56, 0.85)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 0 3px rgba(201, 169, 98, 0.14)' }
      : {}),
  },
  pickerButton: {
    backgroundColor: colors.glassInput,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingVertical: inputPaddingV,
    paddingHorizontal: 16,
  },
  pickerButtonText: {
    fontFamily: sansFont,
    fontSize: 15,
    color: colors.gold,
    fontWeight: '600',
  },
});
