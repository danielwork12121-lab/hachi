import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { CosmicScreenBackdrop } from '../components/CosmicScreenBackdrop';
import { DateField } from '../components/DateField';
import { TimeField } from '../components/TimeField';
import { FormSection } from '../components/FormSection';
import { PremiumFormPanel } from '../components/PremiumFormPanel';
import { ScreenContent } from '../components/ScreenContent';
import { ScreenHeader } from '../components/ScreenHeader';
import { SpeciesSelector } from '../components/SpeciesSelector';
import { colors } from '../constants/colors';
import { formStyles } from '../constants/formStyles';
import { scrollContent } from '../constants/layout';
import { sansFont } from '../constants/typography';
import { loadLastPetProfile } from '../utils/storage';
import { DEFAULT_PREVIEW } from '../data/mockData';
import {
  LOCATION_HELPER_TEXT,
  TIME_HELPER_TEXT,
} from '../utils/inputParsing';
import {
  DEFAULT_BIRTH_LOCATION,
  DEFAULT_BIRTH_TIME,
  normalizeBirthTimeForBazi,
} from '../utils/zipingBazi';

export default function PetInputScreen({ navigation }) {
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [petBirthDate, setPetBirthDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 2);
    return d;
  });
  const [petBirthTime, setPetBirthTime] = useState(null);
  const [petBirthLocation, setPetBirthLocation] = useState('');
  const [petBirthDateError, setPetBirthDateError] = useState('');
  const [petBirthTimeError, setPetBirthTimeError] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadLastPetProfile().then((data) => {
      if (data && !loaded) {
        setLoaded(true);
        if (data.petName) setPetName(data.petName);
        if (data.species) setSpecies(data.species);
        if (data.petBirthDate) setPetBirthDate(data.petBirthDate);
        if (data.petBirthTime != null) setPetBirthTime(data.petBirthTime);
        if (data.petBirthLocation) setPetBirthLocation(data.petBirthLocation);
      }
    });
  }, [loaded]);

  const maxDate = new Date();
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 25);

  const canContinue =
    petName.trim().length > 0 &&
    petBirthDate instanceof Date &&
    !Number.isNaN(petBirthDate.getTime()) &&
    !petBirthDateError &&
    !petBirthTimeError;

  const onContinue = () => {
    if (!petBirthDate) {
      setPetBirthDateError('Birth date is required.');
      return;
    }
    if (petBirthTimeError) return;

    const birthTimeWasDefaulted = petBirthTime == null;
    const birthLocationWasDefaulted = petBirthLocation.trim().length === 0;
    const resolvedBirthTime = birthTimeWasDefaulted
      ? DEFAULT_BIRTH_TIME
      : normalizeBirthTimeForBazi(petBirthTime);
    const resolvedBirthLocation = birthLocationWasDefaulted
      ? DEFAULT_BIRTH_LOCATION
      : petBirthLocation.trim();

    navigation.navigate('OwnerInput', {
      petName: petName.trim(),
      species,
      petBirthDate,
      petBirthTime: resolvedBirthTime,
      petBirthLocation: resolvedBirthLocation,
      birthTimeWasDefaulted,
      birthLocationWasDefaulted,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CosmicScreenBackdrop glowY={0.12} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenContent style={styles.content}>
            <ScreenHeader
              title="Your pet"
              subtitle="A few details help Hachi map your companion's Four Pillars chart."
              onBack={() => navigation.goBack()}
            />

            <TouchableOpacity
              style={styles.sampleBtn}
              onPress={() => {
                setPetName(DEFAULT_PREVIEW.petName);
                setSpecies(DEFAULT_PREVIEW.species);
                setPetBirthDate(DEFAULT_PREVIEW.petBirthDate);
                setPetBirthTime(DEFAULT_PREVIEW.petBirthTime ?? null);
                // Loading a sample overwrites the fields directly (bypassing
                // DateField/TimeField's own onValidationChange), so any error
                // left over from a previous invalid keystroke must be cleared
                // here too — otherwise Continue stays disabled on valid data.
                setPetBirthDateError('');
                setPetBirthTimeError('');
              }}
            >
              <Text style={styles.sampleBtnText}>Try sample pet (Luna)</Text>
            </TouchableOpacity>

            <PremiumFormPanel>
              <FormSection title="Basics" hint="Who are we reading for?">
                <Text style={formStyles.label}>Pet name</Text>
                <TextInput
                  style={[formStyles.input, nameFocused && formStyles.inputFocused]}
                  value={petName}
                  onChangeText={setPetName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="e.g. Luna"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />

                <Text style={[formStyles.label, styles.fieldSpacer]}>Species</Text>
                <SpeciesSelector value={species} onChange={setSpecies} />
              </FormSection>
            </PremiumFormPanel>

            <PremiumFormPanel>
              <FormSection
                title="Birth details"
                hint="Date is required; time and place can be estimated."
              >
                <DateField
                  label="Pet birthday"
                  value={petBirthDate}
                  onChange={setPetBirthDate}
                  error={petBirthDateError}
                  onValidationChange={(result) => setPetBirthDateError(result.error || '')}
                  maximumDate={maxDate}
                  minimumDate={minDate}
                />

                <TimeField
                  label="Pet birth time (optional)"
                  value={petBirthTime}
                  onChange={setPetBirthTime}
                  error={petBirthTimeError}
                  onValidationChange={(result) => setPetBirthTimeError(result.error || '')}
                  note={TIME_HELPER_TEXT}
                />

                <Text style={formStyles.label}>Birth location (optional)</Text>
                <TextInput
                  style={[formStyles.input, locationFocused && formStyles.inputFocused]}
                  value={petBirthLocation}
                  onChangeText={setPetBirthLocation}
                  onFocus={() => setLocationFocused(true)}
                  onBlur={() => setLocationFocused(false)}
                  placeholder="City, country"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
                <Text style={formStyles.helper}>{LOCATION_HELPER_TEXT}</Text>
              </FormSection>
            </PremiumFormPanel>

            <Button
              title="Continue"
              onPress={onContinue}
              disabled={!canContinue}
              style={styles.cta}
            />
          </ScreenContent>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1, zIndex: 1 },
  scroll: { flex: 1 },
  scrollContent,
  content: { paddingTop: 8, paddingBottom: 24 },
  sampleBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: -8,
    paddingVertical: 4,
  },
  sampleBtnText: {
    fontFamily: sansFont,
    fontSize: 14,
    color: colors.jade,
    textDecorationLine: 'underline',
  },
  fieldSpacer: {
    marginTop: 18,
  },
  cta: { marginTop: 4, marginBottom: 12 },
});
