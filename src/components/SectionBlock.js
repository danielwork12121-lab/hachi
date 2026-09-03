import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { sansFont, serifFont } from '../constants/typography';

export function SectionBlock({ title, children, style }) {
  return (
    <View style={[styles.block, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 20,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  body: {
    fontFamily: sansFont,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMuted,
  },
});
