import React, { useState, useMemo, useCallback } from 'react';
import { View, SectionList, StyleSheet, StatusBar, Pressable, RefreshControl, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useTranslation } from 'react-i18next';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS, typography } from '../../../shared/themes';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import HistoryItem from '../components/HistoryItem';
import { FilterBar, FilterModal, HistoryScreenSkeleton } from '../components';
import type { FilterOptions } from '../components/FilterModal';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import SearchBar from '../../../shared/components/SearchBar';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useTransactionHistory } from '../hooks';
import type { HistoryTypeFilter } from '../types';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FilterHorizontalIcon, Cancel01Icon } from '@hugeicons/core-free-icons';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';
import { BackgroundPattern } from '@/shared/components';

// Define UI transaction interface to match the component expectations
interface UITransaction {
  id: string;
  amount: string;
  type: 'in' | 'out';
  description: string;
  transactionTime: string;
  from: string;
  to: string;
  fromAccount: string;
  toAccount: string;
  state: 'success' | 'failed';
}


const HistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('transactions');
  useStatusBarEffect('transparent', 'dark-content', true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  // Map UI filter types to API filter types
  const mapTypeFilter = (uiType: 'all' | 'in' | 'out'): HistoryTypeFilter => {
    switch (uiType) {
      case 'in': return 'deposit';
      case 'out': return 'withdraw';
      default: return 'all';
    }
  };

  // Use transaction history hook
  const {
    data: rawTransactions,
    loadingInitial,
    loadingMore,
    refreshing,
    error,
    hasMore,
    loadMore,
    refresh,
  } = useTransactionHistory({
    typeFilter: mapTypeFilter(typeFilter),
    dateFilter: 'all', // For now, use 'all' and handle date filtering locally
    pageSize: 20,
  });

  // Transform API data to UI format and apply additional filtering
  const transformedTransactions = useMemo((): UITransaction[] => {
    if (!rawTransactions || rawTransactions.length === 0) return [];

    return rawTransactions.map((tx): UITransaction => {
      // Format amount from number to string with proper formatting
      const formattedAmount = tx.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      // Map transaction type
      const uiType: 'in' | 'out' = tx.type === 'deposit' ? 'in' : 'out';

      // Format date from ISO string to dd/MM/yyyy HH:mm format
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
          return isoDate; // Fallback to original if parsing fails
        }
      };

      // Generate description based on transaction state and bank name
      const getDescription = (transaction: any): string => {
        const { state, toBankName, fromAccountName, toAccountName, description, fromBankName } = transaction;
        if (state === 'MONEY_IN' && toBankName === 'STORE' && fromBankName != '') {
          return `Nhận tiền thanh toán từ ${fromAccountName}`;
        } else if (state === 'MONEY_OUT' && toBankName === 'STORE' && fromBankName != '') {
          return `Thanh toán hóa đơn tại ${toAccountName}`;
        } else if (state === 'MONEY_OUT' && toBankName === 'USER' && fromBankName != '') {
          return `Chuyển tiền đến ${toAccountName}`;
        } else if (state === 'MONEY_IN' && toBankName === 'USER' && fromBankName != '') {
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
        from: tx.bankName || 'Bank',
        to: 'You',
        fromAccount: tx.bankNumberMasked || '',
        toAccount: '',
        state: tx.status === 'success' ? 'success' : 'failed',
      };
    });
  }, [rawTransactions]);

  // Filter and sort transformed transactions, then group by date
  const sectionedPayments = useMemo(() => {
    let result: UITransaction[] = transformedTransactions;

    // Filter by transaction type (already handled by API, but keeping for consistency)
    if (typeFilter !== 'all') {
      result = result.filter((p: UITransaction) => p.type === typeFilter);
    }

    // Filter by selected month
    if (filterOptions.selectedMonth) {
      const [filterYear, filterMonth] = filterOptions.selectedMonth.split('-').map(Number);
      result = result.filter((p: UITransaction) => {
        const [date] = p.transactionTime.split(' ');
        const [, month, year] = date.split('/').map(Number);
        return year === filterYear && month === filterMonth;
      });
    }

    // Filter by search text
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p: UITransaction) =>
        p.description.toLowerCase().includes(s) ||
        p.amount.toLowerCase().includes(s) ||
        p.from.toLowerCase().includes(s) ||
        p.to.toLowerCase().includes(s) ||
        (p.fromAccount && p.fromAccount.includes(s)) ||
        (p.toAccount && p.toAccount.includes(s)) ||
        p.state.toLowerCase().includes(s)
      );
    }

    // Sort by transaction time
    result = result.slice().sort((a: UITransaction, b: UITransaction) => {
      // Sort by transactionTime (dd/MM/yyyy HH:mm)
      const parseDate = (str: string) => {
        const [date, time] = str.split(' ');
        const [day, month, year] = date.split('/').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute).getTime();
      };
      if (dateSort === 'asc') {
        return parseDate(a.transactionTime) - parseDate(b.transactionTime);
      } else {
        return parseDate(b.transactionTime) - parseDate(a.transactionTime);
      }
    });

    // Group by date
    const grouped = result.reduce((groups: { [key: string]: UITransaction[] }, transaction) => {
      const [date] = transaction.transactionTime.split(' ');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});

    // Convert to sections format
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const formatYesterday = `${String(yesterday.getDate()).padStart(2, '0')}/${String(yesterday.getMonth() + 1).padStart(2, '0')}/${yesterday.getFullYear()}`;

    const sections = Object.keys(grouped)
      .sort((a, b) => {
        // Sort dates in the same order as transactions
        const parseDate = (dateStr: string) => {
          const [day, month, year] = dateStr.split('/').map(Number);
          return new Date(year, month - 1, day).getTime();
        };
        if (dateSort === 'asc') {
          return parseDate(a) - parseDate(b);
        } else {
          return parseDate(b) - parseDate(a);
        }
      })
      .map(date => {
        let title = date;
        if (date === formatToday) {
          title = t('today', 'Hôm nay');
        } else if (date === formatYesterday) {
          title = t('yesterday', 'Hôm qua');
        }

        return {
          title,
          data: grouped[date],
        };
      });

    return sections;
  }, [transformedTransactions, search, typeFilter, dateSort, filterOptions.selectedMonth, t]);

  // Calculate total amount and transaction count for filtered payments
  const summaryData = useMemo(() => {
    const allTransactions = sectionedPayments.flatMap(section => section.data);
    const totalAmount = allTransactions.reduce((sum, payment) => {
      const amount = payment.amount && typeof payment.amount === 'string'
        ? parseInt(payment.amount.replace(/\./g, ''), 10)
        : 0;
      return sum + amount;
    }, 0);

    const formatAmount = (amount: number) => {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
    };

    return {
      totalAmount: formatAmount(totalAmount),
      transactionCount: allTransactions.length,
    };
  }, [sectionedPayments]);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const hasActiveFilter = typeFilter !== 'all' || !!filterOptions.selectedMonth;

  // Check if advanced filters (month) are active - separate from type filter
  const hasAdvancedFilter = !!filterOptions.selectedMonth;

  // Format selected month for display
  const selectedMonthDisplay = useMemo(() => {
    if (!filterOptions.selectedMonth) return null;
    const [year, month] = filterOptions.selectedMonth.split('-').map(Number);

    const monthKeys = [
      'months.january', 'months.february', 'months.march', 'months.april', 'months.may', 'months.june',
      'months.july', 'months.august', 'months.september', 'months.october', 'months.november', 'months.december'
    ];

    const monthName = t(monthKeys[month - 1]);
    return `${monthName} ${year}`;
  }, [filterOptions.selectedMonth, t]);

  const handleFilterPress = () => {
    setIsFilterModalVisible(true);
  };

  const handleApplyFilter = (filters: FilterOptions) => {
    setFilterOptions(filters);
    // Transaction type filtering is now handled separately via typeFilter state
    // Month filtering is handled in the filteredPayments useMemo hook
  };

  // Clear month filter
  const handleClearMonthFilter = () => {
    setFilterOptions({});
  };

  // Clear type filter
  const handleClearTypeFilter = () => {
    setTypeFilter('all');
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilterOptions({});
    setTypeFilter('all');
  };

  // Update type filter and trigger API refetch when type changes
  const handleTypeFilterChange = useCallback((newType: 'all' | 'in' | 'out') => {
    setTypeFilter(newType);
    // The useTransactionHistory hook will automatically refetch when typeFilter changes
  }, []);

  const handleDateSortChange = useCallback((newSort: 'asc' | 'desc') => {
    setDateSort(newSort);
  }, []);

  const renderItem = ({ item, index, section }: { item: UITransaction; index: number; section: { data: UITransaction[]; title: string } }) => {
    // Check if this is the last item in the entire list
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

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore && !loadingInitial) {
      loadMore();
    }
  }, [hasMore, loadingMore, loadingInitial, loadMore]);

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading', 'Loading...')}</Text>
        </View>
      );
    }
    return null;
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <VerificationRequiredOverlay>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor='transparent' />

        <View style={{ paddingHorizontal: spacing.lg }}>
          <ScreenHeader title={t('receivedPayments')} showBack={false} />
        </View>

        {/* SearchBar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={t('searchPlaceholder', 'Search by name, phone, amount')}
            rightIcon={
              <View>
                <HugeiconsIcon icon={FilterHorizontalIcon} size={20} color={hasAdvancedFilter ? colors.primary : colors.text.secondary} />
                {hasAdvancedFilter && <View style={styles.filterDot} />}
              </View>
            }
            onRightIconPress={handleFilterPress}
            showExternalIcon={true}
          />
        </View>

        {/* Filter Bar */}
        <FilterBar
          typeFilter={typeFilter}
          dateSort={dateSort}
          onTypeFilterChange={handleTypeFilterChange}
          onDateSortChange={handleDateSortChange}
          totalAmount={summaryData.totalAmount}
          transactionCount={summaryData.transactionCount}
        />

        {/* Active Filter Chips */}
        {hasActiveFilter && (
          <View style={styles.activeFiltersSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersContent}
            >
              {/* Month Filter Chip */}
              {selectedMonthDisplay && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterValue}>{selectedMonthDisplay}</Text>
                  <Pressable onPress={handleClearMonthFilter} hitSlop={8}>
                    <HugeiconsIcon icon={Cancel01Icon} size={14} color={colors.text.secondary} />
                  </Pressable>
                </View>
              )}
              {/* Type Filter Chip - only show when not 'all' */}
              {typeFilter !== 'all' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterLabel}>{t('filter.type', 'Loại')}:</Text>
                  <Text style={styles.activeFilterValue}>
                    {typeFilter === 'in' ? t('filter.moneyIn') : t('filter.moneyOut')}
                  </Text>
                  <Pressable onPress={handleClearTypeFilter} hitSlop={8}>
                    <HugeiconsIcon icon={Cancel01Icon} size={14} color={colors.text.secondary} />
                  </Pressable>
                </View>
              )}
              {/* Clear All Button - show when multiple filters */}
              {selectedMonthDisplay && typeFilter !== 'all' && (
                <Pressable style={styles.clearAllButton} onPress={handleClearAllFilters}>
                  <Text style={styles.clearAllText}>{t('clearAll', 'Xóa tất cả')}</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        )}

        <SectionList
          sections={sectionedPayments}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item: UITransaction) => item.id}
          ListEmptyComponent={
            loadingInitial ? (
              <HistoryScreenSkeleton />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>{t('error', 'Error')}</Text>
                <Text style={styles.errorDesc}>{t('failedToLoadTransactions', 'Failed to load transactions. Please try again.')}</Text>
                <Pressable style={styles.retryButton} onPress={refresh}>
                  <Text style={styles.retryText}>{t('retry', 'Retry')}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>{t('noPaymentsYet', 'No payments yet')}</Text>
                <Text style={styles.emptyDesc}>{t('allPaymentsShownHere', 'All payments will be shown here')}</Text>
              </View>
            )
          }
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.sectionListContent}
        />

        {/* Filter Modal */}
        <FilterModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          onApplyFilter={handleApplyFilter}
          initialFilters={filterOptions}
        />
      </View>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
  },
  // Filter indicator dot
  filterDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  // Active filter chips section
  activeFiltersSection: {
    marginBottom: spacing.sm,
  },
  activeFiltersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.round,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  activeFilterLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  activeFilterValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  clearAllButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearAllText: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  // Item styles moved to HistoryItem component
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  sectionHeader: {
    // paddingVertical: spacing.md,
    backgroundColor: colors.lightGray,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: dimensions.radius.md,
  },
  sectionHeaderText: {
    ...typography.subtitle,
    letterSpacing: 0.2,
    // color: colors.text.secondary,
  },
  sectionListContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  errorDesc: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: dimensions.radius.md,
  },
  retryText: {
    ...typography.bodySmall,
    color: colors.light,
  },
});

export default HistoryScreen;
