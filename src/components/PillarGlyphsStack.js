import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { hanziFont, sansFont, serifFont } from '../constants/typography';
import {
  getBranchElement,
  getKanjiTextStyle,
  getStemKanjiTextStyle,
} from '../utils/pillarElements';

/**
 * Vertical pillar: English → stem → branch → 柱 label → supporting line.
 */
export function PillarGlyphsStack({
  stage,
  supportingLine,
  englishEmphasis = false,
  isCore = false,
  isWide = false,
  pillarKey,
}) {
  const branchEl = getBranchElement(stage.branch);
  const glyphSize = isCore ? (isWide ? 44 : 40) : isWide ? 40 : 36;
  const key = pillarKey ?? stage.key;

  return (
    <View style={styles.stack}>
      <Text
        style={[
          styles.english,
          isWide && styles.englishWide,
          englishEmphasis && styles.englishEmphasis,
          isCore && styles.englishCore,
        ]}
      >
        {stage.english}
      </Text>
      <Text style={getStemKanjiTextStyle(stage.stem, key, glyphSize, glyphSize + 8)}>
        {stage.stem}
      </Text>
      <Text
        style={[
          getKanjiTextStyle(branchEl, glyphSize, glyphSize + 8),
          styles.branchSpacing,
        ]}
      >
        {stage.branch}
      </Text>
      <Text style={[styles.pillarCn, isCore && styles.pillarCnCore]}>{stage.chinese}</Text>
      {supportingLine ? (
        <Text
          style={[
            styles.supporting,
            isWide && styles.supportingWide,
            isCore && styles.supportingCore,
          ]}
          numberOfLines={2}
        >
          {supportingLine}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    alignItems: 'center',
    width: '100%',
  },
  english: {
    fontFamily: sansFont,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1.8,
    marginBottom: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  englishWide: {
    fontSize: 12,
    letterSpacing: 2.2,
    marginBottom: 16,
  },
  englishEmphasis: {
    color: colors.goldMuted,
  },
  englishCore: {
    color: colors.cream,
    fontWeight: '600',
  },
  branchSpacing: {
    marginBottom: 12,
  },
  pillarCn: {
    fontFamily: hanziFont,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.82,
  },
  pillarCnCore: {
    color: colors.goldMuted,
    opacity: 0.95,
  },
  supporting: {
    fontFamily: sansFont,
    fontSize: 9,
    lineHeight: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 4,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  supportingWide: {
    fontSize: 10,
    lineHeight: 15,
  },
  supportingCore: {
    fontFamily: serifFont,
    fontSize: 10,
    color: colors.goldMuted,
    opacity: 0.92,
  },
});
