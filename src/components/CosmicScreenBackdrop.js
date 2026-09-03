import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { StarFieldBackground } from './StarFieldBackground';
import { colors } from '../constants/colors';

/**
 * Reusable celestial backdrop: star field + soft radial glows.
 */
export function CosmicScreenBackdrop({ glowY = 0.22 }) {
  const { width, height } = useWindowDimensions();
  const glowSize = Math.min(width * 0.85, 360);

  return (
    <View style={styles.root} pointerEvents="none">
      <StarFieldBackground />
      <View
        style={[
          styles.radialGold,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            top: height * glowY,
            marginLeft: -glowSize / 2,
            left: width / 2,
          },
        ]}
      />
      <View
        style={[
          styles.radialNavy,
          {
            width: glowSize * 1.1,
            height: glowSize * 0.5,
            borderRadius: glowSize * 0.35,
            top: height * (glowY + 0.06),
            marginLeft: -(glowSize * 1.1) / 2,
            left: width / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  radialGold: {
    position: 'absolute',
    backgroundColor: colors.glowStrong,
    ...Platform.select({
      web: { filter: 'blur(52px)', opacity: 0.75 },
      default: { opacity: 0.28 },
    }),
  },
  radialNavy: {
    position: 'absolute',
    backgroundColor: colors.glowNavy,
    ...Platform.select({
      web: { filter: 'blur(60px)', opacity: 0.65 },
      default: { opacity: 0.22 },
    }),
  },
});
