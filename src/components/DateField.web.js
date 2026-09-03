/**
 * Web build: TextInput only — avoids @react-native-community/datetimepicker (native-only).
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { formStyles } from '../constants/formStyles';
import {
  DATE_HELPER_TEXT,
  formatDateYYYYMMDD,
  parseDateYYYYMMDD,
} from '../utils/inputParsing';

export function DateField({
  label,
  value,
  onChange,
  maximumDate,
  minimumDate,
  error,
  onValidationChange,
}) {
  const [text, setText] = useState(() => formatDateYYYYMMDD(value));

  useEffect(() => {
    const next = formatDateYYYYMMDD(value);
    if (next && next !== text) setText(next);
  }, [value, text]);

  const handleTextChange = (input) => {
    setText(input);
    const parsed = parseDateYYYYMMDD(input, { minimumDate, maximumDate });
    onValidationChange?.(parsed);
    onChange(parsed.ok ? parsed.value : null);
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={formStyles.label}>{label}</Text> : null}
      <TextInput
        style={formStyles.input}
        value={text}
        onChangeText={handleTextChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textMuted}
        autoComplete="off"
        autoCorrect={false}
        inputMode="numeric"
        type="date"
      />
      <Text style={[formStyles.helper, error && styles.errorText]}>
        {error || DATE_HELPER_TEXT}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  errorText: {
    color: '#f0a6a6',
  },
});
