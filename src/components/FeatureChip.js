import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../constants/colors';
import { sansFont } from '../constants/typography';

export function FeatureChip({ label }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isWeb = Platform.OS === 'web';
  const active = pressed || (isWeb && hovered);

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={isWeb ? () => setHovered(true) : undefined}
      onHoverOut={isWeb ? () => setHovered(false) : undefined}
      style={({ pressed: p }) => [
        styles.chip,
        (p || active) && styles.chipActive,
        isWeb && hovered && styles.chipHover,
      ]}
      accessibilityRole="text"
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.chipBg,
    ...Platform.select({
      web: {
        transitionProperty: 'background-color, border-color, transform',
        transitionDuration: '180ms',
        cursor: 'default',
      },
    }),
  },
  chipHover: {
    borderColor: 'rgba(201, 169, 98, 0.48)',
    backgroundColor: 'rgba(30, 48, 78, 0.82)',
    ...Platform.select({
      web: { transform: [{ translateY: -1 }] },
    }),
  },
  chipActive: {
    opacity: 0.92,
    borderColor: 'rgba(201, 169, 98, 0.55)',
    backgroundColor: 'rgba(36, 54, 88, 0.88)',
  },
  text: {
    fontFamily: sansFont,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.35,
  },
  textActive: {
    color: colors.text,
  },
});
