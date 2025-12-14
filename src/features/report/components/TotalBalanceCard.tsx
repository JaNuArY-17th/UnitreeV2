import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, dimensions, FONT_WEIGHTS, getFontFamily, spacing } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface TotalBalanceCardProps {
  label?: string;
  amount: string;
  currency?: string;
}

export const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  label,
  amount,
  currency = 'USD',
}) => {
  const { t } = useTranslation('report');

  return (
    <View style={styles.balanceSection}>
      <View style={styles.balance}>
        <Text style={styles.balanceLabel}>{label || t('balance.totalBalance')}</Text>
        <Text style={styles.balanceAmount}>
          {amount} đ
        </Text>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>{t('balance.successfulTransactions')}</Text>
          <Text style={[styles.summaryAmount, { color: colors.success }]}>50</Text>
        </View>
        <View>
          <Text style={styles.summaryLabel}>{t('balance.failedTransactions')}</Text>
          <Text style={[styles.summaryAmount, { color: colors.danger }]}>5</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceSection: {
    // alignItems: 'center',
    marginBottom: spacing.xl,
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
  },
  balance: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 30,

    color: colors.primary,
    paddingVertical: spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: spacing.md,
  },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: colors.lightGray,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: 16,
    color: colors.text.primary,
  },
});
