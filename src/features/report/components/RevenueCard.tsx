import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, dimensions, typography } from '@/shared/themes';
import { Text } from '@/shared/components';
import { TrendingUp, TrendingDown } from '@/shared/assets';

interface RevenueCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  backgroundColor?: string;
}

export const RevenueCard: React.FC<RevenueCardProps> = ({ title, value, icon, trend, backgroundColor }) => (
  <View style={[styles.revenueCard, backgroundColor && { backgroundColor }]}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
    </View>
    <View style={styles.cardContent}>
      <View style={styles.valueContainer}>
        <Text style={styles.cardValue} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  revenueCard: {
    flex: 1,
    backgroundColor: colors.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    minWidth: 0, // Allow flex to shrink
    borderRadius: dimensions.radius.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: dimensions.radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.sm,
  },
  trendPositive: {
    backgroundColor: colors.successSoft,
  },
  trendNegative: {
    backgroundColor: colors.dangerSoft,
  },
  trendText: {
    ...typography.caption,

    marginLeft: spacing.xs,
  },
  trendTextPositive: {
    color: colors.success,
  },
  trendTextNegative: {
    color: colors.danger,
  },
  cardContent: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  valueContainer: {
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xs,
  },
  titleContainer: {
    minHeight: 32,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  cardValue: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    width: '100%',
  },
  cardTitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    width: '100%',
    lineHeight: 18,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});

export default RevenueCard;
