import React, { useState, useMemo, useCallback } from 'react';
import { View, SectionList, StyleSheet, StatusBar, Pressable, RefreshControl, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useTranslation } from 'react-i18next';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '../../../shared/themes';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import CommissionItem from '../components/CommissionItem';
import {
  CommissionFilterBar,
  CommissionSummary,
  CommissionLoadingState,
  CommissionErrorState,
  CommissionEmptyState,
  CommissionSectionHeader,
} from '../components';
import { FilterBar, FilterModal } from '../../../features/transactions/components';
import type { FilterOptions } from '../../../features/transactions/components/FilterModal';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import SearchBar from '../../../shared/components/SearchBar';
import { useCommissionHistory } from '../hooks';
import type { CommissionTransaction } from '../types';
import { BackgroundPattern } from '@/shared/components/base';
import { Filter } from '@/shared/assets/icons';
import ScreenHeader from '@/shared/components/ScreenHeader';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';

const CommissionHistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('commission');
  useStatusBarEffect('transparent', 'dark-content', true);

  const [search, setSearch] = useState('');
  const [isPaidFilter, setIsPaidFilter] = useState<boolean | undefined>(undefined);
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  // Use commission history hook
  const {
    data: rawCommissions,
    loadingInitial,
    loadingMore,
    refreshing,
    error,
    hasMore,
    loadMore,
    refresh,
  } = useCommissionHistory({
    isPaid: isPaidFilter,
    pageSize: 20,
  });

  // Transform API data and apply additional filtering
  const transformedCommissions = useMemo((): CommissionTransaction[] => {
    if (!rawCommissions || rawCommissions.length === 0) return [];

    // Filter out any null/undefined commission entries
    const validCommissions = rawCommissions.filter((commission): commission is CommissionTransaction =>
      commission !== null && commission !== undefined
    );

    return validCommissions.map((commission) => ({
      ...commission,
      // Format amounts with thousand separators, handle null/undefined/empty values
      originalAmount: (commission.originalAmount && typeof commission.originalAmount === 'string')
        ? commission.originalAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : '0',
      receivedAmount: (commission.receivedAmount && typeof commission.receivedAmount === 'string')
        ? commission.receivedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : '0',
      commissionAmount: (commission.commissionAmount && typeof commission.commissionAmount === 'string')
        ? commission.commissionAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : '0',
    }));
  }, [rawCommissions]);

  // Filter and sort transformed commissions, then group by date
  const sectionedCommissions = useMemo(() => {
    let result: CommissionTransaction[] = transformedCommissions;

    // Filter by selected month
    if (filterOptions.selectedMonth) {
      const [filterYear, filterMonth] = filterOptions.selectedMonth.split('-').map(Number);
      result = result.filter((commission) => {
        const date = new Date(commission.createdAt);
        return date.getFullYear() === filterYear && date.getMonth() + 1 === filterMonth;
      });
    }

    // Filter by search text
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((commission) =>
        commission.transactionCode.toLowerCase().includes(s) ||
        (commission.originalAmount && commission.originalAmount.includes(s)) ||
        (commission.commissionAmount && commission.commissionAmount.includes(s)) ||
        commission.commissionPercentage.toString().includes(s)
      );
    }

    // Sort by created date
    result = result.slice().sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (dateSort === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    // Group by date
    const grouped = result.reduce((groups: { [key: string]: CommissionTransaction[] }, commission) => {
      const date = new Date(commission.createdAt);
      const dateKey = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(commission);
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
          title = t('today', 'Today');
        } else if (date === formatYesterday) {
          title = t('yesterday', 'Yesterday');
        }

        return {
          title,
          data: grouped[date],
        };
      });

    return sections;
  }, [transformedCommissions, search, dateSort, filterOptions.selectedMonth, t]);

  // Calculate total commission amount and transaction count for filtered commissions
  const summaryData = useMemo(() => {
    const allCommissions = sectionedCommissions.flatMap(section => section.data);
    const totalAmount = allCommissions.reduce((sum, commission) => {
      const amount = commission.commissionAmount && typeof commission.commissionAmount === 'string'
        ? parseInt(commission.commissionAmount.replace(/\./g, ''), 10)
        : 0;
      return sum + amount;
    }, 0);

    const formatAmount = (amount: number) => {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
    };

    return {
      totalAmount: formatAmount(totalAmount),
      transactionCount: allCommissions.length,
    };
  }, [sectionedCommissions]);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleFilterPress = () => {
    setIsFilterModalVisible(true);
  };

  const handleApplyFilter = (filters: FilterOptions) => {
    setFilterOptions(filters);
  };

  // Update paid filter
  const handlePaidFilterChange = useCallback((paid?: boolean) => {
    setIsPaidFilter(paid);
  }, []);

  const handleDateSortChange = useCallback((newSort: 'asc' | 'desc') => {
    setDateSort(newSort);
  }, []);

  const renderItem = ({ item, index, section }: { item: CommissionTransaction; index: number; section: { data: CommissionTransaction[]; title: string } }) => {
    // Check if this is the last item in the entire list
    const isLastSection = sectionedCommissions.indexOf(section) === sectionedCommissions.length - 1;
    const isLastItemInSection = index === section.data.length - 1;
    const isLastItemOverall = isLastSection && isLastItemInSection;

    return (
      <CommissionItem
        transactionCode={item.transactionCode}
        commissionPercent={item.commissionPercentage}
        originalAmount={item.originalAmount}
        commissionAmount={item.commissionAmount}
        createdAt={item.createdAt}
        isPaid={item.isPaid}
        lastItem={isLastItemOverall}
        lastItemInSection={isLastItemInSection}
      />
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

  const renderSectionHeader = ({ section }: { section: { title: string; data: CommissionTransaction[] } }) => (
    <CommissionSectionHeader
      title={section.title}
      count={section.data.length}
    />
  );

  return (
    <VerificationRequiredOverlay>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor='transparent' />

        {/* Screen Header */}
        <ScreenHeader
          title={t('commissionHistory')}
          showBack={true}
        />

        <BackgroundPattern />
        {/* <Text style={styles.title}>{t('commissionHistory')}</Text> */}

        <View style={styles.content}>
          {/* SearchBar */}
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={t('searchPlaceholder', 'Search by transaction code, amount')}
            containerStyle={styles.searchBar}
            rightIcon={<Filter width={20} height={20} color={colors.text.secondary} />}
            onRightIconPress={handleFilterPress}
            showExternalIcon={true}
          />

          {/* Filter Bar - adapted for commission status */}
          <CommissionFilterBar
            isPaidFilter={isPaidFilter}
            onPaidFilterChange={handlePaidFilterChange}
          />

          {loadingInitial ? (
            <CommissionLoadingState />
          ) : error ? (
            <CommissionErrorState onRetry={refresh} />
          ) : (
            <SectionList
              sections={sectionedCommissions}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={(item: CommissionTransaction) => item.id}
              ListEmptyComponent={<CommissionEmptyState />}
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
          )}

          {/* Filter Modal */}
          <FilterModal
            visible={isFilterModalVisible}
            onClose={() => setIsFilterModalVisible(false)}
            onApplyFilter={handleApplyFilter}
            initialFilters={filterOptions}
          />
        </View>
      </View>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 28,

    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 40,
  },
  searchBar: {
    // marginTop: spacing.md,
  },
  sectionListContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  loadingFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
});

export default CommissionHistoryScreen;
