import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useTranslation } from 'react-i18next';
import { colors, dimensions, spacing, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';

interface TotalAmountSectionProps {
  totalAmount: string;
  status: string;
  transactionType: 'in' | 'out';
  isSuccess?: boolean;
}

const TotalAmountSection: React.FC<TotalAmountSectionProps> = ({
  totalAmount,
  status,
  transactionType,
  isSuccess = true,
}) => {
  const { t } = useTranslation('transactions');

  // Status color based on success/failure
  const statusColor = isSuccess ? colors.success : colors.danger;

  // Amount color based on transaction type (same as HistoryItem)
  const getAmountColor = () => {
    if (transactionType === 'in') return colors.success;
    if (transactionType === 'out') return colors.danger;
    return colors.text.primary;
  };

  // No extra prefix, already formatted in parent
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('transactionDetail.totalAmount')}</Text>
      <Text style={[styles.amount, { color: getAmountColor() }]}>{totalAmount}</Text>
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{status === 'Successful' ? t('transactionDetail.successful') : t('transactionDetail.failed')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    // paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  amount: {
    ...typography.h1,
    fontSize: 40, // consistent large size for focus
    paddingVertical: spacing.sm,
    color: colors.text.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: dimensions.radius.xl,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
});

export default TotalAmountSection;
