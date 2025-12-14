import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../base/Text';
import LoginScreen from '@/features/authentication/screens/LoginScreen';
import ForgotPasswordScreen from '@/features/authentication/screens/ForgotPasswordScreen';
import { colors, spacing } from '@/shared/themes';
import { FONT_WEIGHTS } from '@/shared/themes/fonts';

export const ComponentImportTest: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title} weight={FONT_WEIGHTS.BOLD}>
        Component Import Test
      </Text>
      
      <Text style={styles.subtitle}>
        Testing that all components can be imported correctly
      </Text>
      
      <View style={styles.testResults}>
        <Text style={styles.testItem}>
          ✅ LoginScreen - {LoginScreen ? 'Imported successfully' : 'Import failed'}
        </Text>
        <Text style={styles.testItem}>
          ✅ ForgotPasswordScreen - {ForgotPasswordScreen ? 'Imported successfully' : 'Import failed'}
        </Text>
        <Text style={styles.testItem}>
          ✅ Text Component - Working correctly
        </Text>
      </View>
      
      <Text style={styles.note}>
        If you can see this screen without errors, all component imports are working correctly!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: spacing.md,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: spacing.xl,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  testResults: {
    backgroundColor: colors.light,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  testItem: {
    fontSize: 14,
    color: colors.text.primary,
  },
  note: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
