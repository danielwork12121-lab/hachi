import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { FeatureChip } from '../components/FeatureChip';
import { WelcomeMascot } from '../components/WelcomeMascot';
import { WelcomeHeroBackdrop } from '../components/WelcomeHeroBackdrop';
import { ScreenContent } from '../components/ScreenContent';
import { colors } from '../constants/colors';
import { scrollContent } from '../constants/layout';
import { serifFont, sansFont } from '../constants/typography';

const FEATURES = ['Four Pillars', 'Five Elements', 'Bond Reading'];

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WelcomeHeroBackdrop />

      <View style={styles.main}>
        <ScreenContent style={styles.hero}>
          <View style={styles.petWrap}>
            <WelcomeMascot />
          </View>

          <Text style={styles.appName}>Hachi</Text>
          <View style={styles.titleAccent} />
          <Text style={styles.tagline}>Chinese astrology for your companion</Text>
          <Text style={styles.description}>
            Discover your pet&apos;s Four Pillars, elemental nature, and hidden bond with you.
          </Text>

          <View style={styles.chips}>
            {FEATURES.map((label) => (
              <FeatureChip key={label} label={label} />
            ))}
          </View>
        </ScreenContent>
      </View>

      <View style={styles.footer}>
        <ScreenContent>
          <Button
            title="Start Reading"
            onPress={() => navigation.navigate('PetInput')}
            variant="primary"
            style={styles.cta}
          />
        </ScreenContent>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scrollContent.paddingHorizontal,
    zIndex: 1,
  },
  hero: {
    alignItems: 'center',
  },
  petWrap: {
    marginBottom: 18,
    alignItems: 'center',
  },
  appName: {
    fontFamily: serifFont,
    fontSize: 48,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
    ...Platform.select({
      web: {
        textShadow: '0 0 48px rgba(201, 169, 98, 0.18)',
      },
      default: {},
    }),
  },
  titleAccent: {
    width: 32,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.gold,
    opacity: 0.55,
    marginBottom: 14,
  },
  tagline: {
    fontFamily: sansFont,
    fontSize: 17,
    fontWeight: '500',
    color: colors.gold,
    marginBottom: 14,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.4,
    maxWidth: 320,
  },
  description: {
    fontFamily: sansFont,
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 340,
    marginBottom: 28,
    letterSpacing: 0.15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 400,
  },
  footer: {
    paddingHorizontal: scrollContent.paddingHorizontal,
    paddingBottom: Platform.OS === 'web' ? 36 : 28,
    zIndex: 1,
  },
  cta: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
});
