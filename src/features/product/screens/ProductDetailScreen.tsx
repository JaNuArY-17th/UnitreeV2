import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, dimensions } from '@/shared/themes';
import typographyStyles from '@/shared/themes/typography';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { Text } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Edit02Icon,
  Delete02Icon,
  Add01Icon,
  Package01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useProductDetail } from '../hooks/useProductDetail';
import type { RootStackParamList } from '@/navigation/types';

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { t } = useTranslation('product');
  const { productId } = route.params;

  // Use combined hook for all product detail logic
  const {
    product,
    variations,
    isLoadingProduct,
    isLoadingVariations,
    isDeletingProduct,
    productError,
    handleBack,
    handleEdit,
    handleDelete,
    handleCreateVariation,
    handleEditVariation,
    handleRefresh,
    refetchProduct,
  } = useProductDetail({ productId });

  // Set status bar
  useStatusBarEffect('transparent', 'dark-content', true);

  // Loading state
  if (isLoadingProduct) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={t('productDetail', 'Chi tiết sản phẩm')}
          showBack={true}
          onBackPress={handleBack}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading', 'Đang tải...')}</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={t('productDetail', 'Chi tiết sản phẩm')}
          showBack={true}
          onBackPress={handleBack}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {productError ? t('loadError', 'Không thể tải thông tin sản phẩm') : t('notFound', 'Không tìm thấy sản phẩm')}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => refetchProduct()}>
            <Text style={styles.retryButtonText}>{t('retry', 'Thử lại')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('productDetail', 'Chi tiết sản phẩm')}
        showBack={true}
        onBackPress={handleBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoadingProduct} onRefresh={handleRefresh} />
        }
      >
        {/* Product Header Card - Horizontal Layout */}
        <View style={styles.headerCard}>
          <View style={styles.productIconContainer}>
            <HugeiconsIcon icon={Package01Icon} size={24} color={colors.primary} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            {product.category_name && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category_name}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [styles.headerActionButton, styles.editIconButton, pressed && styles.buttonPressed]}
              onPress={handleEdit}
            >
              <HugeiconsIcon icon={Edit02Icon} size={16} color={colors.primary} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.headerActionButton, styles.deleteIconButton, pressed && styles.buttonPressed]}
              onPress={handleDelete}
              disabled={isDeletingProduct}
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} color={colors.danger} />
            </Pressable>
          </View>
        </View>

        {/* Description Section - Only if exists */}
        {product.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('overview.descriptionLabel', 'Mô tả')}</Text>
            <View style={styles.infoCard}>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          </View>
        )}

        {/* Suppliers Section */}
        {product.suppliers && product.suppliers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('overview.suppliersSection', 'Nhà cung cấp')}</Text>
            <View style={styles.infoCard}>
              {product.suppliers.map((supplier, index) => (
                <React.Fragment key={supplier.id || index}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.supplierRow}>
                    <Text style={styles.supplierName}>{supplier.name}</Text>
                    {supplier.contact_info && (
                      <Text style={styles.supplierContact}>{supplier.contact_info}</Text>
                    )}
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Variations Section */}
        {product.has_variation && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleNoMargin}>{t('variations.title', 'Biến thể')}</Text>
              <Pressable style={styles.addVariationButton} onPress={handleCreateVariation}>
                <HugeiconsIcon icon={Add01Icon} size={16} color={colors.primary} />
                <Text style={styles.addVariationText}>{t('variations.addVariation', 'Thêm')}</Text>
              </Pressable>
            </View>

            {isLoadingVariations ? (
              <View style={styles.variationsLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : variations.length === 0 ? (
              <View style={styles.emptyVariations}>
                <Text style={styles.emptyText}>{t('variations.empty', 'Chưa có biến thể')}</Text>
                <Text style={styles.emptySubtext}>{t('variations.emptyHelper', 'Nhấn "Thêm" để tạo biến thể mới')}</Text>
              </View>
            ) : (
              <View style={styles.variationsList}>
                {variations.map((variation) => (
                  <Pressable
                    key={variation.id}
                    style={({ pressed }) => [
                      styles.variationCard,
                      pressed && styles.variationCardPressed,
                    ]}
                    onPress={() => handleEditVariation(variation)}
                  >
                    <View style={styles.variationMain}>
                      <View style={styles.variationImageContainer}>
                        {variation.fileUrls && variation.fileUrls.length > 0 ? (
                          <Image
                            source={{ uri: variation.fileUrls[0] }}
                            style={styles.variationImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <HugeiconsIcon icon={Package01Icon} size={24} color={colors.gray} />
                        )}
                      </View>
                      <View style={styles.variationInfo}>
                        <Text style={styles.variationName} numberOfLines={1}>{variation.name}</Text>
                        <Text style={styles.variationSku}>{t('variations.sku', 'SKU:')} {variation.sku}</Text>
                        <View style={styles.variationMeta}>
                          {variation.price && (
                            <Text style={styles.variationPrice}>
                              {variation.price.toLocaleString('vi-VN')} {product.currency}
                            </Text>
                          )}
                          <Text style={styles.variationQty}>
                            {t('variations.quantity', 'SL:')} {variation.quantity || 0}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.variationActions}>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} color={colors.gray} />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typographyStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typographyStyles.body,
    color: colors.danger,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: dimensions.radius.md,
  },
  retryButtonText: {
    ...typographyStyles.body,
    color: colors.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  // Header Card
  headerCard: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productIconContainer: {
    width: 48,
    height: 48,
    borderRadius: dimensions.radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  productName: {
    ...typographyStyles.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: dimensions.radius.sm,
  },
  categoryText: {
    ...typographyStyles.bodySmall,
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerActionButton: {
    width: 32,
    height: 32,
    borderRadius: dimensions.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconButton: {
    backgroundColor: colors.primaryLight,
  },
  deleteIconButton: {
    backgroundColor: colors.dangerSoft,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typographyStyles.subtitle,
    marginBottom: spacing.md,
  },
  sectionTitleNoMargin: {
    ...typographyStyles.title,
  },
  infoCard: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.md,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  descriptionText: {
    ...typographyStyles.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  // Supplier
  supplierRow: {
    paddingVertical: spacing.sm,
  },
  supplierName: {
    ...typographyStyles.body,
  },
  supplierContact: {
    ...typographyStyles.caption,
    marginTop: spacing.xs,
  },
  // Variations
  addVariationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: dimensions.radius.md,
  },
  addVariationText: {
    ...typographyStyles.bodySmall,
    color: colors.primary,
  },
  variationsLoading: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyVariations: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typographyStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typographyStyles.caption,
  },
  variationsList: {
    gap: spacing.sm,
  },
  variationCard: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  variationCardPressed: {
    backgroundColor: colors.background,
  },
  variationMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  variationImageContainer: {
    width: 56,
    height: 56,
    borderRadius: dimensions.radius.md,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  variationImage: {
    width: '100%',
    height: '100%',
  },
  variationInfo: {
    flex: 1,
  },
  variationName: {
    ...typographyStyles.body,
    marginBottom: 2,
  },
  variationSku: {
    ...typographyStyles.caption,
    marginBottom: spacing.xs,
  },
  variationMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  variationPrice: {
    ...typographyStyles.bodySmall,
    color: colors.primary,
  },
  variationQty: {
    ...typographyStyles.caption,
  },
  variationActions: {
    paddingLeft: spacing.sm,
  },
});

export default ProductDetailScreen;
