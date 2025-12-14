import React from 'react';
import { View, StyleSheet, FlatList, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, typography } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Time02Icon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon
} from '@hugeicons/core-free-icons';

const PostpaidTransactionHistoryScreen: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation('account');
  const insets = useSafeAreaInsets();

  // Expanded mock data
  const transactions = [
    { id: '1', title: 'Thanh toán hoá đơn điện', date: '2024-05-10 14:30', amount: 500000, type: 'expense' },
    { id: '2', title: 'Mua sắm tại WinMart', date: '2024-05-08 10:15', amount: 1200000, type: 'expense' },
    { id: '3', title: 'Nạp tiền điện thoại', date: '2024-05-05 09:00', amount: 200000, type: 'expense' },
    { id: '4', title: 'Thanh toán dư nợ', date: '2024-05-01 10:00', amount: 3500000, type: 'payment' },
    { id: '5', title: 'Mua sắm Tiki', date: '2024-04-28 15:20', amount: 450000, type: 'expense' },
    { id: '6', title: 'Grab Food', date: '2024-04-25 12:30', amount: 120000, type: 'expense' },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <HugeiconsIcon
          icon={item.type === 'payment' ? ArrowDownLeftIcon : item.type === 'expense' ? Time02Icon : ArrowUpRightIcon}
          size={24}
          color={item.type === 'payment' ? colors.success : colors.text.secondary}
        />
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: item.type === 'payment' ? colors.success : colors.text.primary }
      ]}>
        {item.type === 'payment' ? '+' : '-'}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScreenHeader
          title={t('postpaid.recentTransactions') || 'Lịch sử giao dịch'}
          titleStyle={{ color: colors.light }}
          backIconColor={colors.light}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingBottom: spacing.lg,
  },
  listContent: {
    padding: spacing.lg,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text.primary,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  transactionAmount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
});

export default PostpaidTransactionHistoryScreen;
