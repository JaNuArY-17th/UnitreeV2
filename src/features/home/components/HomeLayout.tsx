import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, dimensions, typography } from '@/shared/themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from 'i18next';

interface HeaderProps {
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ userName = '' }) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.headerSection, 
        { 
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.md,
        }
      ]}
    >
      <View style={styles.welcomeSection}>
        <Text style={styles.titleText}>
          Welcome back{userName ? `, ${userName}` : ''}!
        </Text>
        <Text style={styles.subtitleText}>
          Track your WiFi sessions and plant more trees
        </Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: colors.secondary,
    paddingBottom: 90,
    paddingTop: spacing.sm,
  },
  welcomeSection: {
    alignItems: 'flex-start',
    marginTop: spacing.md,
    width: '100%',
  },
  titleText: {
    ...typography.h0,
    fontWeight: 'bold',
    color: colors.light,
    marginBottom: spacing.md,
  },
  subtitleText: {
    ...typography.subtitle,
    color: colors.light,
    opacity: 0.9,
    lineHeight: 24,
  },

});
