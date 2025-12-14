import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  // Pressable,
  // Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors, spacing, dimensions, typography } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatVND } from '@/shared/utils/format';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Invoice01Icon, MoneyBag02Icon, PercentCircleIcon } from '@hugeicons/core-free-icons';

import {
  DateRangePicker,
  TotalRevenue,
  RevenueCard,
  RevenueOrdersChart,
  StatisticHeader,
} from '../components';
import { Text, BackgroundPatternSolid } from '@/shared/components';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';
import { useDashboardReport } from '../hooks';
import { useTransactionHistory } from '@/features/transactions/hooks';
// import HistoryItem from '@/features/transactions/components/HistoryItem';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useNavigation } from '@react-navigation/native';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ReportScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const { t } = useTranslation('report');
  const { t: tCommon } = useTranslation('common');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  useStatusBarEffect('transparent', 'light-content', true);

  // Set default date range to this month (1st of month to today)
  useEffect(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const defaultRange = {
      startDate: startOfMonth,
      endDate: today,
      label: t('dateRange.thisMonth')
    };
    setSelectedDateRange(defaultRange);
  }, [t]);

  // Use dashboard report hook
  const dashboardParams = selectedDateRange ? {
    fromDate: `${selectedDateRange.startDate.getDate().toString().padStart(2, '0')}/${(selectedDateRange.startDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDateRange.startDate.getFullYear()}`,
    toDate: `${selectedDateRange.endDate.getDate().toString().padStart(2, '0')}/${(selectedDateRange.endDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDateRange.endDate.getFullYear()}`
  } : null;

  const { data: dashboardData, refetch: refetchDashboard } = useDashboardReport(
    dashboardParams || { fromDate: '', toDate: '' },
    !!dashboardParams
  );

  // Use transaction history hook for income transactions only
  const { data: incomeTransactions, loadingInitial: transactionsLoading, refresh: refreshTransactions } = useTransactionHistory({
    typeFilter: 'deposit', // Only income transactions
    dateFilter: 'all',
    pageSize: 10
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchDashboard(),
      refreshTransactions()
    ]);
    setRefreshing(false);
  };

  const handleDateRangeChange = (range: any) => {
    setSelectedDateRange(range);
    // TODO: Filter data based on selected date range
    console.log('Selected date range:', range);
  };

  const handleResetDateRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const defaultRange = {
      startDate: startOfMonth,
      endDate: today,
      label: t('dateRange.thisMonth')
    };
    setSelectedDateRange(defaultRange);
  };

  const revenueCards = useMemo(() => {
    const dashboard = dashboardData?.data;
    const transactionCount = dashboard?.successfulTransactions?.count || 0;
    const incomeAmount = dashboard?.income?.originalAmount ? parseFloat(dashboard.income.originalAmount) : 0;
    const receivedAmount = dashboard?.income?.receivedAmount ? parseFloat(dashboard.income.receivedAmount) : 0;
    const averageOrderValue = transactionCount > 0 ? incomeAmount / transactionCount : 0;
    const commissionPercentage = dashboard?.income.commissionPercent || 0;

    return [
      {
        title: t('screen.revenueReport.cards.transactions'),
        value: transactionCount.toString(),
        icon: <HugeiconsIcon icon={Invoice01Icon} size={36} color={colors.primary} />,
        trend: { value: 5.2, isPositive: true }
      },
      {
        title: t('screen.revenueReport.cards.averageOrderValue'),
        value: formatVND(averageOrderValue),
        icon: <HugeiconsIcon icon={MoneyBag02Icon} size={36} color={colors.primary} />,
        trend: { value: 3.1, isPositive: true }
      },
      {
        title: t('screen.revenueReport.cards.commissionPercentage'),
        value: commissionPercentage ? `${commissionPercentage.toFixed(2)}%` : '0%',
        icon: <HugeiconsIcon icon={PercentCircleIcon} size={36} color={colors.primary} />,
        trend: { value: 3.1, isPositive: true }
      }
    ];
  }, [t, dashboardData]);

  const handleViewAllTransactions = () => {
    navigation.replace('Main', { screen: 'History' });
  };

  return (
    <VerificationRequiredOverlay>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor='transparent' translucent />

        <BackgroundPatternSolid backgroundColor={colors.primary} patternColor={colors.light} patternOpacity={3} />

        <StatisticHeader />

        <View style={styles.headerDatePicker}>
          {/* Date Range Picker */}
          <DateRangePicker
            selectedRange={selectedDateRange}
            onRangeChange={handleDateRangeChange}
            onReset={handleResetDateRange}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >

          {/* Total Revenue Display */}
          <TotalRevenue
            incomeAmount={dashboardData?.data?.income?.originalAmount ? parseFloat(dashboardData.data.income.originalAmount) : 0}
            receivedAmount={dashboardData?.data?.income?.receivedAmount ? parseFloat(dashboardData.data.income.receivedAmount) : 0}
          />

          {/* Revenue Cards */}
          <View style={styles.cardsSection}>
            <View style={styles.cardsContainer}>
              <RevenueCard {...revenueCards[0]} />
              <RevenueCard {...revenueCards[1]} />
              <RevenueCard {...revenueCards[2]} />
            </View>
          </View>

          {/* Revenue and Orders Chart */}
          <View style={styles.chartSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('screen.revenueReport.revenueAndOrders')}</Text>
              <Text style={styles.sectionSubtitle}>{t('screen.revenueReport.revenueAndOrdersDescription')}</Text>
            </View>
            <View style={styles.chartContainer}>
              <RevenueOrdersChart data={dashboardData?.data?.incomeTransactionChart || []} />
            </View>
          </View>

     

        </ScrollView>
      </View>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerDatePicker: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.light,
    borderTopLeftRadius: dimensions.radius.xl,
    borderTopRightRadius: dimensions.radius.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 120,
  },
  // Revenue Cards Section
  cardsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  // Chart Section
  chartSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  chartContainer: {
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  // Transaction Section
  transactionSection: {
    marginBottom: spacing.lg,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewAllText: {
    ...typography.body,
    color: colors.primary,
  },
  transactionsContainer: {
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: 'hidden',
  },
  // Loading & Empty States
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
