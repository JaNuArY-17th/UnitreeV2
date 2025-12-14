import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { FinanceCard } from './FinanceCard';

interface FinanceCardsContainerProps {
  incomeAmount: string;
  expenseAmount: string;
}

export const FinanceCardsContainer: React.FC<FinanceCardsContainerProps> = ({
  incomeAmount,
  expenseAmount,
}) => {
  return (
    <View style={styles.cardsContainer}>
      <FinanceCard
        type="income"
        label="Income"
        amount={incomeAmount}
        backgroundColor={colors.primary}
        patternColor={colors.light}
      />
      <FinanceCard
        type="expense"
        label="Expense"
        amount={expenseAmount}
        backgroundColor='#F59E0B'
        patternColor={colors.light}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
});
