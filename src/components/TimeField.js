/**
 * Native (iOS/Android): TextInput + system time picker.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../constants/colors';
import { formStyles } from '../constants/formStyles';
import {
  DEFAULT_TIME_STRING,
  TIME_HELPER_TEXT,
  formatTimeDisplay,
  parseOptionalTime,
} from '../utils/inputParsing';

export function TimeField({ label, value, onChange, note, error, onValidationChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(() => (value != null ? formatTimeDisplay(value) : ''));
  const d = new Date();
  const pickerTime = value != null ? value : DEFAULT_TIME_STRING;
  const [pickerHour, pickerMinute = '0'] = String(pickerTime).split(':');
  d.setHours(Number(pickerHour) || 12, Number(pickerMinute) || 0, 0, 0);

  useEffect(() => {
    const next = value != null ? formatTimeDisplay(value) : '';
    if (next && next !== text) setText(next);
  }, [value, text]);

  const onPickerChange = (event, selected) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && selected) {
      const next = `${String(selected.getHours()).padStart(2, '0')}:${String(
        selected.getMinutes()
      ).padStart(2, '0')}`;
      onChange(next);
      setText(formatTimeDisplay(next));
      onValidationChange?.({ ok: true, value: next, defaulted: false, error: '' });
    }
  };

  const handleTextChange = (input) => {
    setText(input);
    const parsed = parseOptionalTime(input);
    onValidationChange?.(parsed);
    onChange(parsed.ok ? parsed.value : null);
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={formStyles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[formStyles.input, styles.inputFlex, focused && formStyles.inputFocused]}
          value={text}
          onChangeText={handleTextChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="e.g. 14 or 2:00 PM (optional)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numbers-and-punctuation"
        />
        <TouchableOpacity
          style={formStyles.pickerButton}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={formStyles.pickerButtonText}>Pick</Text>
        </TouchableOpacity>
      </View>
      <Text style={[formStyles.helper, error && styles.errorText]}>
        {error || note || TIME_HELPER_TEXT}
      </Text>
      {showPicker && (
        <DateTimePicker
          value={d}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
          onTouchCancel={() => Platform.OS === 'ios' && setShowPicker(false)}
        />
      )}
      {showPicker && Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.done} onPress={() => setShowPicker(false)}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputFlex: {
    flex: 1,
    marginBottom: 0,
  },
  done: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  doneText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#f0a6a6',
  },
});
