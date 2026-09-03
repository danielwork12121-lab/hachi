import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { colors } from '../constants/colors';

export function PremiumFormPanel({ children, style }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.glassPanel,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.28)',
        backdropFilter: 'blur(12px)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
        elevation: 4,
      },
    }),
  },
});
