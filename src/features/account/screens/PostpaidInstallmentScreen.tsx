import React, { useState } from 'react';
import { View, StyleSheet, FlatList, StatusBar, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Calendar03Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CheckmarkSquare02Icon,
  SquareIcon,
  Invoice01Icon,
  Coins01Icon
} from '@hugeicons/core-free-icons';
import type { RootStackParamList } from '@/navigation/types';
import { usePostpaidData } from '../hooks/usePostpaid';

type PostpaidInstallmentNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Định nghĩa interface cho dư nợ theo tháng
interface MonthlyDebt {
  id: string;
  month: number;
  year: number;
  periodName: string;
  billingDate: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'current' | 'overdue' | 'upcoming';
  paidDate?: string;
  lateFee?: number;
}

const PostpaidInstallmentScreen: React.FC = () => {
  const { t } = useTranslation('account');
  const navigation = useNavigation<PostpaidInstallmentNavigationProp>();
  const insets = useSafeAreaInsets();

  const { data: postpaidResponse } = usePostpaidData();
  const postpaidData = postpaidResponse?.success ? postpaidResponse.data : null;

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

  // Mock dữ liệu dư nợ theo tháng
  const monthlyDebts: MonthlyDebt[] = [
    {
      id: '1',
      month: 12,
      year: 2025,
      periodName: 'Kỳ 12/2025',
      billingDate: '2025-11-24',
      dueDate: '2025-12-10',
      amount: postpaidData?.spentCredit || 5200000,
      status: 'current',
    },
    {
      id: '2',
      month: 11,
      year: 2025,
      periodName: 'Kỳ 11/2025',
      billingDate: '2025-10-24',
      dueDate: '2025-11-10',
      amount: 3800000,
      status: 'overdue',
      lateFee: 30000,
    },
    {
      id: '3',
      month: 10,
      year: 2025,
      periodName: 'Kỳ 10/2025',
      billingDate: '2025-09-24',
      dueDate: '2025-10-10',
      amount: 2500000,
      status: 'paid',
      paidDate: '2025-10-08',
    },
    {
      id: '4',
      month: 9,
      year: 2025,
      periodName: 'Kỳ 09/2025',
      billingDate: '2025-08-24',
      dueDate: '2025-09-10',
      amount: 4200000,
      status: 'paid',
      paidDate: '2025-09-05',
    },
  ];

  // Lọc dữ liệu
  const unpaidDebts = monthlyDebts.filter(d => d.status !== 'paid');
  const paidDebts = monthlyDebts.filter(d => d.status === 'paid');

  // Tính toán
  const totalUnpaidDebt = unpaidDebts.reduce((sum, d) => sum + d.amount + (d.lateFee || 0), 0);

  const selectedTotal = unpaidDebts
    .filter(d => selectedPeriods.includes(d.id))
    .reduce((sum, d) => sum + d.amount + (d.lateFee || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusInfo = (status: MonthlyDebt['status']) => {
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const toggleSelectPeriod = (id: string) => {
    setSelectedPeriods(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      }
      return [...prev, id];
    });
  };

  const selectAllPeriods = () => {
    if (selectedPeriods.length === unpaidDebts.length) {
      setSelectedPeriods([]);
    } else {
      setSelectedPeriods(unpaidDebts.map(d => d.id));
    }
  };

  const handlePaySelected = () => {
    if (selectedPeriods.length === 0) {
      Alert.alert(t('postpaid.payment.error'), t('postpaid.monthly.selectAtLeastOne'));
      return;
    }
    const selectedDebts = unpaidDebts.filter(d => selectedPeriods.includes(d.id));
    navigation.navigate('PostpaidPaymentConfirm', {
      amount: selectedTotal,
      postpaidData: {
        userId: postpaidData?.userId || 'user-id',
        creditLimit: postpaidData?.creditLimit || 50000000,
        spentCredit: selectedTotal,
        commissionPercent: postpaidData?.commissionPercent || 0,
        status: postpaidData?.status || 'ACTIVE',
        dueDate: selectedDebts[0]?.dueDate || new Date().toISOString(),
        createdAt: postpaidData?.createdAt || new Date().toISOString(),
        updatedAt: postpaidData?.updatedAt || new Date().toISOString(),
      },
      paymentSource: {
        id: 'main-1',
        type: 'main_account',
        balance: 50000000,
        accountNumber: '190333888999',
      },
    });
  };

  const handlePayAll = () => {
    if (totalUnpaidDebt <= 0) {
      Alert.alert(t('postpaid.payment.error'), t('postpaid.monthly.noDebtToPay'));
      return;
    }
    navigation.navigate('PostpaidPaymentConfirm', {
      amount: totalUnpaidDebt,
      postpaidData: {
        userId: postpaidData?.userId || 'user-id',
        creditLimit: postpaidData?.creditLimit || 50000000,
        spentCredit: totalUnpaidDebt,
        commissionPercent: postpaidData?.commissionPercent || 0,
        status: postpaidData?.status || 'ACTIVE',
        dueDate: unpaidDebts[0]?.dueDate || new Date().toISOString(),
        createdAt: postpaidData?.createdAt || new Date().toISOString(),
        updatedAt: postpaidData?.updatedAt || new Date().toISOString(),
      },
      paymentSource: {
        id: 'main-1',
        type: 'main_account',
        balance: 50000000,
        accountNumber: '190333888999',
      },
    });
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('postpaid.monthly.totalDebt')}</Text>
            <View style={styles.summaryValueContainer}>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>
                {formatCurrency(totalUnpaidDebt)}
              </Text>
              <HugeiconsIcon icon={Invoice01Icon} size={20} color={colors.danger} />
            </View>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('postpaid.availableBalance')}</Text>
            <View style={styles.summaryValueContainer}>
              <Text style={styles.summaryValue}>
                {formatCurrency((postpaidData?.creditLimit || 0) - (postpaidData?.spentCredit || 0) || 50000000)}
              </Text>
              <HugeiconsIcon icon={Coins01Icon} size={20} color={colors.primary} />
            </View>
          </View>
        </View>

        <View style={styles.horizontalDivider} />

        <View style={styles.summaryBottom}>
          <Text style={styles.summarySubText}>
            {t('postpaid.monthly.unpaidPeriods')}: <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>{unpaidDebts.length}</Text> {t('postpaid.billing.perPeriod')}
          </Text>
        </View>
      </View>

      {/* Actions */}
      {unpaidDebts.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.selectAllBtn} onPress={selectAllPeriods}>
            <HugeiconsIcon
              icon={selectedPeriods.length === unpaidDebts.length ? CheckmarkSquare02Icon : SquareIcon}
              size={22}
              color={colors.primary}
            />
            <Text style={styles.selectAllText}>
              {selectedPeriods.length === unpaidDebts.length
                ? t('postpaid.monthly.deselectAll')
                : t('postpaid.monthly.selectAll')
              }
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.payAllBtn} onPress={handlePayAll}>
            <Text style={styles.payAllText}>{t('postpaid.monthly.payAll')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {unpaidDebts.length > 0 && (
        <Text style={styles.sectionTitle}>{t('postpaid.monthly.unpaidSection')}</Text>
      )}
    </View>
  );

  const renderDebtItem = ({ item }: { item: MonthlyDebt }) => {
    const statusInfo = getStatusInfo(item.status);
    const isSelectable = item.status !== 'paid';
    const isSelected = selectedPeriods.includes(item.id);
    const totalAmount = item.amount + (item.lateFee || 0);

    return (
      <TouchableOpacity
        style={[
          styles.debtCard,
          isSelected && styles.debtCardSelected,
          item.status === 'overdue' && styles.debtCardOverdue,
        ]}
        onPress={() => isSelectable && toggleSelectPeriod(item.id)}
        disabled={!isSelectable}
        activeOpacity={isSelectable ? 0.7 : 1}
      >
        {isSelectable && (
          <View style={styles.checkboxContainer}>
            <HugeiconsIcon
              icon={isSelected ? CheckmarkSquare02Icon : SquareIcon}
              size={24}
              color={isSelected ? colors.primary : colors.text.secondary}
            />
          </View>
        )}

        <View style={styles.debtContent}>
          <View style={styles.debtHeader}>
            <View style={styles.debtInfo}>
              <Text style={styles.periodName}>{item.periodName}</Text>
              <Text style={styles.dueDate}>
                {item.status === 'paid'
                  ? `${t('postpaid.monthly.paidOn')}: ${formatDate(item.paidDate!)}`
                  : `${t('postpaid.billing.dueDate')}: ${formatDate(item.dueDate)}`
                }
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <HugeiconsIcon icon={statusInfo.icon} size={14} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.amountSection}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{t('postpaid.monthly.debt')}</Text>
              <Text style={[
                styles.amountValue,
                item.status === 'paid' && styles.amountPaid,
                item.status === 'overdue' && styles.amountOverdue,
              ]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>

            {item.lateFee && item.lateFee > 0 && (
              <View style={styles.amountRow}>
                <Text style={styles.lateFeeLabel}>{t('postpaid.billing.lateFee')}</Text>
                <Text style={styles.lateFeeValue}>+{formatCurrency(item.lateFee)}</Text>
              </View>
            )}

            {item.lateFee && item.lateFee > 0 && (
              <View style={[styles.amountRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('postpaid.monthly.total')}</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScreenHeader
          title={t('postpaid.monthly.title')}
          titleStyle={{ color: colors.light }}
          backIconColor={colors.light}
          showBack={true}
          onBackPress={handleBack}
        />
      </View>

      <FlatList
        data={[...unpaidDebts, ...paidDebts]}
        renderItem={({ item }) => renderDebtItem({ item })}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        // contentContainerStyle={styles.listContent}
        contentContainerStyle={{ ...styles.listContent, paddingBottom: selectedPeriods.length > 0 ? 120 : spacing.xl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={48} color={colors.success} />
            <Text style={styles.emptyText}>{t('postpaid.monthly.noDebt')}</Text>
          </View>
        }
      />

      {selectedPeriods.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedCount}>
              {t('postpaid.monthly.selected')}: <Text style={{ fontWeight: 'bold', color: colors.primary }}>{selectedPeriods.length}</Text> {t('postpaid.billing.perPeriod')}
            </Text>
            <Text style={styles.selectedAmount}>{formatCurrency(selectedTotal)}</Text>
          </View>
          <TouchableOpacity style={styles.paySelectedBtn} onPress={handlePaySelected}>
            <Text style={styles.paySelectedText}>{t('loan.payNow')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingBottom: spacing.lg,
    zIndex: 1,
  },
  headerContent: {
    // paddingHorizontal: spacing.lg,
    // paddingTop: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.light,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: dimensions.radius.md,
    // Premium Shadow
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  summaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryValue: {
    ...typography.h3,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    opacity: 0.5,
  },
  summaryBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summarySubText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  payAllBtn: {
    backgroundColor: colors.primarySoft || '#E3F2FD',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: spacing.sm,
  },
  payAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: 120, // Extra padding for bottom bar
  },
  debtCard: {
    flexDirection: 'row',
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    // Card Shadow
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent', // Default border transparent
  },
  debtCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft || '#F5FAFF',
  },
  debtCardOverdue: {
    borderColor: colors.dangerSoft || '#FFEBEE',
  },
  checkboxContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  debtContent: {
    flex: 1,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  debtInfo: {
    flex: 1,
  },
  periodName: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },
  dueDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
    opacity: 0.5,
  },
  amountSection: {
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  amountValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  amountPaid: {
    color: colors.success,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  amountOverdue: {
    color: colors.danger,
  },
  lateFeeLabel: {
    ...typography.caption,
    color: colors.danger,
  },
  lateFeeValue: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.danger,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 4,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.subtitle,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.light,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    // Bottom Bar Shadow
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedCount: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  selectedAmount: {
    ...typography.h3,
    fontWeight: 'bold',
    color: colors.primary,
  },
  paySelectedBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md, // Rounded button
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  paySelectedText: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.light,
  },
});

export default PostpaidInstallmentScreen;
