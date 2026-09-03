import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { ElementBadge } from '../components/ElementBadge';
import { Button } from '../components/Button';
import { colors } from '../constants/colors';

/**
 * Styled card for Instagram story / screenshot sharing.
 * Includes pet name, main element, bonding style, compatibility, short quote.
 */
export default function ShareCardScreen({ navigation, route }) {
  const { result } = route.params || {};
  if (!result) {
    navigation.goBack();
    return null;
  }

  const { petName, petProfile, compatibility, shareQuote } = result;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.close} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.cardWrapper} collapsable={false}>
          <Card variant="cream" style={styles.shareCard}>
            <Text style={styles.cardAppName}>Hachi</Text>
            <Text style={styles.cardPetName}>{petName}</Text>
            <View style={styles.cardBadges}>
              <ElementBadge element={petProfile.mainElement} size="small" />
              <Text style={styles.cardBonding}>{petProfile.bondingLabel}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Compatibility</Text>
              <Text style={styles.scoreValue}>{compatibility.score}%</Text>
            </View>
            <Text style={styles.cardQuote}>"{shareQuote}"</Text>
            <Text style={styles.cardWatermark}>hachi.app</Text>
          </Card>
        </View>

        <Text style={styles.hint}>Screenshot to share</Text>
        <Button
          title="Done"
          onPress={() => navigation.goBack()}
          variant="primary"
          style={styles.doneBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  closeText: {
    fontSize: 22,
    color: colors.textMuted,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 340,
    marginTop: 24,
    marginBottom: 16,
  },
  shareCard: {
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardAppName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  cardPetName: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  cardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardBonding: {
    fontSize: 13,
    color: colors.jadeMuted,
    fontWeight: '500',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gold,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cardQuote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textDark,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardWatermark: {
    fontSize: 11,
    color: colors.textMuted,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 20,
  },
  doneBtn: {
    minWidth: 160,
  },
});
