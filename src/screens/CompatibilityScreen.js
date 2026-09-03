import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { CompatibilityMeter } from '../components/CompatibilityMeter';
import { CosmicScreenBackdrop } from '../components/CosmicScreenBackdrop';
import { ReadingSectionCard } from '../components/ReadingSectionCard';
import { colors } from '../constants/colors';
import { ScreenContent } from '../components/ScreenContent';
import { scrollContent } from '../constants/layout';
import { serifFont, sansFont } from '../constants/typography';

export default function CompatibilityScreen({ navigation, route }) {
  const { result } = route.params || {};
  if (!result) {
    navigation.replace('Welcome');
    return null;
  }

  const { petName, ownerName, compatibility } = result;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CosmicScreenBackdrop glowY={0.14} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenContent style={styles.content}>
          <Text style={styles.eyebrow}>Bond reading</Text>
          <Text style={styles.names}>
            {petName}
            <Text style={styles.namesAmp}> & </Text>
            {ownerName}
          </Text>
          <Text style={styles.lede}>
            How your elemental patterns meet — and where harmony grows.
          </Text>

          <CompatibilityMeter
            score={compatibility.score}
            label={compatibility.label}
            style={styles.meter}
          />

          <View style={styles.report}>
            <ReadingSectionCard
              label="Why this bond works"
              body={compatibility.explanation}
            />
            <ReadingSectionCard
              label="Relationship advice"
              body={compatibility.advice}
            />
            <ReadingSectionCard
              label="Why your pet may feel attached"
              body={compatibility.whyAttached}
            />
          </View>

          <Button
            title="Share result"
            onPress={() => navigation.navigate('ShareCard', { result })}
            variant="primary"
            style={styles.cta}
          />
          <Button
            title="Back to home"
            onPress={() => navigation.navigate('Welcome')}
            variant="ghost"
            style={styles.ctaGhost}
          />
        </ScreenContent>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, zIndex: 1 },
  scrollContent,
  content: {
    paddingTop: 16,
    paddingBottom: 28,
  },
  eyebrow: {
    fontFamily: sansFont,
    fontSize: 11,
    fontWeight: '600',
    color: colors.goldMuted,
    letterSpacing: 1.4,
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  names: {
    fontFamily: serifFont,
    fontSize: 30,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 10,
  },
  namesAmp: {
    color: colors.goldMuted,
    fontWeight: '400',
  },
  lede: {
    fontFamily: sansFont,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  meter: {
    width: '100%',
  },
  report: {
    marginTop: 4,
    marginBottom: 8,
  },
  cta: { marginTop: 20 },
  ctaGhost: { marginTop: 10 },
});
