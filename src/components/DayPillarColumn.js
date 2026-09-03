import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { colors } from '../constants/colors';
import { sansFont } from '../constants/typography';
import { PillarGlyphsStack } from './PillarGlyphsStack';

const TOOLTIP_TEXT = 'Day Pillar represents the core personality.';

function CornerAccent({ style }) {
  return <View style={[styles.cornerAccent, style]} />;
}

export function DayPillarColumn({ stage, selected, onPress, isWide = false }) {
  const [hovered, setHovered] = useState(false);
  const showTooltip = hovered && Platform.OS === 'web';

  const webHoverHandlers =
    Platform.OS === 'web'
      ? {
          onMouseEnter: () => setHovered(true),
          onMouseLeave: () => setHovered(false),
        }
      : {};

  return (
    <View
      style={[styles.wrap, isWide && styles.wrapWide, showTooltip && styles.wrapHover]}
      {...webHoverHandlers}
    >
      {showTooltip ? (
        <View
          style={[
            styles.tooltip,
            isWide ? styles.tooltipSide : styles.tooltipAbove,
          ]}
          pointerEvents="none"
        >
          <Text style={styles.tooltipText}>{TOOLTIP_TEXT}</Text>
        </View>
      ) : null}

      <View style={styles.radialGlow} pointerEvents="none" />

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.outerFrame,
          selected && styles.outerFrameSelected,
          pressed && styles.outerFramePressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`Day pillar ${stage.combo}, core personality`}
      >
        <View style={styles.innerFrame} pointerEvents="none">
          <View style={styles.textureWash} pointerEvents="none" />
          <CornerAccent style={styles.cornerTL} />
          <CornerAccent style={styles.cornerTR} />
          <CornerAccent style={styles.cornerBL} />
          <CornerAccent style={styles.cornerBR} />
          <View style={styles.midRuleTop} pointerEvents="none" />
          <View style={styles.midRuleBottom} pointerEvents="none" />

          <View style={styles.haloWrap} pointerEvents="none">
            <View style={styles.haloOuter} />
            <View style={styles.haloInner} />
          </View>

          <View style={styles.glyphLayer}>
            <PillarGlyphsStack
              stage={stage}
              supportingLine="Core Self"
              englishEmphasis={selected}
              isCore
              isWide={isWide}
              pillarKey="day"
            />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1.12,
    minWidth: 0,
    position: 'relative',
    overflow: 'visible',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  wrapWide: {
    flex: 1.18,
    maxWidth: 220,
  },
  wrapHover: {
    zIndex: 40,
  },
  tooltip: {
    zIndex: 50,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#050810',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 98, 0.55)',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(0,0,0,0.65)',
      },
    }),
  },
  tooltipSide: {
    position: 'absolute',
    top: 32,
    left: '100%',
    marginLeft: 14,
    width: 188,
  },
  tooltipAbove: {
    position: 'absolute',
    bottom: '100%',
    left: 4,
    right: 4,
    marginBottom: 10,
  },
  tooltipText: {
    fontFamily: sansFont,
    fontSize: 12,
    lineHeight: 17,
    color: '#f8f6f2',
    letterSpacing: 0.15,
  },
  radialGlow: {
    position: 'absolute',
    top: '6%',
    left: '2%',
    right: '2%',
    bottom: '2%',
    borderRadius: 18,
    backgroundColor: 'rgba(132, 186, 232, 0.06)',
    ...Platform.select({
      web: { filter: 'blur(18px)' },
    }),
  },
  outerFrame: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 98, 0.42)',
    padding: 3,
    backgroundColor: 'rgba(16, 12, 6, 0.55)',
    ...Platform.select({
      web: {
        boxShadow:
          'inset 0 0 0 1px rgba(226, 200, 122, 0.14), 0 8px 28px rgba(0,0,0,0.38)',
      },
    }),
  },
  outerFrameSelected: {
    borderColor: 'rgba(201, 169, 98, 0.58)',
  },
  outerFramePressed: {
    opacity: 0.97,
  },
  innerFrame: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 98, 0.26)',
    paddingVertical: 20,
    paddingHorizontal: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(18, 24, 40, 0.92)',
    minHeight: 172,
  },
  textureWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(201, 169, 98, 0.035)',
    ...Platform.select({
      web: {
        backgroundImage:
          'radial-gradient(ellipse at 50% 30%, rgba(201, 169, 98, 0.11) 0%, transparent 58%)',
      },
    }),
  },
  midRuleTop: {
    position: 'absolute',
    top: 10,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: 'rgba(201, 169, 98, 0.15)',
  },
  midRuleBottom: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: 'rgba(201, 169, 98, 0.12)',
  },
  cornerAccent: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderColor: 'rgba(201, 169, 98, 0.5)',
    zIndex: 2,
  },
  cornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  haloWrap: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
  },
  haloOuter: {
    position: 'absolute',
    width: 92,
    height: 112,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(168, 139, 74, 0.3)',
    backgroundColor: 'rgba(201, 169, 98, 0.04)',
  },
  haloInner: {
    position: 'absolute',
    width: 72,
    height: 92,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(226, 200, 122, 0.22)',
  },
  glyphLayer: {
    zIndex: 1,
    width: '100%',
  },
});
