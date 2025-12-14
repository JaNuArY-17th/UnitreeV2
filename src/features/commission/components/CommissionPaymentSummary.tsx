import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '@/shared/components/base/Text';
import Button from '@/shared/components/base/Button';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS, typography } from '../../../shared/themes';

interface CommissionPaymentSummaryProps {
  totalRevenue: string;
  commissionPercentage: number;
  totalReceiveAmount: string;
  totalCommissionPayment: string;
  nextPaymentDate: string;
  daysUntilPayment: number;
  onPayCommission: () => void;
  isProcessing?: boolean;
}

const CommissionPaymentSummary: React.FC<CommissionPaymentSummaryProps> = ({
  totalRevenue,
  commissionPercentage,
  totalReceiveAmount,
  totalCommissionPayment,
  nextPaymentDate,
  daysUntilPayment,
  onPayCommission,
  isProcessing = false,
}) => {
  const { t } = useTranslation('commission');

  // Calculate progress percentage (assuming 30-day month cycle)
  const progressPercentage = Math.max(0, Math.min(100, ((30 - daysUntilPayment) / 30) * 100));

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>{t('totalRevenue', 'Total Revenue')}</Text>
          <Text style={styles.cardValue}>{totalRevenue}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>{t('commissionPercentage', 'Commission Percentage')}</Text>
          <Text style={styles.cardValue}>{commissionPercentage}%</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>{t('totalReceiveAmount', 'Total Receive Amount')}</Text>
          <Text style={styles.cardValue}>{totalReceiveAmount}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>{t('totalCommissionPayment', 'Total Commission Payment')}</Text>
          <Text style={styles.cardValue}>{totalCommissionPayment}</Text>
        </View>
      </View>

      {/* Payment Date Info */}
      <View style={styles.dateSection}>
        <Text style={styles.cardLabel}>{t('paymentDate', 'Payment Date')}</Text>
        <Text style={styles.cardValue}>{nextPaymentDate}</Text>
        <Text style={styles.dateSubtext}>{t('nextPaymentDate', 'Next payment on the 25th of every month')}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{t('paymentProgress', 'Payment Progress')}</Text>
          <Text style={styles.progressValue}>{daysUntilPayment} {t('daysUntilPayment', 'days until payment')}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      {/* Payment Button */}
      <Button
        label={t('payCommission', 'Pay Commission')}
        onPress={onPayCommission}
        loading={isProcessing}
        style={styles.payButton}
        disabled={isProcessing}
        size='lg'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,

    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: dimensions.radius.md,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardValue: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
  },
  dateSection: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: dimensions.radius.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  dateValue: {
    fontSize: 18,

    color: colors.primary,
    marginBottom: spacing.xs,
  },
  dateSubtext: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
  },
  progressValue: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: dimensions.radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: dimensions.radius.sm,
  },
  payButton: {
    marginTop: spacing.md,
  },
});

export default CommissionPaymentSummary;
