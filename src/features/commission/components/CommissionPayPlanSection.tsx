import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '@/shared/components/base/Text';
import CommissionItem from './CommissionItem';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '../../../shared/themes';
import type { CommissionTransaction } from '../types';

interface CommissionPayPlanSectionProps {
  currentBalance: string;
  payableCommissions: CommissionTransaction[];
}

const CommissionPayPlanSection: React.FC<CommissionPayPlanSectionProps> = ({
  currentBalance,
  payableCommissions,
}) => {
  const { t } = useTranslation('commission');

  const formatAmount = (amount: number | string) => {
    if (typeof amount === 'number') {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return amount;
  };

  const renderCommissionItem = ({ item }: { item: CommissionTransaction }) => (
    <CommissionItem
      transactionCode={item.transactionCode}
      commissionPercent={item.commissionPercentage}
      originalAmount={formatAmount(item.originalAmount)}
      commissionAmount={formatAmount(item.commissionAmount)}
      createdAt={item.createdAt}
      isPaid={item.isPaid}
      lastItem={false}
      lastItemInSection={false}
    />
  );

  return (
    <View style={styles.container}>
      {/* Payable Commissions */}
      <View style={styles.payableSection}>
        <Text style={styles.payableTitle}>
          {t('payableCommissions', 'Payable Commissions')} ({payableCommissions.length})
        </Text>

        {payableCommissions.length > 0 ? (
          <FlatList
            data={payableCommissions}
            keyExtractor={(item) => item.id}
            renderItem={renderCommissionItem}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {t('noPayableCommissions', 'No payable commissions')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    padding: spacing.lg,
  },
  title: {
    fontSize: 20,

    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: dimensions.radius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  balanceValue: {
    fontSize: 24,

    color: colors.success,
  },
  payableSection: {
    flex: 1,
  },
  payableTitle: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default CommissionPayPlanSection;
