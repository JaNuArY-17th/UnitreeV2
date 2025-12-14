import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
// @ts-ignore - iOS only API
import { NativeModules } from 'react-native';

/**
 * Debug component to list all available fonts in the app
 * Use this to find the exact font family names registered in iOS
 */
export const FontDebugger: React.FC = () => {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Log all available font families
      const fontFamilyNames = require('react-native').Platform.constants.systemFont;
      console.log('=== AVAILABLE FONTS ===');

      // Try to get font families using UIKit
      // Note: This requires native code, so we'll use a different approach

      // For now, let's test specific font names
      const testFonts = [
        'Poppins',
        'Poppins-Regular',
        'Poppins-Medium',
        'Poppins-SemiBold',
        'Poppins-Bold',
        'Poppins-Semibold', // lowercase 'b'
      ];

      console.log('Testing font names:', testFonts);
    }
  }, []);

  // Visual test of different font weights
  const fontTests = [
    { name: 'Poppins-Thin', label: 'Thin' },
    { name: 'Poppins-Light', label: 'Light' },
    { name: 'Poppins-Regular', label: 'Regular' },
    { name: 'Poppins-Medium', label: 'Medium' },
    { name: 'Poppins-SemiBold', label: 'SemiBold' },
    { name: 'Poppins-Bold', label: 'Bold' },
    { name: 'Poppins-ExtraBold', label: 'ExtraBold' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Font Test</Text>
      {fontTests.map((font) => (
        <View key={font.name} style={styles.row}>
          <Text style={styles.label}>{font.label}:</Text>
          <Text style={[styles.test, { fontFamily: font.name }]}>
            The quick brown fox jumps
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    width: 100,
    fontSize: 12,
  },
  test: {
    fontSize: 16,
    flex: 1,
  },
});
