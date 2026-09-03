import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { colors } from '../constants/colors';
import { ReportFrame } from './ReportOrnament';
import { PillarGlyphsStack } from './PillarGlyphsStack';

export function ClickablePillarColumn({ stage, selected, onPress, isWide = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && !selected && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${stage.english} pillar ${stage.combo}`}
    >
      <ReportFrame
        variant="pillar"
        style={[
          styles.frame,
          selected && styles.frameSelected,
        ]}
      >
        <View style={[styles.content, isWide && styles.contentWide]}>
          <PillarGlyphsStack
            stage={stage}
            supportingLine={stage.stageLine}
            englishEmphasis={selected}
            isWide={isWide}
            pillarKey={stage.key}
          />
        </View>
      </ReportFrame>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.92,
  },
  frame: {
    minHeight: 168,
  },
  frameSelected: {
    borderColor: 'rgba(201, 169, 98, 0.36)',
    ...Platform.select({
      web: { boxShadow: '0 0 18px rgba(201, 169, 98, 0.1)' },
    }),
  },
  content: {
    paddingVertical: 18,
    paddingHorizontal: 6,
    width: '100%',
    alignItems: 'center',
  },
  contentWide: {
    paddingVertical: 22,
    paddingHorizontal: 8,
    minHeight: 176,
  },
});
