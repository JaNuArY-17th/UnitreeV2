import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { colors, spacing, typography } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface PostpaidMainCardProps {
  data: {
    level: string;
    status: string;
    available: number;
    spent: number;
    dueDate: string;
  };
  onViewDebtDetails: () => void;
}

const PostpaidMainCard: React.FC<PostpaidMainCardProps> = ({ data, onViewDebtDetails }) => {
  const { t } = useTranslation('account');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { text: t('postpaid.status.active'), isActive: true };
      case 'INACTIVE':
        return { text: t('postpaid.status.inactive'), isActive: false };
      case 'PENDING':
        return { text: t('loan.pending'), isActive: false };
      case 'LOCKED':
        return { text: t('loan.locked'), isActive: false };
      default:
        return { text: status, isActive: false };
    }
  };

  const statusInfo = getStatusDisplay(data.status);

  return (
    <View style={styles.mainCard}>
      <View style={styles.cardTopRow}>
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>{t('postpaid.availableBalance')}</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(data.available)}</Text>
        </View>

        <View style={[styles.statusBadge, !statusInfo.isActive && styles.statusBadgeInactive]}>
          <Text style={[styles.statusText, !statusInfo.isActive && styles.statusTextInactive]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Bottom Row Information */}
      <View style={styles.cardBottomRow}>
        {/* Total Debt - Clickable */}
        <TouchableOpacity style={styles.infoBlock} onPress={onViewDebtDetails}>
          <Text style={styles.infoLabel}>{t('loan.totalPayment')}</Text>
          <View style={styles.debtRow}>
            <Text style={styles.debtAmount}>{formatCurrency(data.spent)}</Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.text.secondary} />
          </View>
        </TouchableOpacity>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Payment Date */}
        <View style={[styles.infoBlock, { paddingLeft: spacing.md }]}>
          <Text style={styles.infoLabel}>{t('loan.dueDate')}</Text>
          <Text style={styles.dateValue}>Ngày {data.dueDate}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: colors.light,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // marginBottom: spacing.lg,
  },
  cardLevel: {
    ...typography.subtitle,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: colors.text.primary,
  },
  statusBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.sm,
  },
  statusBadgeInactive: {
    backgroundColor: colors.lightGray,
  },
  statusText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  statusTextInactive: {
    color: colors.text.secondary,
  },
  balanceSection: {
    marginBottom: spacing.md,
  },
  balanceLabel: {
    ...typography.body,
    color: colors.text.secondary,
    // marginBottom: spacing.xs,
  },
  balanceAmount: {
    ...typography.h1,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    // marginBottom: 4,
  },
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  debtAmount: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
  },
  verticalDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  dateValue: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
  },
});

export default PostpaidMainCard;
