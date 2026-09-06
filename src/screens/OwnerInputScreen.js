import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Text,
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
import { colors } from '../constants/colors';
import { formStyles } from '../constants/formStyles';
import { scrollContent } from '../constants/layout';
import { sansFont } from '../constants/typography';
import { DEFAULT_PREVIEW } from '../data/mockData';
import { TIME_HELPER_TEXT } from '../utils/inputParsing';
import { DEFAULT_BIRTH_TIME } from '../utils/zipingBazi';

export default function OwnerInputScreen({ navigation, route }) {
  const {
    petName,
    species,
    petBirthDate,
    petBirthTime,
    petBirthLocation,
    birthTimeWasDefaulted,
    birthLocationWasDefaulted,
  } = route.params || {};
  const [ownerName, setOwnerName] = useState('');
  const [ownerBirthDate, setOwnerBirthDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 30);
    return d;
  });
  const [ownerBirthTime, setOwnerBirthTime] = useState(null);
  const [ownerBirthDateError, setOwnerBirthDateError] = useState('');
  const [ownerBirthTimeError, setOwnerBirthTimeError] = useState('');
  const [nameFocused, setNameFocused] = useState(false);

  const maxDate = new Date();
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);

  const canGenerate =
    ownerName.trim().length > 0 &&
    ownerBirthDate instanceof Date &&
    !Number.isNaN(ownerBirthDate.getTime()) &&
    !ownerBirthDateError &&
    !ownerBirthTimeError;

  const onGenerate = () => {
    if (!ownerBirthDate) {
      setOwnerBirthDateError('Birth date is required.');
      return;
    }
    if (ownerBirthTimeError) return;

    const ownerBirthTimeWasDefaulted = ownerBirthTime == null;

    navigation.navigate('LoadingReveal', {
      petName,
      species: species || 'dog',
      petBirthDate,
      petBirthTime,
      petBirthLocation,
      birthTimeWasDefaulted,
      birthLocationWasDefaulted,
      ownerName: ownerName.trim(),
      ownerBirthDate,
      ownerBirthTime: ownerBirthTimeWasDefaulted ? DEFAULT_BIRTH_TIME : ownerBirthTime,
      ownerBirthTimeWasDefaulted,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CosmicScreenBackdrop glowY={0.14} />
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
              title="About you"
              subtitle={`Your birth details help Hachi map the bond between you and ${petName || 'your pet'}.`}
              onBack={() => navigation.goBack()}
            />

            <TouchableOpacity
              style={styles.sampleBtn}
              onPress={() => {
                setOwnerName(DEFAULT_PREVIEW.ownerName);
                setOwnerBirthDate(DEFAULT_PREVIEW.ownerBirthDate);
                setOwnerBirthTime(DEFAULT_PREVIEW.ownerBirthTime ?? null);
                // See PetInputScreen's sample handler: overwriting the date/time
                // state directly skips DateField/TimeField's onValidationChange,
                // so a stale error from an earlier bad keystroke must be cleared
                // explicitly or Generate Reading stays disabled on valid data.
                setOwnerBirthDateError('');
                setOwnerBirthTimeError('');
              }}
            >
              <Text style={styles.sampleBtnText}>Try sample (Alex)</Text>
            </TouchableOpacity>

            <PremiumFormPanel>
              <FormSection title="Your profile" hint="Name and birthday are all we need to start.">
                <Text style={formStyles.label}>Your name</Text>
                <TextInput
                  style={[formStyles.input, nameFocused && formStyles.inputFocused]}
                  value={ownerName}
                  onChangeText={setOwnerName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="e.g. Alex"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />

                <DateField
                  label="Your birthday"
                  value={ownerBirthDate}
                  onChange={setOwnerBirthDate}
                  error={ownerBirthDateError}
                  onValidationChange={(result) => setOwnerBirthDateError(result.error || '')}
                  maximumDate={maxDate}
                  minimumDate={minDate}
                />

                <TimeField
                  label="Your birth time (optional)"
                  value={ownerBirthTime}
                  onChange={setOwnerBirthTime}
                  error={ownerBirthTimeError}
                  onValidationChange={(result) => setOwnerBirthTimeError(result.error || '')}
                  note={TIME_HELPER_TEXT}
                />
              </FormSection>
            </PremiumFormPanel>

            <Button
              title="Generate Reading"
              onPress={onGenerate}
              disabled={!canGenerate}
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
  cta: { marginTop: 4, marginBottom: 12 },
});
