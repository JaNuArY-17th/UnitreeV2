import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, dimensions, typography } from '@/shared/themes';
import { Text } from '@/shared/components';
import type { DashboardResponse } from '../types/report';

interface ExpenseTrendChartProps {
  dashboardData?: DashboardResponse;
}

export const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({ dashboardData }) => {
  const { t } = useTranslation('report');

  // Prepare income chart data from incomeTransactionChart
  const incomeChartData = useMemo(() => {
    if (!dashboardData?.data?.incomeTransactionChart) return [];
    return dashboardData.data.incomeTransactionChart.map(item => ({
      value: item.incomeAmount / 1000000,
      label: item.month,
      frontColor: colors.success,
      topLabelComponent: () => (
        <Text style={styles.topLabelText}>
          {(item.incomeAmount / 1000000).toFixed(1)}M
        </Text>
      ),
    }));
  }, [dashboardData?.data?.incomeTransactionChart]);

  // Prepare income data from incomeExpenseChart
  const incomeBarData = useMemo(() => {
    if (!dashboardData?.data?.incomeExpenseChart) return [];
    return dashboardData.data.incomeExpenseChart.map(item => ({
      value: parseFloat(item.IncomeAmount || '0') / 1000000,
      label: item.month,
      frontColor: colors.success,
      topLabelComponent: () => (
        <Text style={styles.topLabelText}>
          {(parseFloat(item.IncomeAmount || '0') / 1000000).toFixed(1)}M
        </Text>
      ),
    }));
  }, [dashboardData?.data?.incomeExpenseChart]);

  // Prepare expense data from incomeExpenseChart
  const expenseBarData = useMemo(() => {
    if (!dashboardData?.data?.incomeExpenseChart) return [];
    return dashboardData.data.incomeExpenseChart.map(item => ({
      value: parseFloat(item.ExpenseAmount || '0') / 1000000,
      label: item.month,
      frontColor: colors.danger,
      topLabelComponent: () => (
        <Text style={styles.topLabelText}>
          {(parseFloat(item.ExpenseAmount || '0') / 1000000).toFixed(1)}M
        </Text>
      ),
    }));
  }, [dashboardData?.data?.incomeExpenseChart]);

  // Line data for expense chart
  const expenseLineData = useMemo(() => {
    if (!dashboardData?.data?.incomeExpenseChart) return [];
    return dashboardData.data.incomeExpenseChart.map(item => ({
      value: parseFloat(item.ExpenseAmount || '0') / 1000000,
      dataPointText: '',
    }));
  }, [dashboardData?.data?.incomeExpenseChart]);

  // Calculate max values
  const maxIncome = Math.max(...incomeChartData.map(item => item.value), 1);
  const maxIncomeExpense = Math.max(
    ...incomeBarData.map(item => item.value),
    ...expenseBarData.map(item => item.value),
    1
  );

  // Format Y-axis labels for charts (show as millions with M suffix)
  const formatYLabel = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue === 0) return '0';
    if (Number.isInteger(numValue)) {
      return `${numValue}M`;
    }
    return `${numValue.toFixed(1)}M`;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('screen.expenseStatistics.expenseTrend')}</Text>
        <Text style={styles.sectionSubtitle}>{t('screen.expenseStatistics.expenseTrendDescription')}</Text>
      </View>

      <View style={styles.container}>
        {/* Chart 1: Income from incomeTransactionChart */}
        <View style={styles.chartSection}>
          <View style={{ alignItems: 'center', marginRight: spacing.xxl * 2 }}>
            <View style={styles.chartHeader}>
              <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
              <Text style={styles.chartTitle}>{t('statistics.income')}</Text>
            </View>
            <BarChart
              data={incomeChartData}
              barWidth={16}
              spacing={24}
              roundedTop
              hideRules={false}
              xAxisThickness={1}
              xAxisColor={colors.border}
              yAxisThickness={0}
              yAxisTextStyle={{ ...typography.caption, color: colors.text.secondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ ...typography.caption, color: colors.text.secondary, fontSize: 10 }}
              noOfSections={4}
              maxValue={maxIncome * 1.15}
              yAxisLabelTexts={
                Array.from({ length: 5 }, (_, i) => {
                  const value = (maxIncome * 1.15 * i) / 4;
                  return formatYLabel(value.toFixed(1));
                })
              }
              height={180}
              width={300}
              isAnimated
              animationDuration={1200}
              showValuesAsTopLabel
              barBorderRadius={4}
            />
          </View>
        </View>

        {/* Chart 2: Expense from incomeExpenseChart */}
        <View style={styles.chartSection}>
          <View style={{ alignItems: 'center', marginRight: spacing.xxl * 2 }}>
            <View style={styles.chartHeader}>
              <View style={[styles.legendColor, { backgroundColor: colors.danger }]} />
              <Text style={styles.chartTitle}>{t('statistics.expense')}</Text>
            </View>
            <BarChart
              data={expenseBarData}
              barWidth={16}
              spacing={24}
              roundedTop
              hideRules={false}
              xAxisThickness={1}
              xAxisColor={colors.border}
              yAxisThickness={0}
              yAxisTextStyle={{ ...typography.caption, color: colors.text.secondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ ...typography.caption, color: colors.text.secondary, fontSize: 10 }}
              noOfSections={4}
              maxValue={maxIncomeExpense * 1.15}
              yAxisLabelTexts={
                Array.from({ length: 5 }, (_, i) => {
                  const value = (maxIncomeExpense * 1.15 * i) / 4;
                  return formatYLabel(value.toFixed(1));
                })
              }
              height={180}
              width={300}
              isAnimated
              animationDuration={1200}
              showValuesAsTopLabel
              barBorderRadius={4}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,

  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.light,
    paddingHorizontal: spacing.lg,
  },
  chartSection: {
    marginBottom: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  topLabelText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.primary,
    textAlign: 'center',
  },
});

export default ExpenseTrendChart;
