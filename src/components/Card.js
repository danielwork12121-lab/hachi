import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export function Card({ children, variant = 'dark', style, ...rest }) {
  const variantStyle =
    variant === 'cream' ? styles.cream : variant === 'glass' ? styles.glass : styles.dark;

  return (
    <View style={[styles.card, variantStyle, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  dark: {
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  glass: {
    backgroundColor: colors.glassPanel,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 3,
  },
  cream: {
    backgroundColor: colors.cardCream,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
});
