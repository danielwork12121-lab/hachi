import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ELEMENT_SYMBOLS, ELEMENT_COLORS } from '../constants/elements';
import { colors } from '../constants/colors';
import { sansFont } from '../constants/typography';

export function ElementBadge({ element, size = 'medium', showSymbol = true, variant = 'default' }) {
  const label = element || '—';
  const symbol = ELEMENT_SYMBOLS[element] || '✨';
  const color = ELEMENT_COLORS[element] || '#8a9bb0';
  const isSmall = size === 'small';
  const isSubtle = variant === 'subtle';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isSubtle ? color + '12' : color + '25',
          borderColor: isSubtle ? color + '30' : color + '55',
        },
        isSmall && styles.small,
        isSubtle && styles.subtle,
      ]}
    >
      {showSymbol && !isSubtle && <Text style={styles.symbol}>{symbol}</Text>}
      {showSymbol && isSubtle && <Text style={styles.symbolSubtle}>{symbol}</Text>}
      <Text
        style={[
          styles.label,
          { color: isSubtle ? colors.textMuted : color },
          isSmall && styles.labelSmall,
          isSubtle && styles.labelSubtle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  small: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  symbol: {
    fontSize: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 13,
  },
  subtle: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  symbolSubtle: {
    fontSize: 14,
    opacity: 0.7,
  },
  labelSubtle: {
    fontFamily: sansFont,
    fontSize: 14,
    fontWeight: '500',
  },
});
