/**
 * Native (iOS/Android): TextInput + system date picker.
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
  const [showPicker, setShowPicker] = useState(false);
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(() => formatDateYYYYMMDD(value));
  const date = value instanceof Date && !isNaN(value.getTime()) ? value : new Date();

  useEffect(() => {
    const next = formatDateYYYYMMDD(value);
    if (next && next !== text) setText(next);
  }, [value, text]);

  const onPickerChange = (event, selected) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && selected) {
      onChange(selected);
      setText(formatDateYYYYMMDD(selected));
      onValidationChange?.({ ok: true, value: selected, error: '' });
    }
  };

  const handleTextChange = (input) => {
    setText(input);
    const parsed = parseDateYYYYMMDD(input, { minimumDate, maximumDate });
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
          placeholder="YYYY-MM-DD"
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
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onTouchCancel={() => Platform.OS === 'ios' && setShowPicker(false)}
        />
      )}
      {showPicker && Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.done} onPress={() => setShowPicker(false)}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      )}
      <Text style={[formStyles.helper, error && styles.errorText]}>
        {error || DATE_HELPER_TEXT}
      </Text>
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
