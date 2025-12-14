import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, dimensions, typography } from '@/shared/themes';
import { formatVND } from '@/shared/utils/format';
import { ModernBackgroundPattern, Text } from '@/shared/components';
import { TrendingUp, TrendingDown } from '@/shared/assets';

export const ExpenseSummary: React.FC = () => {
  const { t } = useTranslation('report');

  // Mock data for expense summary
  const totalExpenses = 45000000; // 45M VND
  const monthlyBudget = 50000000; // 50M VND
  const monthlyTrend = -8.5; // -8.5% (decreased expenses)

  const budgetUsedPercentage = (totalExpenses / monthlyBudget) * 100;

  return (
    <View style={styles.expenseSummary}>
      <ModernBackgroundPattern primaryColor={colors.light} />
      <View style={styles.totalExpenseContainer}>
        <Text style={styles.totalExpenseLabel}>{t('screen.expenseStatistics.totalExpenses')}</Text>
        <Text style={styles.totalExpenseAmount}>{formatVND(totalExpenses)}</Text>
      </View>

      <View style={styles.trendContainer}>
        <View style={[
          styles.trendBadge,
          { backgroundColor: monthlyTrend < 0 ? colors.successSoft : colors.dangerSoft }
        ]}>
          {monthlyTrend < 0 ? (
            <TrendingDown width={16} height={16} color={colors.success} />
          ) : (
            <TrendingUp width={16} height={16} color={colors.danger} />
          )}
          <Text style={[
            styles.trendText,
            { color: monthlyTrend < 0 ? colors.success : colors.danger }
          ]}>
            {monthlyTrend > 0 ? '+' : ''}{monthlyTrend}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  expenseSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: dimensions.radius.lg,
    zIndex: 1,
  },
  totalExpenseContainer: {
    flex: 1,
  },
  totalExpenseLabel: {
    ...typography.body,
    color: colors.light,
    marginBottom: spacing.xs,
  },
  totalExpenseAmount: {
    ...typography.h1,
    fontSize: 28,
    color: colors.light,
    paddingVertical: spacing.sm,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetText: {
    ...typography.caption,
    color: colors.light,
  },
  budgetUsedText: {
    ...typography.caption,

    color: colors.success,
  },
  trendContainer: {
    alignItems: 'flex-end',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.sm,
    gap: spacing.xs,
  },
  trendText: {
    ...typography.caption,

  },
});

export default ExpenseSummary;
