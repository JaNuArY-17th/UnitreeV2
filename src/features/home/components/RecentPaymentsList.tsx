
import { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, Pressable } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, spacing, typography } from '@/shared/themes';
import HistoryItem from '../../transactions/components/HistoryItem';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { transactionService } from '../../transactions/services/transactionService';
import { bankTypeManager } from '../../deposit/utils/bankTypeManager';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon, File02Icon } from '@hugeicons/core-free-icons';
import RecentPaymentsListSkeleton from './RecentPaymentsListSkeleton';


const RecentPaymentsList = () => {
  const { t } = useTranslation('transactions');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Get the current bank type dynamically from the manager
        const currentBankType = await bankTypeManager.getBankType();
        const bankType = currentBankType || 'USER'; // fallback to USER if not available

        const res = await transactionService.getTransactions({
          page: 1,
          limit: 3,
          bankType,
          type: 'ALL'
        });
        setTransactions(res.data.transactions || []);
      } catch (e) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Map and group by date
  const sectionedPayments = useMemo(() => {
    if (!transactions.length) return [];
    // Map to UI format
    const mapped = transactions.map((tx: any) => {
      // Format amount
      const formattedAmount = tx.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      // Map type
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

      // Generate description based on transaction state and bank name
      const getDescription = (transaction: any): string => {
        const { state, toBankName, fromAccountName, toAccountName, description } = transaction;
        if (state === 'MONEY_IN' && toBankName === 'STORE') {
          return `Nhận tiền thanh toán từ ${fromAccountName}`;
        } else if (state === 'MONEY_OUT' && toBankName === 'STORE') {
          return `Thanh toán hóa đơn tại ${toAccountName}`;
        } else if (state === 'MONEY_OUT' && toBankName === 'USER') {
          return `Chuyển tiền đến ${toAccountName}`;
        } else if (state === 'MONEY_IN' && toBankName === 'USER') {
          return `Nhận tiền từ ${fromAccountName}`;
        } else {
          return description || '';
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
    const grouped = mapped.reduce((groups: { [key: string]: any[] }, transaction) => {
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
    <View style={styles.sectionHeaderContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    </View>
  );

  const handleViewAll = () => {
    navigation.navigate('MainTabs', { screen: 'History' });
  };

  if (loading) {
    return <RecentPaymentsListSkeleton />;
  }

  return (
    <View style={styles.containerWrapper}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Giao dịch gần đây</Text>
          </View>
          <Pressable style={styles.viewAllButton} onPress={handleViewAll}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <SectionList
        sections={sectionedPayments}
        keyExtractor={(item: any) => item.id}
        scrollEnabled={false}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <HugeiconsIcon icon={File02Icon} size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có giao dịch nào</Text>
            <Text style={styles.emptySubtitle}>Các giao dịch của bạn sẽ xuất hiện ở đây</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    // marginBottom: spacing.md,
  },
  headerSection: {
    marginBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginRight: -spacing.xs, // Compensate for touch target
  },
  viewAllText: {
    ...typography.body,
    color: colors.primary,
    marginRight: spacing.xs / 2,
  },
  sectionHeaderContainer: {
    // backgroundColor: colors.light,
    // marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  sectionHeaderText: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(43, 115, 254, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RecentPaymentsList;
