import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../constants/colors';
import { serifFont, sansFont } from '../constants/typography';

export function ScreenHeader({ title, subtitle, onBack, backLabel = '← Back' }) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <TouchableOpacity style={styles.back} onPress={onBack} accessibilityRole="button">
          <Text style={styles.backText}>{backLabel}</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.accent} />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingRight: 12,
    marginBottom: 4,
  },
  backText: {
    fontFamily: sansFont,
    color: colors.gold,
    fontSize: 16,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 40,
    marginBottom: 8,
  },
  accent: {
    width: 36,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.gold,
    opacity: 0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: sansFont,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 24,
    maxWidth: 360,
  },
});
