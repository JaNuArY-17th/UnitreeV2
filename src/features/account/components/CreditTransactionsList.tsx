import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, Pressable } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions, typography } from '@/shared/themes';
import HistoryItem from '../../transactions/components/HistoryItem';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '../../transactions/hooks/useTransactions';

const CreditTransactionsList = () => {
  const { t } = useTranslation('transactions');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    data: transactionsResponse,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions({
    typeFilter: 'withdraw', // MONEY_OUT transactions
    transactionTypeFilter: 'CREDIT', // Filter for credit transactions
    limit: 10,
    enabled: true,
  });

  const transactions = transactionsResponse?.pages?.[0]?.data?.transactions || [];

  // Map and group by date
  const sectionedPayments = useMemo(() => {
    if (!transactions.length) return [];
    // Map to UI format
    const mapped = transactions.map((tx: any) => {
      // Format amount
      const formattedAmount = tx.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      // Map type - for credit transactions, determine based on the transaction
      const uiType: 'in' | 'out' = tx.state === 'MONEY_IN' ? 'in' : 'out';
      // Format date
      const formatTransactionTime = (isoDate: string): string => {
        try {
          const date = new Date(isoDate);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const hour = String(date.getHours()).padStart(2, '0');
          const minute = String(date.getMinutes()).padStart(2, '0');
          return `${day}/${month}/${year} ${hour}:${minute}`;
        } catch {
          return isoDate;
        }
      };

      // Generate description based on transaction state and bank name for credit
      const getDescription = (transaction: any): string => {
        const { state, toBankName, fromAccountName, toAccountName, description } = transaction;
        if (state === 'MONEY_IN' && toBankName === 'STORE') {
          return `Nhận thanh toán tín dụng từ ${fromAccountName}`;
        } else if (state === 'MONEY_OUT' && toBankName === 'STORE') {
          return `Thanh toán tín dụng tại ${toAccountName}`;
        } else if (state === 'MONEY_OUT' && toBankName === 'USER') {
          return `Chuyển tiền tín dụng đến ${toAccountName}`;
        } else if (state === 'MONEY_IN' && toBankName === 'USER') {
          return `Nhận tiền tín dụng từ ${fromAccountName}`;
        } else {
          return description || 'Giao dịch tín dụng';
        }
      };

      return {
        id: tx.id,
        amount: formattedAmount,
        type: uiType,
        description: getDescription(tx),
        transactionTime: formatTransactionTime(tx.createdAt),
        from: tx.fromAccountName || '',
        to: tx.toAccountName || '',
        fromAccount: tx.fromAccountNumber || '',
        toAccount: tx.toAccountNumber || '',
        state: 'success',
      };
    });
    // Group by date
    const grouped = mapped.reduce((groups: { [key: string]: any[] }, transaction: any) => {
      const [date] = transaction.transactionTime.split(' ');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});
    // Section format
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const formatToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const formatYesterday = `${String(yesterday.getDate()).padStart(2, '0')}/${String(yesterday.getMonth() + 1).padStart(2, '0')}/${yesterday.getFullYear()}`;
    const sections = Object.keys(grouped)
      .sort((a, b) => {
        const parseDate = (dateStr: string) => {
          const [day, month, year] = dateStr.split('/').map(Number);
          return new Date(year, month - 1, day).getTime();
        };
        return parseDate(b) - parseDate(a);
      })
      .map(date => {
        let title = date;
        if (date === formatToday) title = t('today', 'Hôm nay');
        else if (date === formatYesterday) title = t('yesterday', 'Hôm qua');
        return { title, data: grouped[date] };
      });
    return sections;
  }, [transactions, t]);

  const renderItem = ({ item, index, section }: { item: any; index: number; section: { data: any[]; title: string } }) => {
    const isLastSection = sectionedPayments.indexOf(section) === sectionedPayments.length - 1;
    const isLastItemInSection = index === section.data.length - 1;
    const isLastItemOverall = isLastSection && isLastItemInSection;
    return (
      <Pressable onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}>
        <HistoryItem
          description={item.description}
          transactionTime={item.transactionTime}
          amount={item.amount}
          type={item.type}
          state={item.state}
          lastItem={isLastItemOverall}
          lastItemInSection={isLastItemInSection}
        />
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  if (isLoadingTransactions) {
    return <Text style={styles.empty}>{t('loading', 'Loading...')}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('creditTransactions', 'Lịch sử giao dịch tín dụng')}</Text>
      <SectionList
        sections={sectionedPayments}
        keyExtractor={(item: any) => item.id}
        scrollEnabled={false}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>{t('noCreditTransactions', 'Chưa có giao dịch tín dụng')}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  empty: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    backgroundColor: colors.lightGray,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: dimensions.radius.md,
  },
  sectionHeaderText: {
    ...typography.subtitle,
    letterSpacing: 0.2,
  },
});

export default CreditTransactionsList;