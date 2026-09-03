import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '../constants/colors';

const SIZE = 56;

export function RitualLoadingRing() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    rotate.start();
    breathe.start();
    return () => {
      rotate.stop();
      breathe.stop();
    };
  }, [spin, pulse]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0.95],
  });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Animated.View
        style={[
          styles.ring,
          {
            opacity,
            transform: [{ rotate }],
          },
        ]}
      />
      <View style={styles.core} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: colors.gold,
    borderRightColor: 'rgba(201, 169, 98, 0.35)',
    borderBottomColor: 'rgba(201, 169, 98, 0.12)',
    borderLeftColor: 'rgba(201, 169, 98, 0.25)',
  },
  core: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    opacity: 0.85,
  },
});
