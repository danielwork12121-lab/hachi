import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { colors } from '../constants/colors';

const INSIGHTS = [
  'Today, your pet may be especially tuned to your mood. A calm moment together can deepen your bond.',
  'Small rituals — the same walk, the same spot on the couch — matter more than you think to your pet.',
  'Your pet doesn\'t just want your attention; they feel safer when you\'re near. Remember that today.',
  'Every pet has a hidden need to feel understood. Today, watch how they respond when you speak to them.',
  'The bond you share is unique. No one else has quite the same connection with your pet.',
];

export function DailyInsight() {
  const insight = INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)];
  return (
    <Card variant="glass" style={styles.card}>
      <Text style={styles.label}>Daily insight</Text>
      <Text style={styles.text}>{insight}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.goldMuted,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
