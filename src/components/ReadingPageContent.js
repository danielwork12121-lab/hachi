import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  READING_MAX_WIDTH,
  READING_MAX_WIDTH_NARROW,
  READING_PAGE_PADDING_H,
  READING_PAGE_PADDING_H_MOBILE,
  READING_WIDE_BREAKPOINT,
} from '../constants/readingLayout';

export function useReadingLayout() {
  const { width } = useWindowDimensions();
  const isWide =
    Platform.OS === 'web' && width >= READING_WIDE_BREAKPOINT;
  return {
    isWide,
    contentWidth: isWide ? READING_MAX_WIDTH : READING_MAX_WIDTH_NARROW,
    paddingH: isWide ? READING_PAGE_PADDING_H : READING_PAGE_PADDING_H_MOBILE,
  };
}

export function ReadingPageContent({ children, style }) {
  const { isWide, contentWidth, paddingH } = useReadingLayout();

  return (
    <View
      style={[
        styles.column,
        {
          maxWidth: contentWidth,
          paddingHorizontal: paddingH,
        },
        isWide && styles.columnWide,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: '100%',
    alignSelf: 'center',
  },
  columnWide: {
    paddingTop: 8,
  },
});
