import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/themes';
import { Clock, Wifi, Star } from '@/shared/assets/icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface StatItem {
  iconComponent: React.ComponentType<any>;
  value: string;
  labelKey: string;
}

interface QuickStatsGridProps {
  totalTime: string;
  sessions: number;
  pointsToday: number;
  locations: number;
}

export const QuickStatsGrid: React.FC<QuickStatsGridProps> = ({
  totalTime,
  sessions,
  pointsToday,
  locations,
}) => {
  const { t } = useTranslation('wifi');

  const stats: StatItem[] = [
    {
      iconComponent: Clock,
      value: totalTime,
      labelKey: 'summary.totalTime',
    },
    {
      iconComponent: Wifi,
      value: sessions.toString(),
      labelKey: 'summary.sessions',
    },
    {
      iconComponent: Star,
      value: pointsToday.toString(),
      labelKey: 'summary.pointsToday',
    },
    {
      iconComponent: Clock,
      value: locations.toString(),
      labelKey: 'summary.locations',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('summary.title')}</Text>
      <View style={styles.grid}>
        {stats.map((stat, index) => {
          const IconComponent = stat.iconComponent;
          return (
            <View key={index} style={styles.statItem}>
              <IconComponent width={28} height={28} color={colors.primary} />
              <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statItem: {
    width: (width - spacing.md * 2 - spacing.sm) / 2,
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    marginTop: spacing.xs,
  },
});
