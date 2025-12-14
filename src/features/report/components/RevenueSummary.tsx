import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, dimensions } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatVND } from '@/shared/utils/format';
import { TotalRevenue, RevenueCard, RevenueOrdersChart } from './';
import { Transactions, Price, Percent } from '@/shared/assets';
import { Text } from '@/shared/components';

interface RevenueSummaryProps {
  dashboardData?: any;
  showTotal?: boolean;
  showChart?: boolean;
  showTitle?: boolean;
  backgroundColor?: string;
}

export const RevenueSummary: React.FC<RevenueSummaryProps> = ({
  dashboardData,
  showTotal = true,
  showChart = false,
  showTitle = false,
  backgroundColor
}) => {
  const { t } = useTranslation('report');

  // Debug: Log dashboard data
  React.useEffect(() => {
    if (showChart) {
      console.log('[RevenueSummary] showChart:', showChart);
      console.log('[RevenueSummary] dashboardData:', dashboardData);
      console.log('[RevenueSummary] incomeTransactionChart:', dashboardData?.data?.incomeTransactionChart);
    }
  }, [showChart, dashboardData]);

  const revenueCards = useMemo(() => {
    const dashboard = dashboardData?.data;
    const transactionCount = dashboard?.successfulTransactions?.count || 0;
    const incomeAmount = dashboard?.income?.originalAmount ? parseFloat(dashboard.income.originalAmount) : 0;
    const receivedAmount = dashboard?.income?.receivedAmount ? parseFloat(dashboard.income.receivedAmount) : 0;
    const averageOrderValue = transactionCount > 0 ? incomeAmount / transactionCount : 0;
    const commissionPercentage = dashboard?.commissionPercentage || 0;

    return [
      {
        title: t('screen.revenueReport.cards.transactions'),
        value: transactionCount.toString(),
        icon: <Transactions width={28} height={28} color={colors.primary} />,
        trend: { value: 5.2, isPositive: true }
      },
      {
        title: t('screen.revenueReport.cards.averageOrderValue'),
        value: formatVND(averageOrderValue),
        icon: <Price width={36} height={36} color={colors.primary} />,
        trend: { value: 3.1, isPositive: true }
      },
      {
        title: t('screen.revenueReport.cards.commissionPercentage'),
        value: commissionPercentage ? `${commissionPercentage.toFixed(2)}%` : '0%',
        icon: <Percent width={36} height={36} color={colors.primary} />,
        trend: { value: 3.1, isPositive: true }
      }
    ];
  }, [t, dashboardData]);

  const incomeAmount = dashboardData?.data?.income?.originalAmount ? parseFloat(dashboardData.data.income.originalAmount) : 0;
  const receivedAmount = dashboardData?.data?.income?.receivedAmount ? parseFloat(dashboardData.data.income.receivedAmount) : 0;

  return (
    <View style={styles.container}>
      {showTotal && (
        <TotalRevenue
          incomeAmount={incomeAmount}
          receivedAmount={receivedAmount}
        />
      )}

      {showTitle && (
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>{t('screen.revenueReport.revenueAndOrders')}</Text>
          <Text style={styles.sectionSubtitle}>{t('screen.revenueReport.revenueAndOrdersDescription')}</Text>
        </View>
      )}

      <View style={styles.cardsContainer}>
        <RevenueCard {...revenueCards[0]} backgroundColor={backgroundColor} />
        <View style={styles.cardSeparator} />
        <RevenueCard {...revenueCards[1]} backgroundColor={backgroundColor} />
        <View style={styles.cardSeparator} />
        <RevenueCard {...revenueCards[2]} backgroundColor={backgroundColor} />
      </View>

      {showChart && (
        <View style={styles.chartSection}>
          <View style={styles.chartContainer}>
            <RevenueOrdersChart data={dashboardData?.data?.incomeTransactionChart || []} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardSeparator: {
    width: 1,
    height: 80,
    backgroundColor: colors.lightGray,
    marginHorizontal: spacing.md,
  },
  chartSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,

    color: colors.text.primary,
    flex: 1,
    lineHeight: 28,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  chartContainer: {
    backgroundColor: colors.light,
    paddingHorizontal: spacing.lg,
  },
  emptyChart: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
});
