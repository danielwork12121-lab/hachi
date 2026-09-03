import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** Sparse field — positions kept away from center focus area */
const STARS = [
  { x: 0.07, y: 0.1, size: 2, twinkle: true, delay: 0, sparkle: false },
  { x: 0.18, y: 0.05, size: 1.5, twinkle: false, delay: 0, sparkle: true },
  { x: 0.31, y: 0.14, size: 1.5, twinkle: false, delay: 0, sparkle: false },
  { x: 0.88, y: 0.09, size: 2, twinkle: true, delay: 600, sparkle: false },
  { x: 0.94, y: 0.2, size: 1.5, twinkle: false, delay: 0, sparkle: true },
  { x: 0.76, y: 0.16, size: 1.5, twinkle: false, delay: 0, sparkle: false },
  { x: 0.12, y: 0.28, size: 1.5, twinkle: true, delay: 1200, sparkle: false },
  { x: 0.05, y: 0.42, size: 2, twinkle: false, delay: 0, sparkle: false },
  { x: 0.24, y: 0.72, size: 1.5, twinkle: false, delay: 0, sparkle: false },
  { x: 0.09, y: 0.86, size: 2, twinkle: true, delay: 400, sparkle: false },
  { x: 0.19, y: 0.92, size: 1.5, twinkle: false, delay: 0, sparkle: true },
  { x: 0.82, y: 0.78, size: 2, twinkle: false, delay: 0, sparkle: false },
  { x: 0.91, y: 0.68, size: 1.5, twinkle: true, delay: 900, sparkle: false },
  { x: 0.95, y: 0.88, size: 1.5, twinkle: false, delay: 0, sparkle: false },
  { x: 0.72, y: 0.9, size: 2, twinkle: false, delay: 0, sparkle: true },
  { x: 0.68, y: 0.24, size: 1.5, twinkle: true, delay: 1500, sparkle: false },
  { x: 0.28, y: 0.88, size: 1.5, twinkle: false, delay: 0, sparkle: false },
  { x: 0.86, y: 0.34, size: 1.5, twinkle: false, delay: 0, sparkle: false },
];

const SHOOTING_STARS = [
  {
    startX: SCREEN_W * 0.06,
    startY: SCREEN_H * 0.14,
    driftX: SCREEN_W * 0.28,
    driftY: SCREEN_H * 0.16,
    rotate: '32deg',
    initialDelay: 2200,
    pauseMin: 5200,
    pauseMax: 9200,
  },
  {
    startX: SCREEN_W * 0.78,
    startY: SCREEN_H * 0.11,
    driftX: -SCREEN_W * 0.24,
    driftY: SCREEN_H * 0.14,
    rotate: '-28deg',
    initialDelay: 6800,
    pauseMin: 6000,
    pauseMax: 11000,
  },
];

function TwinkleStar({ left, top, size, delay }) {
  const opacity = useRef(new Animated.Value(0.22)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.18,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        {
          left,
          top,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
        },
      ]}
    />
  );
}

function StaticStar({ left, top, size, sparkle }) {
  if (sparkle) {
    return (
      <Text
        pointerEvents="none"
        style={[
          styles.sparkle,
          {
            left: left - size * 0.5,
            top: top - size * 0.5,
            fontSize: size * 3.2,
          },
        ]}
      >
        ✦
      </Text>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.dot,
        styles.dotStatic,
        {
          left,
          top,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
}

function ShootingStar({ config }) {
  const progress = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);
  const running = useRef(true);

  useEffect(() => {
    const { driftX, driftY, initialDelay, pauseMin, pauseMax } = config;

    const runBurst = () => {
      if (!running.current) return;
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || !running.current) return;
        const pause = pauseMin + Math.random() * (pauseMax - pauseMin);
        timeoutRef.current = setTimeout(runBurst, pause);
      });
    };

    timeoutRef.current = setTimeout(runBurst, initialDelay);

    return () => {
      running.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      progress.stopAnimation();
    };
  }, [config, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, config.driftX],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, config.driftY],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.08, 0.55, 1],
    outputRange: [0, 0.55, 0.35, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.shootingStar,
        {
          left: config.startX,
          top: config.startY,
          opacity,
          transform: [{ translateX }, { translateY }, { rotate: config.rotate }],
        },
      ]}
    >
      <View style={styles.shootingHead} />
      <View style={styles.shootingTail} />
    </Animated.View>
  );
}

export function StarFieldBackground() {
  return (
    <View style={styles.field} pointerEvents="none">
      {STARS.map((star, i) => {
        const left = star.x * SCREEN_W - star.size / 2;
        const top = star.y * SCREEN_H - star.size / 2;
        if (star.twinkle) {
          return (
            <TwinkleStar
              key={`twinkle-${i}`}
              left={left}
              top={top}
              size={star.size}
              delay={star.delay}
            />
          );
        }
        return (
          <StaticStar
            key={`static-${i}`}
            left={left}
            top={top}
            size={star.size}
            sparkle={star.sparkle}
          />
        );
      })}
      {SHOOTING_STARS.map((cfg, i) => (
        <ShootingStar key={`shoot-${i}`} config={cfg} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.star,
  },
  dotStatic: {
    opacity: 0.28,
  },
  sparkle: {
    position: 'absolute',
    color: 'rgba(201, 169, 98, 0.32)',
    opacity: 0.85,
    lineHeight: 14,
  },
  shootingStar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    width: 56,
    height: 4,
  },
  shootingHead: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 248, 235, 0.85)',
    marginRight: 1,
  },
  shootingTail: {
    flex: 1,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'rgba(232, 210, 168, 0.55)',
  },
});
