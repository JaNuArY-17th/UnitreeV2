import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  CheckmarkCircle02Icon,
  Wallet01Icon,
  Calculator01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { colors, spacing, typography } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { useTranslation } from '@/shared/hooks/useTranslation';

export type PaymentOption = 'full' | 'minimum' | 'custom';

interface PaymentOptionsCardProps {
  totalDebt: number;
  minimumPayment: number;
  selectedOption?: PaymentOption;
  customAmount?: number;
  onSelectOption: (option: PaymentOption) => void;
  onCustomAmountPress: () => void;
  onProceed: () => void;
  disabled?: boolean;
}

const PaymentOptionsCard: React.FC<PaymentOptionsCardProps> = ({
  totalDebt,
  minimumPayment,
  selectedOption = 'full',
  customAmount,
  onSelectOption,
  onCustomAmountPress,
  onProceed,
  disabled = false,
}) => {
  const { t } = useTranslation('account');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const paymentOptions = [
    {
      id: 'full' as PaymentOption,
      title: t('postpaid.payment.payFull'),
      description: t('postpaid.payment.payFullDesc'),
      amount: totalDebt,
      icon: Wallet01Icon,
      recommended: true,
    },
    {
      id: 'minimum' as PaymentOption,
      title: t('postpaid.payment.payMinimum'),
      description: t('postpaid.payment.payMinimumDesc'),
      amount: minimumPayment,
      icon: Calculator01Icon,
      recommended: false,
    },
    {
      id: 'custom' as PaymentOption,
      title: t('postpaid.payment.payCustom'),
      description: t('postpaid.payment.payCustomDesc'),
      amount: customAmount || 0,
      icon: Calculator01Icon,
      recommended: false,
    },
  ];

  const getSelectedAmount = () => {
    switch (selectedOption) {
      case 'full':
        return totalDebt;
      case 'minimum':
        return minimumPayment;
      case 'custom':
        return customAmount || 0;
      default:
        return totalDebt;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('postpaid.payment.selectPaymentOption')}</Text>

      {/* Payment Options */}
      {paymentOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionCard,
            selectedOption === option.id && styles.optionCardSelected,
            option.recommended && styles.optionCardRecommended,
          ]}
          onPress={() => {
            if (option.id === 'custom') {
              onCustomAmountPress();
            } else {
              onSelectOption(option.id);
            }
          }}
          disabled={disabled}
        >
          {option.recommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>{t('postpaid.payment.recommended')}</Text>
            </View>
          )}

          <View style={styles.optionContent}>
            <View style={styles.optionLeft}>
              <View style={[
                styles.radioCircle,
                selectedOption === option.id && styles.radioCircleSelected,
              ]}>
                {selectedOption === option.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </View>

            <View style={styles.optionRight}>
              {option.id === 'custom' && !customAmount ? (
                <View style={styles.customAmountPlaceholder}>
                  <Text style={styles.enterAmountText}>{t('postpaid.payment.enterAmount')}</Text>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.primary} />
                </View>
              ) : (
                <Text style={[
                  styles.optionAmount,
                  selectedOption === option.id && styles.optionAmountSelected,
                ]}>
                  {formatCurrency(option.amount)}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('postpaid.payment.paymentAmount')}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(getSelectedAmount())}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('postpaid.payment.remainingAfterPayment')}</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(Math.max(0, totalDebt - getSelectedAmount()))}
          </Text>
        </View>
      </View>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, disabled && styles.proceedButtonDisabled]}
        onPress={onProceed}
        disabled={disabled || getSelectedAmount() <= 0}
      >
        <Text style={styles.proceedButtonText}>{t('postpaid.payment.proceedToPayment')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft || '#E3F2FD',
  },
  optionCardRecommended: {
    borderColor: colors.success,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.sm,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.light,
    fontWeight: '600',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  optionRight: {
    marginLeft: spacing.sm,
  },
  optionAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  optionAmountSelected: {
    color: colors.primary,
  },
  customAmountPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enterAmountText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  summarySection: {
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  proceedButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  proceedButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.light,
  },
});

export default PaymentOptionsCard;
