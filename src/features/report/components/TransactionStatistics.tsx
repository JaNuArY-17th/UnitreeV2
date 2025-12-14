import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, dimensions, typography } from '@/shared/themes';
import { Text } from '@/shared/components';
import { CheckRound, CloseRound } from '@/shared/assets';
import type { DashboardResponse } from '../types/report';

interface TransactionStatisticsProps {
  dashboardData?: DashboardResponse;
}

export const TransactionStatistics: React.FC<TransactionStatisticsProps> = ({ dashboardData }) => {
  const { t } = useTranslation('report');

  // Get data from dashboard API
  const successfulTransactions = dashboardData?.data?.successfulTransactions?.count || 0;
  const failedTransactions = dashboardData?.data?.failedTransactions?.count || 0;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('screen.expenseStatistics.title')}</Text>
        <Text style={styles.sectionSubtitle}>{t('screen.expenseStatistics.budgetOverviewDescription')}</Text>
      </View>

      <View style={styles.transactionOverview}>
        {/* Successful Transactions */}
        <View style={[styles.transactionCard]}>
          <View style={styles.transactionIcon}>
            <CheckRound width={32} height={32} color={colors.success} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionCount}>{successfulTransactions.toLocaleString()}</Text>
            <Text style={styles.transactionLabel}>{t('balance.successfulTransactions')}</Text>
          </View>
        </View>

        <View style={styles.cardSeparator} />

        {/* Failed Transactions */}
        <View style={[styles.transactionCard]}>
          <View style={styles.transactionIcon}>
            <CloseRound width={32} height={32} color={colors.danger} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionCount}>{failedTransactions.toLocaleString()}</Text>
            <Text style={styles.transactionLabel}>{t('balance.failedTransactions')}</Text>
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
  transactionOverview: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  transactionCard: {
    flex: 1,
    backgroundColor: colors.light,
    // padding: spacing.lg,
    alignItems: 'center',
  },
  transactionIcon: {
    marginBottom: spacing.sm,
  },
  transactionInfo: {
    alignItems: 'center',
  },
  transactionCount: {
    ...typography.h1,
    fontSize: dimensions.fontSize.xxxl,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  transactionLabel: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  cardSeparator: {
    width: 1,
    height: 80,
    backgroundColor: colors.lightGray,
    marginHorizontal: spacing.md,
  },
});

export default TransactionStatistics;
