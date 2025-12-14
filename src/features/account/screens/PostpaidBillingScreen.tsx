import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  AlertCircleIcon,
  Calendar03Icon,
  Invoice01Icon,
} from '@hugeicons/core-free-icons';
import { colors, spacing, typography, dimensions, shadows } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import Text from '@/shared/components/base/Text';
import Button from '@/shared/components/base/Button';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { usePostpaidData } from '../hooks/usePostpaid';
import type { RootStackParamList } from '@/navigation/types';

type PostpaidBillingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BillingPeriod {
  id: string;
  periodName: string;
  billingDate: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'current' | 'overdue' | 'upcoming';
  paidDate?: string;
  lateFee?: number;
}

const PostpaidBillingScreen: React.FC = () => {
  const { t } = useTranslation('account');
  const navigation = useNavigation<PostpaidBillingScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const { data: postpaidResponse } = usePostpaidData();
  const postpaidData = postpaidResponse?.success ? postpaidResponse.data : null;

  // Mock billing periods data
  const [billingPeriods] = useState<BillingPeriod[]>([
    {
      id: '1',
      periodName: 'Kỳ 12/2025',
      billingDate: '2025-11-24',
      dueDate: '2025-12-10',
      amount: 2500000,
      status: 'current',
    },
    {
      id: '4',
      periodName: 'Kỳ 11/2025',
      billingDate: '2025-10-24',
      dueDate: '2025-11-10',
      amount: 1500000,
      status: 'overdue',
      lateFee: 50000,
    },
    {
      id: '2',
      periodName: 'Kỳ 10/2025',
      billingDate: '2025-09-24',
      dueDate: '2025-10-10',
      amount: 1800000,
      status: 'paid',
      paidDate: '2025-11-08',
    },
    {
      id: '3',
      periodName: 'Kỳ 09/2025',
      billingDate: '2025-08-24',
      dueDate: '2025-09-10',
      amount: 3200000,
      status: 'paid',
      paidDate: '2025-10-05',
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusInfo = (status: BillingPeriod['status']) => {
    switch (status) {
      case 'paid':
        return {
          icon: CheckmarkCircle02Icon,
          color: colors.success,
          bgColor: colors.successSoft,
          text: t('postpaid.billing.statusPaid'),
        };
      case 'current':
        return {
          icon: Clock01Icon,
          color: colors.warning,
          bgColor: colors.warningSoft || '#FFF8E1',
          text: t('postpaid.billing.statusCurrent'),
        };
      case 'overdue':
        return {
          icon: AlertCircleIcon,
          color: colors.danger,
          bgColor: colors.dangerSoft || '#FFEBEE',
          text: t('postpaid.billing.statusOverdue'),
        };
      case 'upcoming':
        return {
          icon: Calendar03Icon,
          color: colors.text.secondary,
          bgColor: colors.lightGray,
          text: t('postpaid.billing.statusUpcoming'),
        };
      default:
        return {
          icon: Calendar03Icon,
          color: colors.text.secondary,
          bgColor: colors.lightGray,
          text: status,
        };
    }
  };

  const handleBack = () => navigation.goBack();

  const handlePayPeriod = (period: BillingPeriod) => {
    // Navigate to payment logic
    if (!postpaidData) return;
    navigation.navigate('PostpaidPaymentOptions', {
      billingPeriod: period,
      postpaidData: { ...postpaidData } as any,
    });
  };

  const handlePayAll = () => {
    if (!postpaidData) return;

    // Filter unpaid periods
    const periodsToPay = billingPeriods.filter(p => p.status !== 'paid');

    if (periodsToPay.length > 0) {
      // Calculate total amount including late fees
      const totalAmount = periodsToPay.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);

      // Determine overall status and earliest due date
      const hasOverdue = periodsToPay.some(p => p.status === 'overdue');
      // Sort to find earliest due date
      const sortedByDate = [...periodsToPay].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      const earliestDueDate = sortedByDate[0].dueDate;

      // Create a synthetic "Total" billing period
      const totalBillingPeriod: BillingPeriod = {
        id: 'total_combined',
        periodName: t('loan.totalPayment'), // Uses "Tổng dư nợ" or similar
        billingDate: new Date().toISOString(), // Current date as simpler placeholder
        dueDate: earliestDueDate,
        amount: totalAmount,
        status: hasOverdue ? 'overdue' : 'current',
      };

      navigation.navigate('PostpaidPaymentOptions', {
        billingPeriod: totalBillingPeriod,
        postpaidData: { ...postpaidData } as any,
      });
    }
  };

  const calculateDaysRemaining = (dueDateStr: string) => {
    const today = new Date();
    const dueDate = new Date(dueDateStr);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Logic for Multi-Period
  const unpaidPeriods = billingPeriods.filter(p => p.status !== 'paid');
  const overduePeriods = unpaidPeriods.filter(p => p.status === 'overdue');
  const totalUnpaidAmount = unpaidPeriods.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
  const isMultipleUnpaid = unpaidPeriods.length > 1;
  const hasOverdue = overduePeriods.length > 0;

  // For single period display
  const primaryPeriod = unpaidPeriods[0];
  const primaryDaysRemaining = primaryPeriod ? calculateDaysRemaining(primaryPeriod.dueDate) : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScreenHeader
          title={t('postpaid.billing.title')}
          titleStyle={{ color: colors.light }}
          backIconColor={colors.light}
          showBack={true}
          onBackPress={handleBack}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Card - Handles Single or Multiple */}
        {unpaidPeriods.length > 0 && (
          <View style={[
            styles.currentPeriodCard,
            hasOverdue && styles.currentPeriodUrgent
          ]}>
            {isMultipleUnpaid ? (
              // Multiple Periods Layout
              <>
                <View style={styles.multiPeriodHeader}>
                  <HugeiconsIcon icon={Invoice01Icon} size={20} color={colors.text.secondary} />
                  <Text style={styles.currentPeriodTitle}>
                    {t('loan.totalPayment')}
                  </Text>
                  {hasOverdue && (
                    <View style={styles.warningBadge}>
                      <HugeiconsIcon icon={AlertCircleIcon} size={12} color={colors.danger} />
                      <Text style={styles.warningText}>{overduePeriods.length} {t('postpaid.billing.statusOverdue')}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.currentPeriodAmountValue}>
                    {formatCurrency(totalUnpaidAmount)}
                  </Text>
                  <Text style={styles.currentPeriodAmountLabel}>
                    {unpaidPeriods.length} {t('postpaid.billing.periodsUnpaid')}
                  </Text>
                </View>

                {/* Brief list of unpaid periods */}
                <View style={styles.unpaidList}>
                  {unpaidPeriods.map(period => (
                    <View key={period.id} style={styles.unpaidItemRow}>
                      <Text style={styles.unpaidItemName}>{period.periodName}</Text>
                      <View style={styles.unpaidItemRight}>
                        <Text style={styles.unpaidItemAmount}>{formatCurrency(period.amount + (period.lateFee || 0))}</Text>
                        {period.status === 'overdue' && (
                          <Text style={styles.unpaidItemOverdue}>{t('postpaid.billing.overdueShort')}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                <Button
                  label={`${t('loan.payNow')} (${formatCurrency(totalUnpaidAmount)})`}
                  onPress={handlePayAll}
                  variant={hasOverdue ? 'danger' : 'primary'}
                  fullWidth
                  style={styles.payButton}
                />
              </>
            ) : (
              // Single Period Layout (Existing Simplified)
              <>
                <View style={styles.currentPeriodHeader}>
                  <HugeiconsIcon icon={Invoice01Icon} size={20} color={colors.text.secondary} />
                  <Text style={styles.currentPeriodTitle}>{primaryPeriod.periodName}</Text>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.currentPeriodAmountValue}>{formatCurrency(primaryPeriod.amount + (primaryPeriod.lateFee || 0))}</Text>
                  <Text style={styles.currentPeriodAmountLabel}>{t('postpaid.billing.amountDue')}</Text>
                </View>

                <View style={styles.dueDateContainer}>
                  <Text style={styles.dueDateLabel}>
                    {t('loan.dueDate')}: <Text style={[styles.dueDateValue, (hasOverdue || primaryDaysRemaining <= 5) && styles.urgentText]}>{formatDate(primaryPeriod.dueDate)}</Text>
                  </Text>
                  {primaryPeriod.status === 'overdue' ? (
                    <Text style={[styles.daysRemainingText, styles.daysRemainingTextUrgent]}>
                      ({t('postpaid.billing.statusOverdue')})
                    </Text>
                  ) : primaryDaysRemaining >= 0 && primaryDaysRemaining <= 10 ? (
                    <Text style={[styles.daysRemainingText, primaryDaysRemaining <= 5 && styles.daysRemainingTextUrgent]}>
                      ({primaryDaysRemaining} {t('loan.daysLeft')})
                    </Text>
                  ) : null}
                </View>

                <Button
                  label={t('loan.payNow')}
                  onPress={() => handlePayPeriod(primaryPeriod)}
                  variant={(hasOverdue || primaryDaysRemaining <= 5) ? 'danger' : 'primary'}
                  fullWidth
                  style={styles.payButton}
                />
              </>
            )}
          </View>
        )}

        {/* Billing History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>{t('postpaid.billing.billingHistory')}</Text>

          {billingPeriods.map((period, index) => {
            const statusInfo = getStatusInfo(period.status);
            const isPaid = period.status === 'paid';

            return (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodCard,
                  index === billingPeriods.length - 1 && styles.periodCardLast,
                ]}
                onPress={() => !isPaid && handlePayPeriod(period)}
                disabled={isPaid}
              >
                <View style={styles.periodInfo}>
                  <Text style={styles.periodName}>{period.periodName}</Text>
                  <Text style={styles.periodDates}>
                    {t('loan.dueDate')}: {formatDate(period.dueDate)}
                  </Text>
                </View>

                <View style={styles.periodRight}>
                  <Text style={[
                    styles.periodAmount,
                    isPaid && styles.paidAmount,
                    period.status === 'overdue' && styles.overdueAmount,
                  ]}>
                    {formatCurrency(period.amount)}
                  </Text>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  billingCycleCard: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cycleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cycleDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  cycleLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  cycleValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cycleNote: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  currentPeriodCard: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentPeriodUrgent: {
    borderColor: colors.danger,
    borderWidth: 1,
    backgroundColor: colors.dangerSoft ? colors.dangerSoft + '10' : '#FFF5F5',
  },
  multiPeriodHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  currentPeriodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft || '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  warningText: {
    ...typography.caption,
    color: colors.danger,
    fontSize: 10,
    fontWeight: '600',
  },
  unpaidList: {
    width: '100%',
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.sm,
    padding: spacing.sm,
  },
  unpaidItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  unpaidItemName: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.secondary,
  },
  unpaidItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unpaidItemAmount: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  unpaidItemOverdue: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentPeriodTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  currentPeriodAmountValue: {
    ...typography.h1,
    fontWeight: '700',
    fontSize: 32,
    color: colors.text.primary,
    marginBottom: 4,
  },
  currentPeriodAmountLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  dueDateLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  dueDateValue: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  daysRemainingText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  daysRemainingTextUrgent: {
    color: colors.warning,
  },
  urgentText: {
    color: colors.warning,
  },
  payButton: {
    width: '100%',
  },
  historySection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  periodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodCardLast: {
    marginBottom: 0,
  },
  periodInfo: {
    flex: 1,
  },
  periodName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  periodDates: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  periodRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  periodAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  paidAmount: {
    color: colors.success,
  },
  overdueAmount: {
    color: colors.danger,
  },
  statusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '500',
  },
});

export default PostpaidBillingScreen;
