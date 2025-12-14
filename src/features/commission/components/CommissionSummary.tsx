import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '@/shared/components/base/Text';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '../../../shared/themes';

interface CommissionSummaryProps {
  totalAmount: string;
  transactionCount: number;
}

const CommissionSummary: React.FC<CommissionSummaryProps> = ({
  totalAmount,
  transactionCount,
}) => {
  const { t } = useTranslation('commission');

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryText}>
        {t('totalCommission', 'Total Commission')}: {totalAmount}
      </Text>
      <Text style={styles.summarySubText}>
        {transactionCount} {t('commissionTransactions', 'commission transactions')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.md,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  summarySubText: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
});

export default CommissionSummary;
