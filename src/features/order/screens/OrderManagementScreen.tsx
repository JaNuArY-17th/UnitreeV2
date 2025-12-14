import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions, typography } from '@/shared/themes';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import ScreenHeader from '@/shared/components/ScreenHeader';
import SearchBar from '@/shared/components/SearchBar';
import { Text } from '@/shared/components/base';
import { Filter } from '@/shared/assets/icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { VerificationRequiredOverlay, StoreVerificationRequiredOverlay } from '@/shared/components';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import OrderCard from '../components/OrderCard';
import FilterBar from '../../transactions/components/FilterBar';
import { useOrders } from '../hooks/useOrders';
import type { Order, OrderStatus } from '../types/order';
import type { RootStackParamList } from '@/navigation/types';

type OrderManagementScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderManagement'>;

const OrderManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<OrderManagementScreenNavigationProp>();
  const { t } = useTranslation('order');
  const [searchText, setSearchText] = useState('');

  // Get store data
  const { storeData } = useStoreData();
  const storeId = storeData?.id;

  // Status filters - mapped to actual API status values
  const statusFilters: Array<{ id: 'all' | OrderStatus; label: string }> = [
    { id: 'all', label: t('filterAll') },
    { id: 'PAID' as OrderStatus, label: t('statusPaid') },
    { id: 'PENDING' as OrderStatus, label: t('statusPending') },
  ];

  // Use orders API hook
  const {
    data: ordersResponse,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrders({ size: 20, orderSequence: searchText.trim() || undefined }, {
    enabled: !!storeId,
  });

  // Extract orders from API response
  const orders = useMemo(() => {
    return ordersResponse?.pages?.flatMap(page => page.data || []) || [];
  }, [ordersResponse]);

  // Get current status filter
  const [currentStatusFilter, setCurrentStatusFilter] = useState<'all' | OrderStatus>('all');

  // Filter orders based on status filter (search is now server-side)
  const filteredOrders = useMemo(() => {
    if (currentStatusFilter === 'all') {
      return orders;
    }
    return orders.filter(o => o.orderStatus === currentStatusFilter);
  }, [orders, currentStatusFilter]);

  // Loading and error states
  const loadingInitial = isLoadingOrders;
  const loadingMore = isFetchingNextPage;
  const error = ordersError ? 'Không thể tải danh sách đơn hàng' : null;

  // Set status bar
  useStatusBarEffect('transparent', 'dark-content', true);

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderDetail', { orderId: order.id });
  };

  const handleRefresh = () => {
    refetchOrders();
  };

  // Render functions
  const renderItem = ({ item }: { item: Order }) => {
    return (
      <OrderCard
        order={item}
        onPress={handleOrderPress}
      />
    );
  };

  const renderItemSeparator = () => <View style={{ height: spacing.md }} />;

  const renderEmptyComponent = () => {
    if (loadingInitial) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchText || currentStatusFilter !== 'all'
            ? t('noOrders', 'Không tìm thấy đơn hàng')
            : t('noOrdersEmpty', 'Chưa có đơn hàng nào')}
        </Text>
        <Text variant="caption" style={styles.emptySubtext}>
          {t('noOrdersHelper', 'Danh sách đơn hàng của bạn sẽ hiển thị ở đây')}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>{t('loading', 'Đang tải...')}</Text>
      </View>
    );
  };

  return (
    <VerificationRequiredOverlay>
      <StoreVerificationRequiredOverlay>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Header */}
          <ScreenHeader title={t('title', 'Quản lý hoá đơn')} showBack={true} />

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <SearchBar
              placeholder={t('searchPlaceholder', 'Tìm kiếm theo mã đơn hàng...')}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Order List */}
          {loadingInitial ? (
            <View style={styles.initialLoader}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{t('loading', 'Đang tải...')}</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>{t('retry', 'Thử lại')}</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={filteredOrders}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.listContent,
                filteredOrders.length === 0 && styles.emptyList,
              ]}
              ItemSeparatorComponent={renderItemSeparator}
              ListEmptyComponent={renderEmptyComponent}
              ListFooterComponent={renderFooter}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={loadingInitial}
                  onRefresh={handleRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </StoreVerificationRequiredOverlay>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  filterSection: {
    // marginTop: spacing.md,
    // marginBottom: spacing.xs,
    paddingHorizontal: spacing.md
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.subtitle,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    // fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  initialLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.subtitle,
    color: colors.danger,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.light,
  },
});

export default OrderManagementScreen;
