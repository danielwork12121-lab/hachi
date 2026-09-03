import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { colors } from '../constants/colors';
import { serifFont, sansFont } from '../constants/typography';

export function ReadingSectionCard({ label, body, style }) {
  if (!body) return null;

  return (
    <Card variant="glass" style={[styles.card, style]}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    opacity: 0.7,
  },
  label: {
    fontFamily: serifFont,
    fontSize: 17,
    fontWeight: '600',
    color: colors.gold,
    letterSpacing: 0.3,
  },
  body: {
    fontFamily: sansFont,
    fontSize: 15,
    lineHeight: 26,
    color: colors.textMuted,
  },
});
