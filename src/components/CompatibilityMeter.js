import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { Card } from './Card';
import { colors } from '../constants/colors';
import { serifFont, sansFont } from '../constants/typography';

export function CompatibilityMeter({ score, label, style }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: clampedScore / 100,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clampedScore]);

  const width = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Card variant="glass" style={[styles.card, style]}>
      <Text style={styles.eyebrow}>Bond harmony</Text>
      <View style={styles.header}>
        <Text style={styles.score}>{clampedScore}%</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  eyebrow: {
    fontFamily: sansFont,
    fontSize: 11,
    fontWeight: '600',
    color: colors.goldMuted,
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  score: {
    fontFamily: serifFont,
    fontSize: 36,
    fontWeight: '600',
    color: colors.gold,
    lineHeight: 42,
  },
  label: {
    fontFamily: sansFont,
    fontSize: 15,
    color: colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
    lineHeight: 22,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(15, 23, 41, 0.65)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.chipBorder,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.jade,
    ...Platform.select({
      web: {
        backgroundImage: `linear-gradient(90deg, ${colors.jadeMuted} 0%, ${colors.jade} 100%)`,
      },
    }),
  },
});
