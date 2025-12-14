import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions, typography } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CreditCardIcon } from '@hugeicons/core-free-icons';
import { CreditLimitProgressBar } from './CreditLimitProgressBar';
import { PaymentDateProgressBar } from './PaymentDateProgressBar';
import { BlurCardWrapper } from './BlurCardWrapper';
import type { MyPostPaidResponse, PostpaidStatus, PostpaidCycle, PaymentStatus } from '../types/accountType';
import type { RootStackParamList } from '@/navigation/types';
import { getUserTypeColor } from '@/shared/themes/colors';

interface PostpaidCardProps {
  postpaidData?: MyPostPaidResponse['data'];
  isLoading?: boolean;
  onPress?: () => void;
  onActivatePress?: () => void;
  onReactivatePress?: () => void;
  isActivationLoading?: boolean;
}

export const PostpaidCard: React.FC<PostpaidCardProps> = ({
  postpaidData,
  isLoading: _isLoading = false,
  onPress,
  onActivatePress,
  onReactivatePress,
  isActivationLoading = false,
}) => {
  const { t } = useTranslation('account');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      // style: 'currency',
      // currency: 'VND',
    }).format(amount);
  };

  // Calculate available credit
  const availableCredit = postpaidData ? postpaidData.creditLimit - postpaidData.spentCredit : 0;

  // Check if current date is within 10 days of due date
  const isWithinPaymentPeriod = (dueDate: string): boolean => {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDifference = due.getTime() - today.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysDifference <= 10 && daysDifference >= 0;
  };

  // Calculate days remaining until due date
  const getDaysRemaining = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDifference = due.getTime() - today.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
  };

  // Get payment status badge style and text
  const getPaymentStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return {
          style: styles.paidBadge,
          text: t('loan.paid', 'Đã thanh toán'),
          color: colors.success,
        };
      case 'PARTIAL_PAID':
        return {
          style: styles.partialPaidBadge,
          text: t('loan.partialPaid', 'Thanh toán một phần'),
          color: colors.warning,
        };
      case 'OVERDUE':
        return {
          style: styles.overdueBadge,
          text: t('loan.overdue', 'Quá hạn'),
          color: colors.danger,
        };
      case 'UNPAID':
      default:
        return {
          style: styles.unpaidBadge,
          text: t('loan.unpaid', 'Chưa thanh toán'),
          color: colors.text.secondary,
        };
    }
  };

  // If no postpaid data, show activation card
  if (!postpaidData) {
    return (
      <Pressable style={styles.activationCard} onPress={onActivatePress}>
        <View style={styles.activationIconContainer}>
          <HugeiconsIcon icon={CreditCardIcon} size={32} color={getUserTypeColor()} />
        </View>
        <View style={styles.activationContent}>
          <Text style={styles.activationTitle}>
            {t('loan.activatePostpaid', 'Kích hoạt ví trả sau')}
          </Text>
          <Text style={styles.activationSubtitle}>
            {t('loan.activateDescription', 'Mua trước, trả sau với hạn mức tín dụng lên đến 50 triệu VND')}
          </Text>
        </View>
        <View style={styles.activationArrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </Pressable>
    );
  }

  const _progressPercentage = postpaidData.creditLimit > 0
    ? (postpaidData.spentCredit / postpaidData.creditLimit) * 100
    : 0;

  // Get status badge style and text based on status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          style: styles.activeBadge,
          text: t('espay.active', 'Hoạt động'),
        };
      case 'PENDING':
        return {
          style: styles.pendingBadge,
          text: t('espay.pending', 'Chờ duyệt'),
        };
      case 'LOCKED':
        return {
          style: styles.lockedBadge,
          text: t('espay.locked', 'Tạm khóa'),
        };
      case 'INACTIVE':
      default:
        return {
          style: styles.inactiveBadge,
          text: t('espay.inactive', 'Chưa kích hoạt'),
        };
    }
  };

  const statusConfig = getStatusConfig(postpaidData.status);

  // Handle payment navigation
  const handlePaymentPress = () => {
    if (postpaidData) {
      // Always use main account as payment source for postpaid payments
      const mainAccountPaymentSource = {
        id: 'main_account',
        type: 'main_account' as const,
        balance: 0, // Balance will be validated in the payment flow
        accountNumber: 'Main Account',
        isDefault: true,
      };

      navigation.navigate('PostpaidPaymentConfirm', {
        amount: postpaidData.spentCredit, // Total payment amount is the spent credit
        postpaidData,
        paymentSource: mainAccountPaymentSource,
      });
    }
  };

  return (
    <BlurCardWrapper
      status={postpaidData.status as PostpaidStatus}
      isLoading={isActivationLoading}
      onActivatePress={onActivatePress}
      onReactivatePress={onReactivatePress}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <HugeiconsIcon icon={CreditCardIcon} size={24} color={colors.light} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.cardTitle}>
              {t('loan.postpaidWallet', 'Ví trả sau ESPay')}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, statusConfig.style]}>
              <Text style={styles.statusText}>
                {statusConfig.text}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.creditInfo}>
          {/* Total Amount Due - Highlighted Section */}
          {postpaidData.amountDueTotal > 0 && (
            <View style={styles.amountDueContainer}>
              <Text style={styles.amountDueLabel}>
                {t('loan.totalAmountDue', 'Tổng số tiền cần thanh toán')}
              </Text>
              <Text style={styles.amountDueValue}>
                {formatCurrency(postpaidData.amountDueTotal)} đ
              </Text>
            </View>
          )}

          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>
              {t('loan.availableCredit', 'Hạn mức khả dụng')}
            </Text>
            <Text style={styles.creditAmount}>
              {formatCurrency(availableCredit)} đ
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <CreditLimitProgressBar
              spentCredit={postpaidData.spentCredit}
              creditLimit={postpaidData.creditLimit}
              height={6}
            />
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>
                {t('loan.used', 'Đã sử dụng')}: {formatCurrency(postpaidData.spentCredit)} đ
              </Text>
              <Text style={styles.progressLabel}>
                {formatCurrency(postpaidData.creditLimit)} đ
              </Text>
            </View>
          </View>

          <View style={styles.creditDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t('loan.totalSpent', 'Tổng đã sử dụng')}
              </Text>
              <Text style={styles.detailValue}>
                {formatCurrency(postpaidData.spentCredit)} đ
              </Text>
            </View>
            {postpaidData.spentCredit > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t('loan.dueDate', 'Ngày đáo hạn')}
                </Text>
                <View style={styles.dueDateContainer}>
                  <Text style={styles.detailValue}>
                    {new Date(postpaidData.dueDate).toLocaleDateString('vi-VN')}
                  </Text>
                  {isWithinPaymentPeriod(postpaidData.dueDate) && (
                    <Text style={styles.daysRemainingText}>
                      ({getDaysRemaining(postpaidData.dueDate)} {t('loan.daysLeft', 'ngày')})
                    </Text>
                  )}
                  {getDaysRemaining(postpaidData.dueDate) < 0 && (
                    <Text style={styles.overdueText}>
                      (Quá hạn)
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {postpaidData.spentCredit > 0 && (
            <View style={styles.paymentDateProgressContainer}>
              <PaymentDateProgressBar
                dueDate={postpaidData.dueDate}
                height={6}
              />
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>
                  {getDaysRemaining(postpaidData.dueDate) >= 0
                    ? `${getDaysRemaining(postpaidData.dueDate)} ${t('loan.daysLeft', 'ngày còn lại')}`
                    : `${Math.abs(getDaysRemaining(postpaidData.dueDate))} ${t('loan.daysOverdue', 'ngày quá hạn')}`}
                </Text>
                <Text style={styles.progressLabel}>
                  {t('loan.dueDate', 'Đáo hạn')}
                </Text>
              </View>
              {getDaysRemaining(postpaidData.dueDate) < 0 && (
                <Text style={styles.overdueMessage}>
                  {t('loan.overdueMessage', 'Thanh toán đã quá hạn. Vui lòng thanh toán ngay để tránh phí phạt.')}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Cycles list */}
        {postpaidData.cycles && postpaidData.cycles.length > 0 && (
          <View style={styles.cyclesContainer}>
            <Text style={styles.cyclesTitle}>
              {t('loan.paymentHistory', 'Lịch sử thanh toán')}
            </Text>
            {postpaidData.cycles.map((cycle: PostpaidCycle, index: number) => {
              const paymentStatusConfig = getPaymentStatusConfig(cycle.paymentStatus);
              const daysRemaining = getDaysRemaining(cycle.dueDate);
              const isOverdue = daysRemaining < 0;

              return (
                <View key={cycle.cycleId} style={styles.cycleCard}>
                  <View style={styles.cycleHeader}>
                    <View style={styles.cycleHeaderLeft}>
                      <Text style={styles.cycleNumber}>
                        {t('loan.cycle', 'Kỳ')} {postpaidData.cycles.length - index}
                      </Text>
                      <Text style={styles.cyclePeriod}>
                        {new Date(cycle.startDate).toLocaleDateString('vi-VN')} - {new Date(cycle.endDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <View style={[styles.paymentStatusBadge, paymentStatusConfig.style]}>
                      <Text style={[styles.paymentStatusText, { color: paymentStatusConfig.color }]}>
                        {paymentStatusConfig.text}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cycleBody}>
                    <View style={styles.cycleRow}>
                      <Text style={styles.cycleLabel}>
                        {t('loan.amountDue', 'Số tiền cần trả')}
                      </Text>
                      <Text style={[styles.cycleAmount, isOverdue && styles.overdueAmount]}>
                        {formatCurrency(cycle.amountDue)} đ
                      </Text>
                    </View>

                    <View style={styles.cycleRow}>
                      <Text style={styles.cycleLabel}>
                        {t('loan.dueDate', 'Ngày đáo hạn')}
                      </Text>
                      <View style={styles.cycleDateContainer}>
                        <Text style={styles.cycleValue}>
                          {new Date(cycle.dueDate).toLocaleDateString('vi-VN')}
                        </Text>
                        {cycle.paymentStatus === 'UNPAID' && daysRemaining >= 0 && daysRemaining <= 10 && (
                          <Text style={styles.cycleDaysRemaining}>
                            ({daysRemaining} {t('loan.daysLeft', 'ngày')})
                          </Text>
                        )}
                        {isOverdue && cycle.paymentStatus !== 'PAID' && (
                          <Text style={styles.cycleOverdueText}>
                            (Quá hạn {Math.abs(daysRemaining)} ngày)
                          </Text>
                        )}
                      </View>
                    </View>

                    {cycle.paymentStatus === 'UNPAID' && (
                      <View style={styles.cycleRow}>
                        <Text style={styles.cycleLabel}>
                          {t('loan.gracePeriodEndDate', 'Hạn gia hạn')}
                        </Text>
                        <Text style={styles.cycleValue}>
                          {new Date(cycle.gracePeriodEndDate).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {postpaidData.amountDueTotal > 0 && (
          <Pressable style={styles.paymentButton} onPress={handlePaymentPress}>
            <Text style={styles.paymentButtonText}>
              {t('loan.payNow') || 'Thanh toán ngay'}
            </Text>
          </Pressable>
        )}
      </View>
    </BlurCardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40, // keep visual size
    height: 40,
    backgroundColor: getUserTypeColor(),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.title,
  },
  cardSubtitle: {
    ...typography.caption,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.sm,
  },
  activeBadge: {
    backgroundColor: colors.successSoft,
  },
  inactiveBadge: {
    backgroundColor: colors.dangerSoft,
  },
  pendingBadge: {
    backgroundColor: colors.primaryLight,
  },
  lockedBadge: {
    backgroundColor: colors.warningSoft,
  },
  statusText: {
    fontSize: dimensions.fontSize.sm,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: getUserTypeColor(),
  },
  creditInfo: {
    gap: spacing.md,
  },
  // Amount Due Highlighted Section
  amountDueContainer: {
    backgroundColor: colors.dangerSoft,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
  },
  amountDueLabel: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  amountDueValue: {
    ...typography.h2,
    color: colors.danger,
    fontWeight: '700',
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: spacing.md,
  },
  creditLabel: {
    ...typography.subtitle,
    color: colors.text.secondary,
  },
  creditAmount: {
    ...typography.h2,
    fontSize: dimensions.fontSize.xxxl,
    color: getUserTypeColor(),
    fontWeight: '700',
  },
  progressContainer: {
    // marginBottom: spacing.md,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progressLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  creditDetails: {
    gap: spacing.sm,
    // marginTop: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: dimensions.fontSize.md,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
  },
  // Activation card styles
  activationCard: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  activationIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.primaryLight,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activationContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  activationTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  activationSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  activationArrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: dimensions.fontSize.xxxl,
    color: colors.text.secondary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    lineHeight: 32, // xxl line height token
  },
  paymentButton: {
    paddingVertical: spacing.lg,
    backgroundColor: getUserTypeColor(),
    borderRadius: dimensions.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentButtonText: {
    color: colors.text.light,
    fontSize: dimensions.fontSize.lg,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    lineHeight: 20, // md line height token
  },
  dueDateContainer: {
    alignItems: 'flex-end',
  },
  daysRemainingText: {
    fontSize: dimensions.fontSize.sm,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.warning,
    lineHeight: 18,
  },
  overdueText: {
    fontSize: dimensions.fontSize.sm,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.danger,
  },
  overdueMessage: {
    fontSize: dimensions.fontSize.md,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.danger,
    paddingVertical: spacing.xs,
  },
  paymentDateProgressContainer: {
    // gap: spacing.sm,
  },
  progressTitle: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: dimensions.fontSize.sm,
  },
  // Cycles list styles
  cyclesContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  cyclesTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cycleCard: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cycleHeaderLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  cycleNumber: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  cyclePeriod: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  paymentStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.sm,
  },
  paidBadge: {
    backgroundColor: colors.successSoft,
  },
  unpaidBadge: {
    backgroundColor: colors.lightGray,
  },
  partialPaidBadge: {
    backgroundColor: colors.warningSoft,
  },
  overdueBadge: {
    backgroundColor: colors.dangerSoft,
  },
  paymentStatusText: {
    fontSize: dimensions.fontSize.sm,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  cycleBody: {
    gap: spacing.sm,
  },
  cycleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cycleLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  cycleAmount: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontWeight: '600',
  },
  overdueAmount: {
    color: colors.danger,
  },
  cycleValue: {
    ...typography.body,
    color: colors.text.primary,
  },
  cycleDateContainer: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  cycleDaysRemaining: {
    fontSize: dimensions.fontSize.sm,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.warning,
  },
  cycleOverdueText: {
    fontSize: dimensions.fontSize.sm,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.danger,
  },
});
