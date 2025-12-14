import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, dimensions, typography } from '@/shared/themes';
import { Text } from '@/shared/components';
import { formatVND } from '@/shared/utils/format';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { MoneyBag02Icon, WalletDone01Icon } from '@hugeicons/core-free-icons';

interface TotalRevenueProps {
  incomeAmount: number;
  receivedAmount: number;
}

export const TotalRevenue: React.FC<TotalRevenueProps> = ({ incomeAmount, receivedAmount }) => {
  const { t } = useTranslation('report');

  return (
    <View style={styles.container}>
      {/* Income Card */}
      <View style={[styles.revenueCard, styles.incomeCard]}>
        <View style={styles.cardIconContainer}>
          <HugeiconsIcon icon={MoneyBag02Icon} size={32} color={colors.primary} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.totalRevenueLabel}>{t('screen.totalRevenue.label')}</Text>
          <Text style={[styles.totalRevenueAmount, styles.incomeAmount]}>{formatVND(incomeAmount)}</Text>
        </View>
      </View>

      {/* Received Card */}
      <View style={[styles.revenueCard, styles.receivedCard]}>
        <View style={styles.cardIconContainer}>
          <HugeiconsIcon icon={WalletDone01Icon} size={32} color={colors.success} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.totalRevenueLabel}>{t('screen.totalRevenue.label2')}</Text>
          <Text style={[styles.totalRevenueAmount, styles.receivedAmount]}>{formatVND(receivedAmount)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  revenueCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  incomeCard: {
    borderColor: colors.primaryLight,
  },
  receivedCard: {
    borderColor: colors.successSoft,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: dimensions.radius.round,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTextContainer: {
    alignItems: 'center',
  },
  totalRevenueLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  growthBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.sm,
  },
  growthBadgePositive: {
    backgroundColor: colors.successSoft,
  },
  growthBadgeNegative: {
    backgroundColor: colors.dangerSoft,
  },
  growthBadgeText: {
    ...typography.caption,

  },
  growthBadgeTextPositive: {
    color: colors.success,
  },
  growthBadgeTextNegative: {
    color: colors.danger,
  },
  totalRevenueAmount: {
    ...typography.h2,
    textAlign: 'center',
  },
  incomeAmount: {
    color: colors.primary,
  },
  receivedAmount: {
    color: colors.success,
  },
});

export default TotalRevenue;
