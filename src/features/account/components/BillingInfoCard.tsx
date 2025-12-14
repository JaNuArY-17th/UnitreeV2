import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  AlertCircleIcon,
  Invoice01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
} from '@hugeicons/core-free-icons';
import { colors, spacing, typography } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import Button from '@/shared/components/base/Button';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface BillingInfoCardProps {
  billingDate: number; // Ngày phát hành hóa đơn (14 hoặc 24)
  lateFee: number; // Phí trả chậm (30000)
  isOverdue: boolean;
  daysOverdue?: number;
  onViewBillingDetails: () => void;
}

const BillingInfoCard: React.FC<BillingInfoCardProps> = ({
  billingDate,
  lateFee,
  isOverdue,
  daysOverdue = 0,
  onViewBillingDetails,
}) => {
  const { t } = useTranslation('account');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <HugeiconsIcon icon={Invoice01Icon} size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>{t('postpaid.billing.title')}</Text>
        </View>
        <Button
          variant="ghost"
          size="sm"
          onPress={onViewBillingDetails}
          rightIcon={<HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.primary} />}
          label={t('postpaid.billing.viewDetails')}
          contentStyle={{ paddingHorizontal: 0 }}
        />
      </View>

      {/* Simplified Billing Info */}
      <View style={styles.infoRow}>
        <HugeiconsIcon icon={Calendar03Icon} size={16} color={colors.text.secondary} />
        <Text style={styles.infoText}>
          {t('postpaid.billing.billingDate')}: <Text style={styles.boldText}>{t('date.day')} {billingDate}</Text>
        </Text>
      </View>

      {/* Late Fee Warning (only if applicable) */}
      {isOverdue && (
        <View style={styles.lateFeeWarning}>
          <HugeiconsIcon icon={AlertCircleIcon} size={16} color={colors.danger} />
          <Text style={styles.lateFeeText}>
            {t('postpaid.billing.lateFeeApplied')}: {formatCurrency(lateFee)}
          </Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
  },
  boldText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    fontSize: 14,
  },
  lateFeeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft || '#FFEBEE',
    padding: spacing.sm,
    borderRadius: spacing.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  lateFeeText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
  },
});

export default BillingInfoCard;
