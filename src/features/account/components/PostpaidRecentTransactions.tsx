import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import HistoryItem from '../../transactions/components/HistoryItem';
import { colors, spacing, typography } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
}

interface PostpaidRecentTransactionsProps {
  transactions: Transaction[];
  onSeeAllPress: () => void;
}

const PostpaidRecentTransactions: React.FC<PostpaidRecentTransactionsProps> = ({ transactions, onSeeAllPress }) => {
  const { t } = useTranslation('account');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <View style={styles.transactionsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('postpaid.recentTransactions')}</Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>{t('postpaid.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      {transactions.map((tx, index) => (
        <HistoryItem
          key={tx.id}
          description={tx.title}
          transactionTime={tx.date}
          amount={formatCurrency(tx.amount)}
          type="out"
          state="success"
          lastItemInSection={index === transactions.length - 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  transactionsSection: {
    // marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default PostpaidRecentTransactions;
