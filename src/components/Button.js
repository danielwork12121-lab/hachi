import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { colors } from '../constants/colors';
import { sansFont } from '../constants/typography';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const [hovered, setHovered] = useState(false);
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isWeb = Platform.OS === 'web';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      onHoverIn={isWeb ? () => setHovered(true) : undefined}
      onHoverOut={isWeb ? () => setHovered(false) : undefined}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isPrimary && isWeb && styles.primaryWeb,
        isPrimary && isWeb && hovered && styles.primaryWebHover,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && isPrimary && styles.primaryPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.textDark : colors.gold} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.textPrimary,
            isSecondary && styles.textSecondary,
            isGhost && styles.textGhost,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    ...Platform.select({
      web: {
        transitionProperty: 'transform, box-shadow, opacity',
        transitionDuration: '200ms',
        cursor: 'pointer',
      },
    }),
  },
  primary: {
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryWeb: {
    backgroundColor: colors.gold,
    backgroundImage: `linear-gradient(180deg, ${colors.goldLight} 0%, ${colors.gold} 48%, ${colors.goldDeep} 100%)`,
    boxShadow: '0 6px 24px rgba(201, 169, 98, 0.42), 0 0 40px rgba(201, 169, 98, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 235, 0.22)',
  },
  primaryWebHover: {
    boxShadow: '0 8px 32px rgba(201, 169, 98, 0.52), 0 0 48px rgba(201, 169, 98, 0.18)',
    transform: [{ translateY: -1 }],
  },
  primaryPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: sansFont,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textPrimary: {
    color: colors.textDark,
  },
  textSecondary: {
    color: colors.gold,
  },
  textGhost: {
    color: colors.text,
  },
});
