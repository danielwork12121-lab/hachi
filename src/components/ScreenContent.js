import React from 'react';
import { View, StyleSheet } from 'react-native';
import { contentColumn } from '../constants/layout';

export function ScreenContent({ children, style }) {
  return <View style={[styles.column, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  column: contentColumn,
});
