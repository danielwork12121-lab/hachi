import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { colors } from '../constants/colors';

/**
 * Five phases / “faces” — order: Metal, Wood, Water, Fire, Earth (五行).
 * Cycles for a subtle fate-reading tile on the loading screen.
 */
const FATE_TILES = [
  { hanzi: '金', label: 'Metal' },
  { hanzi: '木', label: 'Wood' },
  { hanzi: '水', label: 'Water' },
  { hanzi: '火', label: 'Fire' },
  { hanzi: '土', label: 'Earth' },
];

const TILE = 168;
/** One full cube-face turn = 180° on Y; each half is 0→90° and 90→180°, swap at 90° (progress 0.5). */
const HALF_FLIP_MS = 720;
const REST_MS = 1480;
const FLIP_EASING = Easing.bezier(0.42, 0.01, 0.28, 1);

const HALO = 248;
const FLOAT_Y = 6;

const hanziFont =
  Platform.OS === 'web'
    ? 'Georgia, "Noto Serif SC", "Source Han Serif CN", STSong, serif'
    : Platform.OS === 'ios'
      ? 'Georgia'
      : 'serif';

/**
 * Full Y-axis flip (0° → 180°) simulates one cube face rotating away; at 90° (halfway)
 * the glyph swaps so the “back” face reveals the next element, then we snap to 0° so
 * the new face is upright for the next cycle.
 */
export function FateTileSpinner({ style }) {
  const flipProgress = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.35)).current;
  const float = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(0);
  const restTimeoutRef = useRef(null);
  const [index, setIndex] = useState(0);
  const running = useRef(true);

  const rotateY = flipProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [-FLOAT_Y, FLOAT_Y],
  });

  const haloScale = haloPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.06],
  });

  const haloOpacity = haloPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.88],
  });

  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-72, TILE + 72],
  });

  const runFlipCycle = useCallback(() => {
    if (!running.current) return;
    flipProgress.setValue(0);
    Animated.timing(flipProgress, {
      toValue: 0.5,
      duration: HALF_FLIP_MS,
      easing: FLIP_EASING,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished || !running.current) return;
      indexRef.current = (indexRef.current + 1) % FATE_TILES.length;
      setIndex(indexRef.current);
      Animated.timing(flipProgress, {
        toValue: 1,
        duration: HALF_FLIP_MS,
        easing: FLIP_EASING,
        useNativeDriver: true,
      }).start(({ finished: done }) => {
        if (!done || !running.current) return;
        flipProgress.setValue(0);
        restTimeoutRef.current = setTimeout(() => {
          restTimeoutRef.current = null;
          if (running.current) runFlipCycle();
        }, REST_MS);
      });
    });
  }, [flipProgress]);

  useEffect(() => {
    running.current = true;
    const kickoff = setTimeout(runFlipCycle, REST_MS * 0.4);
    return () => {
      running.current = false;
      clearTimeout(kickoff);
      if (restTimeoutRef.current) clearTimeout(restTimeoutRef.current);
      flipProgress.stopAnimation();
    };
  }, [runFlipCycle, flipProgress]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.85,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.35,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [glow]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [float]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(haloPulse, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [haloPulse]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  const { hanzi, label } = FATE_TILES[index];

  const borderOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.48, 1],
  });

  const haloWebExtra =
    Platform.OS === 'web'
      ? {
          boxShadow: '0 0 72px 36px rgba(201, 169, 98, 0.22)',
        }
      : {};

  return (
    <View style={[styles.wrap, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.radialHalo,
          haloWebExtra,
          Platform.OS === 'ios' && styles.radialHaloShadowIOS,
          {
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />
      <Animated.View style={[styles.floatLayer, { transform: [{ translateY }] }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tileGlow,
            {
              opacity: glow,
              borderColor: colors.gold,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.tile,
            {
              backfaceVisibility: 'hidden',
              transform: [{ perspective: 1000 }, { rotateY }],
            },
          ]}
        >
          <View style={styles.borderClip}>
            <Animated.View
              style={[
                styles.tileBorder,
                {
                  borderColor: colors.gold,
                  opacity: borderOpacity,
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shimmerBand,
                {
                  transform: [{ rotate: '-32deg' }, { translateX: shimmerX }],
                },
              ]}
            />
          </View>
          <View style={styles.tileInner}>
            <Text style={styles.hanzi}>{hanzi}</Text>
            <Text style={styles.label}>{label}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: TILE + 32,
    height: TILE + 32 + FLOAT_Y * 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  radialHalo: {
    position: 'absolute',
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
    backgroundColor: 'rgba(201, 169, 98, 0.14)',
  },
  radialHaloShadowIOS: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 40,
  },
  floatLayer: {
    width: TILE + 24,
    height: TILE + 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileGlow: {
    position: 'absolute',
    alignSelf: 'center',
    width: TILE + 18,
    height: TILE + 18,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.glow,
  },
  tile: {
    width: TILE,
    height: TILE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tileBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: colors.backgroundSoft,
  },
  shimmerBand: {
    position: 'absolute',
    top: -48,
    left: 0,
    width: 44,
    height: TILE * 2,
    backgroundColor: 'rgba(255, 232, 190, 0.22)',
  },
  tileInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  hanzi: {
    fontSize: 72,
    lineHeight: 84,
    fontWeight: '300',
    color: colors.text,
    fontFamily: hanziFont,
    textShadowColor: 'rgba(201, 169, 98, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.goldMuted,
  },
});
