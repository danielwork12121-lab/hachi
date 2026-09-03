import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { SPECIES_OPTIONS } from '../constants/petSpecies';
import { colors } from '../constants/colors';
import { sansFont } from '../constants/typography';

export function SpeciesSelector({ value, onChange }) {
  return (
    <View style={styles.row}>
      {SPECIES_OPTIONS.map((species) => (
        <SpeciesOption
          key={species}
          species={species}
          selected={value === species}
          onPress={() => onChange(species)}
        />
      ))}
    </View>
  );
}

function SpeciesOption({ species, selected, onPress }) {
  const [hovered, setHovered] = useState(false);
  const isWeb = Platform.OS === 'web';
  const active = selected || (isWeb && hovered);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={isWeb ? () => setHovered(true) : undefined}
      onHoverOut={isWeb ? () => setHovered(false) : undefined}
      style={[styles.btn, selected && styles.btnSelected, isWeb && hovered && !selected && styles.btnHover]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.text, active && styles.textActive]}>
        {species.charAt(0).toUpperCase() + species.slice(1)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.glassInput,
    alignItems: 'center',
    ...Platform.select({
      web: { transitionProperty: 'border-color, background-color', transitionDuration: '160ms' },
    }),
  },
  btnHover: {
    borderColor: 'rgba(201, 169, 98, 0.45)',
    backgroundColor: 'rgba(30, 48, 78, 0.55)',
  },
  btnSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201, 169, 98, 0.14)',
    ...Platform.select({
      web: { boxShadow: '0 0 20px rgba(201, 169, 98, 0.2)' },
    }),
  },
  text: {
    fontFamily: sansFont,
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
  },
  textActive: {
    color: colors.gold,
    fontWeight: '600',
  },
});
