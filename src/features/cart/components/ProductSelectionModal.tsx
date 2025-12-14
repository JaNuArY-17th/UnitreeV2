import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Text, BottomSheetModal } from '@/shared/components/base';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { Search } from '@/shared/assets/icons';
import { useGlobalVariations } from '@/features/product/hooks/useVariations';
import type { Variation } from '@/features/product/types/variation';
import { formatVND } from '@/shared/utils/format';

interface ProductSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectProduct: (variation: Variation) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  visible,
  onClose,
  onSelectProduct,
}) => {
  const { t } = useTranslation('cart');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  // Debounce search text (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Search all variations globally with AVAILABLE status filter
  const { data: variationsResponse, isLoading, error } = useGlobalVariations(
    {
      name: debouncedSearchText || undefined,
      status: 'AVAILABLE', // Only show available items in cart
    },
    {
      enabled: visible,
      staleTime: 1 * 60 * 1000, // 1 minute for real-time inventory
    }
  );

  const variations = useMemo(() => {
    return variationsResponse?.data || [];
  }, [variationsResponse]);

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'AVAILABLE':
        return colors.success;
      case 'OUT_OF_STOCK':
        return colors.danger;
      case 'DISCONTINUED':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'AVAILABLE':
        return t('productStatus.available', 'Còn hàng');
      case 'OUT_OF_STOCK':
        return t('productStatus.outOfStock', 'Hết hàng');
      case 'DISCONTINUED':
        return t('productStatus.discontinued', 'Ngừng bán');
      default:
        return status;
    }
  };

  const handleSelectProduct = (variation: Variation) => {
    onSelectProduct(variation);
    setSearchText('');
    onClose();
  };

  const renderItem = ({ item }: { item: Variation }) => (
    <Pressable
      style={({ pressed }) => [
        styles.productItem,
        pressed && styles.productItemPressed,
      ]}
      onPress={() => handleSelectProduct(item)}
    >
      <View style={styles.productAvatar}>
        <Text style={styles.productAvatarText}>
          {item.name.substring(0, 2).toUpperCase()}
        </Text>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.productMeta}>
          <Text style={styles.productSku}>SKU: {item.sku}</Text>
          {item.unit && <Text style={styles.productUnit}> • {item.unit}</Text>}
        </View>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            {formatVND(item.sale_price ?? item.price ?? 0)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}15` },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderEmptyComponent = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {debouncedSearchText
            ? t('noProductsFound', 'Không tìm thấy sản phẩm')
            : t('noProducts', 'Chưa có sản phẩm nào')}
        </Text>
        <Text style={styles.emptySubtext}>
          {debouncedSearchText
            ? t('tryDifferentSearch', 'Thử tìm kiếm với từ khóa khác')
            : t('noProductsHelper', 'Thêm sản phẩm để hiển thị ở đây')}
        </Text>
      </View>
    );
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('selectProduct', 'Chọn sản phẩm')}
      showHandle={true}
      maxHeightRatio={0.85}
      testID="product-selection-modal"
      fillToMaxHeight
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search width={20} height={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('searchProducts', 'Tìm kiếm sản phẩm...')}
            placeholderTextColor={colors.text.secondary}
          />
        </View>
      </View>

      {/* Product List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading', 'Đang tải...')}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t('loadError', 'Không thể tải danh sách sản phẩm')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={variations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 200,
  },
  productItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productItemPressed: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  productAvatar: {
    width: 56,
    height: 56,
    borderRadius: dimensions.radius.md,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  productAvatarText: {
    fontSize: 18,

    color: colors.primary,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  productSku: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
  productUnit: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,

    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: dimensions.radius.md,
  },
  statusText: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.danger,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default ProductSelectionModal;
