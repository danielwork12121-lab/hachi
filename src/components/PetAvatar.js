import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { normalizeSpecies } from '../constants/petSpecies';
import { hanziFont } from '../constants/typography';

const DOG_SOURCE = require('../../assets/hachi-mascot.png');
const DOG_ASPECT = 831 / 605;

/**
 * Species-aware pet portrait for reading screens.
 * Dog uses the landing-page mascot PNG; cat/other use mystical placeholders.
 */
export function PetAvatar({ species, size = 96 }) {
  const kind = normalizeSpecies(species);

  if (kind === 'dog') {
    const width = size;
    const height = size * DOG_ASPECT;
    return (
      <View style={[styles.dogFrame, { width, height }]}>
        <Image
          source={DOG_SOURCE}
          style={{ width, height }}
          resizeMode="contain"
          accessibilityLabel="Pet portrait"
        />
      </View>
    );
  }

  const placeholderSize = size;
  const isCat = kind === 'cat';

  return (
    <View
      style={[
        styles.placeholder,
        { width: placeholderSize, height: placeholderSize },
      ]}
    >
      <Text style={styles.placeholderGlyph}>{isCat ? '猫' : '✦'}</Text>
      <Text style={styles.placeholderSub}>
        {isCat ? 'Feline spirit' : 'Sacred companion'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dogFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: 'rgba(22, 34, 56, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  placeholderGlyph: {
    fontFamily: hanziFont,
    fontSize: 40,
    color: colors.gold,
    lineHeight: 48,
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
});
