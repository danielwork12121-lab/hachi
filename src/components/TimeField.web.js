/**
 * Web build: TextInput only — no native time picker import.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { formStyles } from '../constants/formStyles';
import {
  TIME_HELPER_TEXT,
  formatTimeDisplay,
  parseOptionalTime,
} from '../utils/inputParsing';

export function TimeField({ label, value, onChange, note, error, onValidationChange }) {
  const [text, setText] = useState(() => (value != null ? formatTimeDisplay(value) : ''));

  useEffect(() => {
    const next = value != null ? formatTimeDisplay(value) : '';
    if (next && next !== text) setText(next);
  }, [value, text]);

  const handleTextChange = (input) => {
    setText(input);
    const parsed = parseOptionalTime(input);
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
        placeholder="e.g. 14, 2:00 PM, 2pm (optional)"
        placeholderTextColor={colors.textMuted}
        autoComplete="off"
        autoCorrect={false}
        inputMode="text"
      />
      <Text style={[formStyles.helper, error && styles.errorText]}>
        {error || note || TIME_HELPER_TEXT}
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
