import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { computePetProfile, computeCompatibility } from '../utils/baziLogic';
import {
  computeZipingBazi,
  birthTimeToHour,
  DEFAULT_BIRTH_LOCATION,
  DEFAULT_BIRTH_TIME,
} from '../utils/zipingBazi';
import {
  getPetSummary,
  getPersonalityCopy,
  getEmotionalNeedsCopy,
  getHiddenTendenciesCopy,
  getBondingCopy,
  getCompatibilityExplanation,
  getRelationshipAdvice,
  getWhyAttachedCopy,
  getShareQuote,
} from '../utils/copyGenerator';
import { saveLastPetProfile, saveLastReading } from '../utils/storage';
import { colors } from '../constants/colors';
import { serifFont, sansFont } from '../constants/typography';
import { CosmicScreenBackdrop } from '../components/CosmicScreenBackdrop';
import { FateTileSpinner } from '../components/FateTileSpinner';
import { RitualLoadingRing } from '../components/RitualLoadingRing';

const LOADING_MESSAGES = [
  'Reading the Four Pillars…',
  'Tracing elemental patterns…',
  'Mapping your bond…',
];

export default function LoadingRevealScreen({ navigation, route }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const params = route.params || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!params.petBirthDate || !params.ownerBirthDate) {
      navigation.replace('Welcome');
      return;
    }
    const petBirthDate = params.petBirthDate instanceof Date
      ? params.petBirthDate
      : new Date(params.petBirthDate);
    const ownerBirthDate = params.ownerBirthDate instanceof Date
      ? params.ownerBirthDate
      : new Date(params.ownerBirthDate);
    if (isNaN(petBirthDate.getTime()) || isNaN(ownerBirthDate.getTime())) {
      navigation.replace('Welcome');
      return;
    }

    const birthTimeWasDefaulted = params.birthTimeWasDefaulted === true;
    const birthLocationWasDefaulted = params.birthLocationWasDefaulted === true;
    const petBirthTime = params.petBirthTime ?? DEFAULT_BIRTH_TIME;
    const petBirthLocation = params.petBirthLocation ?? DEFAULT_BIRTH_LOCATION;
    const petBirthHour = birthTimeToHour(petBirthTime);

    const petProfile = computePetProfile(petBirthDate, petBirthHour);
    const chart = computeZipingBazi({
      birthDate: petBirthDate,
      birthTime: petBirthTime,
      birthLocation: petBirthLocation,
      birthTimeWasDefaulted,
      birthLocationWasDefaulted,
    });
    const compatibility = computeCompatibility(petProfile, ownerBirthDate);

    const petName = params.petName || 'Your pet';
    const ownerName = params.ownerName || 'You';
    const species = params.species || 'dog';

    const result = {
      petName,
      ownerName,
      species,
      chart,
      petProfile: {
        ...petProfile,
        summary: getPetSummary(
          petName,
          petProfile.mainElement,
          petProfile.secondaryElement,
          petProfile.bondingStyle
        ),
        personality: getPersonalityCopy(
          petName,
          petProfile.mainElement,
          petProfile.secondaryElement
        ),
        emotionalNeeds: getEmotionalNeedsCopy(petName, petProfile.mainElement),
        hiddenTendencies: getHiddenTendenciesCopy(petName, petProfile.mainElement),
        bondingCopy: getBondingCopy(petName, petProfile.bondingStyle),
      },
      compatibility: {
        ...compatibility,
        explanation: getCompatibilityExplanation(
          petName,
          ownerName,
          compatibility.relationship
        ),
        advice: getRelationshipAdvice(petName, compatibility.relationship),
        whyAttached: getWhyAttachedCopy(
          petName,
          ownerName,
          compatibility.relationship
        ),
      },
      shareQuote: getShareQuote(petName, compatibility.label, compatibility.score),
    };

    const delay = 3500;
    const t = setTimeout(() => {
      saveLastPetProfile({
        petName: params.petName,
        species,
        petBirthDate,
        petBirthTime: petBirthTime,
        petBirthLocation,
        ownerName: params.ownerName,
        ownerBirthDate,
        ownerBirthTime: params.ownerBirthTime,
      }).catch(() => {});
      saveLastReading(result).catch(() => {});
      navigation.replace('PetReading', { result });
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CosmicScreenBackdrop glowY={0.32} />
      <View style={styles.content}>
        <Text style={styles.ritualLabel}>Preparing your reading</Text>
        <FateTileSpinner />
        <RitualLoadingRing />
        <Text style={styles.message}>{LOADING_MESSAGES[messageIndex]}</Text>
        <Text style={styles.submessage}>The chart is taking shape…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: 36,
  },
  ritualLabel: {
    fontFamily: serifFont,
    fontSize: 15,
    fontWeight: '600',
    color: colors.goldMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  message: {
    fontFamily: serifFont,
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  submessage: {
    fontFamily: sansFont,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    opacity: 0.85,
  },
});
