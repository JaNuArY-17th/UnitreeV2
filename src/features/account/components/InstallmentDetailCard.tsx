import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Calendar03Icon,
  ShoppingBag02Icon,
  ArrowRight01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
import { colors, spacing, typography } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { useTranslation } from '@/shared/hooks/useTranslation';

export interface InstallmentPeriod {
  periodNumber: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'current' | 'upcoming' | 'overdue';
  paidDate?: string;
  lateFee?: number;
}

export interface InstallmentData {
  id: string;
  title: string;
  merchant: string;
  totalAmount: number;
  monthlyAmount: number;
  remainingMonths: number;
  totalMonths: number;
  nextDueDate: string;
  status: 'active' | 'completed' | 'overdue';
  periods: InstallmentPeriod[];
  totalPaid: number;
  totalRemaining: number;
  createdAt: string;
}

interface InstallmentDetailCardProps {
  installment: InstallmentData;
  onViewDetails: () => void;
  onPayNow: () => void;
  showPeriods?: boolean;
}

const InstallmentDetailCard: React.FC<InstallmentDetailCardProps> = ({
  installment,
  onViewDetails,
  onPayNow,
  showPeriods = false,
}) => {
  const { t } = useTranslation('account');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusInfo = (status: InstallmentData['status']) => {
    switch (status) {
      case 'active':
        return {
          text: t('postpaid.installment.statusActive'),
          color: colors.success,
          bgColor: colors.successSoft,
        };
      case 'completed':
        return {
          text: t('postpaid.installment.statusCompleted'),
          color: colors.text.secondary,
          bgColor: colors.lightGray,
        };
      case 'overdue':
        return {
          text: t('postpaid.installment.statusOverdue'),
          color: colors.danger,
          bgColor: colors.dangerSoft || '#FFEBEE',
        };
      default:
        return {
          text: status,
          color: colors.text.secondary,
          bgColor: colors.lightGray,
        };
    }
  };

  const getPeriodStatusIcon = (status: InstallmentPeriod['status']) => {
    switch (status) {
      case 'paid':
        return { icon: CheckmarkCircle02Icon, color: colors.success };
      case 'current':
        return { icon: Clock01Icon, color: colors.warning };
      case 'upcoming':
        return { icon: Calendar03Icon, color: colors.text.secondary };
      case 'overdue':
        return { icon: AlertCircleIcon, color: colors.danger };
      default:
        return { icon: Calendar03Icon, color: colors.text.secondary };
    }
  };

  const statusInfo = getStatusInfo(installment.status);
  const progress = ((installment.totalMonths - installment.remainingMonths) / installment.totalMonths) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={onViewDetails}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <HugeiconsIcon icon={ShoppingBag02Icon} size={24} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{installment.title}</Text>
            <Text style={styles.merchant}>{installment.merchant}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.text.secondary} />
        </View>
      </TouchableOpacity>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{t('postpaid.installment.progress')}</Text>
          <Text style={styles.progressValue}>
            {installment.totalMonths - installment.remainingMonths}/{installment.totalMonths} {t('loan.month')}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Amount Info */}
      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>{t('postpaid.installment.totalAmount')}</Text>
            <Text style={styles.amountValue}>{formatCurrency(installment.totalAmount)}</Text>
          </View>
          <View style={styles.amountDivider} />
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>{t('postpaid.installment.monthlyPayment')}</Text>
            <Text style={styles.amountValue}>{formatCurrency(installment.monthlyAmount)}</Text>
          </View>
        </View>
      </View>

      {/* Next Due Date */}
      {installment.status !== 'completed' && (
        <View style={styles.dueDateSection}>
          <View style={styles.dueDateRow}>
            <HugeiconsIcon icon={Calendar03Icon} size={16} color={colors.text.secondary} />
            <Text style={styles.dueDateLabel}>{t('postpaid.installment.nextDueDate')}:</Text>
            <Text style={[
              styles.dueDateValue,
              installment.status === 'overdue' && styles.overdueText,
            ]}>
              {formatDate(installment.nextDueDate)}
            </Text>
          </View>
        </View>
      )}

      {/* Period List (if showPeriods is true) */}
      {showPeriods && installment.periods && installment.periods.length > 0 && (
        <View style={styles.periodsSection}>
          <Text style={styles.periodsSectionTitle}>{t('postpaid.installment.paymentSchedule')}</Text>
          {installment.periods.map((period, index) => {
            const periodStatus = getPeriodStatusIcon(period.status);
            return (
              <View
                key={`period-${period.periodNumber}`}
                style={[
                  styles.periodItem,
                  index === installment.periods.length - 1 && styles.periodItemLast,
                ]}
              >
                <View style={styles.periodLeft}>
                  <HugeiconsIcon icon={periodStatus.icon} size={18} color={periodStatus.color} />
                  <View style={styles.periodInfo}>
                    <Text style={styles.periodNumber}>
                      {t('postpaid.installment.period')} {period.periodNumber}
                    </Text>
                    <Text style={styles.periodDate}>{formatDate(period.dueDate)}</Text>
                  </View>
                </View>
                <View style={styles.periodRight}>
                  <Text style={[
                    styles.periodAmount,
                    period.status === 'paid' && styles.paidAmount,
                    period.status === 'overdue' && styles.overdueAmount,
                  ]}>
                    {formatCurrency(period.amount)}
                  </Text>
                  {period.lateFee && period.lateFee > 0 && (
                    <Text style={styles.lateFeeText}>
                      +{formatCurrency(period.lateFee)} {t('postpaid.billing.lateFee')}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Pay Now Button (if overdue) */}
      {installment.status === 'overdue' && (
        <TouchableOpacity style={styles.payNowButton} onPress={onPayNow}>
          <Text style={styles.payNowText}>{t('loan.payNow')}</Text>
        </TouchableOpacity>
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
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft || '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
  },
  merchant: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  progressValue: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  amountSection: {
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountItem: {
    flex: 1,
    alignItems: 'center',
  },
  amountDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  amountValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dueDateSection: {
    marginTop: spacing.xs,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dueDateLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  dueDateValue: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
  },
  overdueText: {
    color: colors.danger,
  },
  periodsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  periodsSectionTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  periodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodItemLast: {
    borderBottomWidth: 0,
  },
  periodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  periodInfo: {},
  periodNumber: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text.primary,
  },
  periodDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  periodRight: {
    alignItems: 'flex-end',
  },
  periodAmount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  paidAmount: {
    color: colors.success,
  },
  overdueAmount: {
    color: colors.danger,
  },
  lateFeeText: {
    ...typography.caption,
    color: colors.danger,
    fontSize: 10,
  },
  payNowButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  payNowText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.light,
  },
});

export default InstallmentDetailCard;
