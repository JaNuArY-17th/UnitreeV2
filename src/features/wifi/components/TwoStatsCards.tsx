import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/themes';
import { useTranslation } from 'react-i18next';

interface TwoStatsCardsProps {
  totalTime: string;
  signalStrength: string;
}

export const TwoStatsCards: React.FC<TwoStatsCardsProps> = ({
  totalTime,
  signalStrength,
}) => {
  const { t } = useTranslation('wifi');

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total Time Today</Text>
        <Text style={styles.value}>{totalTime}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Signal Strength</Text>
        <Text style={styles.value}>{signalStrength}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  value: {
    ...typography.h3,
  },
});
