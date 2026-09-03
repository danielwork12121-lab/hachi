import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

/** Small L-shaped corner mark for premium report frames. */
export function CornerMark({ corner, tone = 'gold' }) {
  const c = tone === 'silver' ? 'rgba(168, 180, 196, 0.35)' : 'rgba(201, 169, 98, 0.42)';
  return <View style={[styles.mark, cornerStyles[corner], { borderColor: c }]} />;
}

const cornerStyles = {
  tl: { top: 8, left: 8, borderTopWidth: 1, borderLeftWidth: 1 },
  tr: { top: 8, right: 8, borderTopWidth: 1, borderRightWidth: 1 },
  bl: { bottom: 8, left: 8, borderBottomWidth: 1, borderLeftWidth: 1 },
  br: { bottom: 8, right: 8, borderBottomWidth: 1, borderRightWidth: 1 },
};

/**
 * Decorative frame variants — coordinated but distinct per box type.
 */
export function ReportFrame({ variant, children, style }) {
  return (
    <View style={[frameStyles[variant].outer, style]}>
      {variant === 'hero' ? <View style={styles.heroTopRule} pointerEvents="none" /> : null}
      {variant === 'core' ? <View style={styles.coreSideRule} pointerEvents="none" /> : null}
      {variant === 'board' ? (
        <View style={styles.boardInsetLine} pointerEvents="none" />
      ) : null}
      {(variant === 'hero' || variant === 'pillar' || variant === 'core') && (
        <>
          <CornerMark corner="tl" tone={variant === 'pillar' ? 'silver' : 'gold'} />
          <CornerMark corner="tr" tone={variant === 'pillar' ? 'silver' : 'gold'} />
          <CornerMark corner="bl" tone={variant === 'pillar' ? 'silver' : 'gold'} />
          <CornerMark corner="br" tone={variant === 'pillar' ? 'silver' : 'gold'} />
        </>
      )}
      <View style={frameStyles[variant].inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    position: 'absolute',
    width: 12,
    height: 12,
    zIndex: 2,
  },
  heroTopRule: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: 'rgba(201, 169, 98, 0.35)',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    zIndex: 2,
  },
  coreSideRule: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    backgroundColor: 'rgba(201, 169, 98, 0.28)',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    zIndex: 2,
  },
  boardInsetLine: {
    ...StyleSheet.absoluteFillObject,
    margin: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 180, 196, 0.12)',
    zIndex: 0,
  },
});

const frameStyles = {
  hero: {
    outer: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(201, 169, 98, 0.28)',
      padding: 2,
      backgroundColor: 'rgba(14, 20, 34, 0.5)',
      overflow: 'hidden',
      position: 'relative',
    },
    inner: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: 'rgba(168, 180, 196, 0.14)',
      backgroundColor: colors.surfaceElevated,
      overflow: 'hidden',
    },
  },
  board: {
    outer: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: 'rgba(168, 180, 196, 0.2)',
      padding: 3,
      backgroundColor: 'rgba(10, 16, 28, 0.6)',
      position: 'relative',
      overflow: 'hidden',
    },
    inner: {
      borderRadius: 15,
      borderWidth: 1,
      borderColor: 'rgba(201, 169, 98, 0.12)',
      backgroundColor: colors.surfaceElevated,
      overflow: 'hidden',
    },
  },
  pillar: {
    outer: {
      flex: 1,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: 'rgba(168, 180, 196, 0.22)',
      padding: 1,
      backgroundColor: 'rgba(8, 12, 22, 0.65)',
      position: 'relative',
      overflow: 'hidden',
      minWidth: 0,
    },
    inner: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(168, 180, 196, 0.08)',
      backgroundColor: colors.ink,
      overflow: 'hidden',
      alignItems: 'center',
    },
  },
  core: {
    outer: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: 'rgba(201, 169, 98, 0.22)',
      padding: 2,
      backgroundColor: 'rgba(12, 18, 30, 0.55)',
      position: 'relative',
      overflow: 'hidden',
    },
    inner: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(168, 180, 196, 0.12)',
      backgroundColor: colors.surfaceElevated,
      overflow: 'hidden',
      paddingLeft: 4,
    },
  },
};
