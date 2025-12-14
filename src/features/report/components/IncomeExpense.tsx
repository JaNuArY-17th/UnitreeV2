import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { formatVND } from '@/shared/utils/format';
import { Text } from '@/shared/components';
import { FinanceCard } from './FinanceCard';
import type { DashboardResponse } from '../types/report';

interface IncomeExpenseProps {
  dashboardData?: DashboardResponse;
}

export const IncomeExpense: React.FC<IncomeExpenseProps> = ({ dashboardData }) => {
  const { t } = useTranslation('report');

  const financeCards = useMemo(() => {
    const incomeAmount = dashboardData?.data?.income?.amount ? parseFloat(dashboardData.data.income.amount) : 0;
    const expenseAmount = dashboardData?.data?.expense?.amount ? parseFloat(dashboardData.data.expense.amount) : 0;

    const categories = [
      {
        id: 'Income',
        name: t(`screen.expenseStatistics.categories.income`),
        amount: incomeAmount,
        percentage: 45.5,
        color: colors.primary,
        type: 'income' as const,
      },
      {
        id: 'Outcome',
        name: t(`screen.expenseStatistics.categories.outcome`),
        amount: expenseAmount,
        percentage: 26.7,
        color: '#8B5CF6',
        type: 'expense' as const,
      },
    ];

    return categories.map(category => ({
      type: category.type,
      label: category.name,
      amount: formatVND(category.amount),
      backgroundColor: category.color,
      patternColor: colors.light,
    }));
  }, [t, dashboardData]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('screen.expenseStatistics.incomeAndOutcomeByCategory')}</Text>
        <Text style={styles.sectionSubtitle}>{t('screen.expenseStatistics.incomeAndOutcomeByCategoryDescription')}</Text>
      </View>

      <View style={styles.expenseCardsContainer}>
        {financeCards.map((card, index) => (
          <View key={index} style={styles.expenseCardWrapper}>
            <FinanceCard {...card} />
          </View>
        ))}
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
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  expenseCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  expenseCardWrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
});

export default IncomeExpense;
