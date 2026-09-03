import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { serifFont, sansFont } from '../constants/typography';

export function FormSection({ title, hint, children }) {
  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.accent} />
        </View>
      ) : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  titleBlock: {
    marginBottom: 6,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 28,
    marginBottom: 8,
  },
  accent: {
    width: 28,
    height: 1,
    backgroundColor: colors.gold,
    opacity: 0.45,
    marginBottom: 4,
  },
  hint: {
    fontFamily: sansFont,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 16,
  },
});
