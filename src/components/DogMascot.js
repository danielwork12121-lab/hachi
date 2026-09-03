import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors } from '../constants/colors';

const MASCOT_SOURCE = require('../../assets/hachi-mascot-transparent.png');

const ASPECT = 831 / 605;
const CYCLE_MS = 6400;

function mascotWidth(windowWidth) {
  if (Platform.OS === 'web') {
    return Math.min(150, Math.max(120, windowWidth * 0.28));
  }
  return Math.min(150, Math.max(120, windowWidth * 0.34));
}

/**
 * Transparent PNG mascot with soft glow and calm float + breath.
 */
export function DogMascot({ width: widthProp, style }) {
  const { width: windowWidth } = useWindowDimensions();
  const width = widthProp ?? mascotWidth(windowWidth);
  const height = width * ASPECT;

  const phase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: CYCLE_MS,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [phase]);

  const translateY = phase.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -5, 0],
  });

  const scale = phase.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.98, 1.02, 0.98],
  });

  const glowOpacity = phase.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.32, 0.48, 0.32],
  });

  return (
    <View style={[styles.wrap, { width, height: height + 16 }, style]} pointerEvents="none">
      <Animated.View
        style={[
          styles.glow,
          {
            width: width * 0.72,
            height: width * 0.42,
            bottom: height * 0.08,
            opacity: glowOpacity,
          },
        ]}
      />

      <Animated.View
        style={{
          width,
          height,
          transform: [{ translateY }, { scale }],
        }}
      >
        <Image
          source={MASCOT_SOURCE}
          style={{ width, height }}
          resizeMode="contain"
          accessibilityLabel="Hachi mascot"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  glow: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: colors.glowStrong,
    ...Platform.select({
      web: { filter: 'blur(28px)' },
      ios: {
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
      },
      android: { elevation: 0 },
    }),
  },
});
