import React, { useState, useMemo, useEffect } from 'react';
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
import { colors, spacing, getFontFamily, FONT_WEIGHTS, typography, dimensions } from '@/shared/themes';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import ScreenHeader from '@/shared/components/ScreenHeader';
import SearchBar from '@/shared/components/SearchBar';
import { Text } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FilterIcon, Add01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import ProductApiCard from '../components/ProductApiCard';
import ProductFilterModal from '../components/ProductFilterModal';
import { useInfiniteProducts } from '../hooks/useProducts';
import type { FilterOptions } from '../types';
import type { ProductResponse } from '../types/product';
import type { RootStackParamList } from '@/navigation/types';

type ProductManagementScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductManagement'>;

// Helper to format currency for display
const formatCurrencyDisplay = (value: number): string => {
  return value.toLocaleString('vi-VN');
};

// Check if any advanced filters are active
const hasActiveFilters = (filters: FilterOptions): boolean => {
  return filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.stockMin !== undefined ||
    filters.stockMax !== undefined;
};

const ProductManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProductManagementScreenNavigationProp>();
  const { t } = useTranslation('product');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchText]);

  // Get store data
  const { storeData, hasStore, isLoading: isLoadingStore } = useStoreData();
  const storeId = storeData?.id;

  // Filter by has_variation
  const variationFilters: Array<{ id: 'all' | 'with_variation' | 'no_variation'; label: string }> = [
    { id: 'all', label: t('filterAll', 'Tất cả') },
    { id: 'with_variation', label: t('withVariation', 'Có biến thể') },
    { id: 'no_variation', label: t('noVariation', 'Không biến thể') },
  ];

  // Use products API hook
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({
    searchTerm: debouncedSearchText,
  }, {
    enabled: true,
  });

  // Extract products from API response
  const products = useMemo(() => {
    return productsResponse?.pages?.flatMap((page: any) => page.data?.content || []) || [];
  }, [productsResponse]);

  // Get current variation filter (default 'all')
  const [currentVariationFilter, setCurrentVariationFilter] = useState<'all' | 'with_variation' | 'no_variation'>('all');
  const [currentAdvancedFilters, setCurrentAdvancedFilters] = useState<FilterOptions>({});

  // Check if advanced filters are active
  const hasFilters = useMemo(() => hasActiveFilters(currentAdvancedFilters), [currentAdvancedFilters]);

  // Generate filter summary labels
  const priceFilterLabel = useMemo(() => {
    const { priceMin, priceMax } = currentAdvancedFilters;
    if (priceMin !== undefined && priceMax !== undefined) {
      return `${formatCurrencyDisplay(priceMin)} - ${formatCurrencyDisplay(priceMax)}đ`;
    }
    if (priceMin !== undefined) return `≥ ${formatCurrencyDisplay(priceMin)}đ`;
    if (priceMax !== undefined) return `≤ ${formatCurrencyDisplay(priceMax)}đ`;
    return null;
  }, [currentAdvancedFilters]);

  const stockFilterLabel = useMemo(() => {
    const { stockMin, stockMax } = currentAdvancedFilters;
    if (stockMin !== undefined && stockMax !== undefined) {
      return `${formatCurrencyDisplay(stockMin)} - ${formatCurrencyDisplay(stockMax)}`;
    }
    if (stockMin !== undefined) return `≥ ${formatCurrencyDisplay(stockMin)}`;
    if (stockMax !== undefined) return `≤ ${formatCurrencyDisplay(stockMax)}`;
    return null;
  }, [currentAdvancedFilters]);

  // Filter products based on variation filter
  const filteredProducts = useMemo(() => {
    if (currentVariationFilter === 'all') {
      return products;
    }
    if (currentVariationFilter === 'with_variation') {
      return products.filter(p => p.has_variation);
    }
    return products.filter(p => !p.has_variation);
  }, [products, currentVariationFilter]);

  // Loading and error states
  const loadingInitial = (isLoadingStore || isLoadingProducts) && !productsResponse;
  const loadingMore = isFetchingNextPage;
  const error = productsError ? 'Không thể tải danh sách sản phẩm' : null;

  // Set status bar
  useStatusBarEffect('transparent', 'dark-content', true);

  // Handlers
  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleFilterPress = () => {
    setIsFilterModalVisible(true);
  };

  const handleVariationFilterPress = (filter: 'all' | 'with_variation' | 'no_variation') => {
    setCurrentVariationFilter(filter);
  };

  const handleApplyAdvancedFilters = (filters: FilterOptions) => {
    setCurrentAdvancedFilters(filters);
    // TODO: Implement advanced filters with backend API
  };

  const handleClearPriceFilter = () => {
    const newFilters = { ...currentAdvancedFilters };
    delete newFilters.priceMin;
    delete newFilters.priceMax;
    setCurrentAdvancedFilters(newFilters);
  };

  const handleClearStockFilter = () => {
    const newFilters = { ...currentAdvancedFilters };
    delete newFilters.stockMin;
    delete newFilters.stockMax;
    setCurrentAdvancedFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setCurrentAdvancedFilters({});
  };

  const handleProductPress = (product: ProductResponse) => {
    // Navigate to product detail screen when clicking on the card
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleCreateProduct = () => {
    navigation.navigate('EditProduct', {});
  };

  const handleEndReached = () => {
    if (hasNextPage && !loadingMore && !loadingInitial) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    setSearchText('');
    setDebouncedSearchText('');
    refetchProducts();
  };

  // Render functions
  const renderItem = ({ item }: { item: ProductResponse }) => {
    return (
      <ProductApiCard
        product={item}
        onPress={handleProductPress}
      />
    );
  };

  const renderItemSeparator = () => <View style={{ height: spacing.md }} />;

  const renderEmptyComponent = () => {
    if (loadingInitial) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchText || currentVariationFilter !== 'all' || Object.keys(currentAdvancedFilters).length > 0
            ? t('noProducts')
            : t('noProductsEmpty')}
        </Text>
        <Text variant="caption" style={styles.emptySubtext}>
          {t('noProductsHelper', 'Danh sách sản phẩm của bạn sẽ hiển thị ở đây')}
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

  // Show store loading state
  if (isLoadingStore) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('title', 'Manage Products')} showBack={true} />
        <View style={styles.initialLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading', 'Đang tải...')}</Text>
        </View>
      </View>
    );
  }

  // Show no store warning
  if (!hasStore || !storeId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('title', 'Manage Products')} showBack={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t('noStore', 'Bạn chưa có cửa hàng. Vui lòng tạo cửa hàng trước khi quản lý sản phẩm.')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <VerificationRequiredOverlay>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <ScreenHeader title={t('title', 'Manage Products')} showBack={true} />

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder={t('search', 'Search by name, unit, or price...')}
            rightIcon={
              <View>
                <HugeiconsIcon icon={FilterIcon} size={20} color={hasFilters ? colors.primary : colors.text.secondary} />
                {hasFilters && <View style={styles.filterDot} />}
              </View>
            }
            onRightIconPress={handleFilterPress}
            showExternalIcon={true}
          />
        </View>

        {/* Quick Filter Pills */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {variationFilters.map((filter) => (
              <Pressable
                key={filter.id}
                style={[
                  styles.filterPill,
                  currentVariationFilter === filter.id && styles.filterPillActive,
                ]}
                onPress={() => handleVariationFilterPress(filter.id)}
              >
                <Text
                  variant="caption"
                  style={[
                    styles.filterPillText,
                    currentVariationFilter === filter.id && styles.filterPillTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Active Advanced Filter Chips */}
        {hasFilters && (
          <View style={styles.activeFiltersSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersContent}
            >
              {priceFilterLabel && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterLabel}>{t('priceRange', 'Giá')}:</Text>
                  <Text style={styles.activeFilterValue}>{priceFilterLabel}</Text>
                  <Pressable onPress={handleClearPriceFilter} hitSlop={8}>
                    <HugeiconsIcon icon={Cancel01Icon} size={14} color={colors.text.secondary} />
                  </Pressable>
                </View>
              )}
              {stockFilterLabel && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterLabel}>{t('stockRange', 'Tồn kho')}:</Text>
                  <Text style={styles.activeFilterValue}>{stockFilterLabel}</Text>
                  <Pressable onPress={handleClearStockFilter} hitSlop={8}>
                    <HugeiconsIcon icon={Cancel01Icon} size={14} color={colors.text.secondary} />
                  </Pressable>
                </View>
              )}
              {(priceFilterLabel && stockFilterLabel) && (
                <Pressable style={styles.clearAllButton} onPress={handleClearAllFilters}>
                  <Text style={styles.clearAllText}>{t('clearAll', 'Xóa tất cả')}</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        )}

        {/* Product List */}
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
            data={filteredProducts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              filteredProducts.length === 0 && styles.emptyList,
            ]}
            ItemSeparatorComponent={renderItemSeparator}
            ListEmptyComponent={renderEmptyComponent}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={loadingInitial}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Filter Modal */}
        <ProductFilterModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          onApply={handleApplyAdvancedFilters}
          initialFilters={currentAdvancedFilters}
        />

        {/* Floating Action Button */}
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
          onPress={handleCreateProduct}
        >
          <HugeiconsIcon icon={Add01Icon} size={24} color={colors.light} />
        </Pressable>
      </View>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    // marginTop: spacing.md,
  },
  filterSection: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: dimensions.radius.md,
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  filterPillTextActive: {
    ...typography.body,
    color: colors.light,
  },
  filterDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  activeFiltersSection: {
    marginBottom: spacing.xs,
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
  listContent: {
    padding: spacing.lg,
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
    ...typography.body,
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
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductManagementScreen;
