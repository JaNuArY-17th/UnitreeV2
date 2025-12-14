import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, dimensions } from '@/shared/themes';
import typographyStyles from '@/shared/themes/typography';
import { getFontFamily, FONT_WEIGHTS } from '@/shared/themes/fonts';
import { Text } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Add01Icon, Edit02Icon, Delete02Icon, Package01Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import { useVariations } from '../hooks/useVariations';
import { useVariationMutations } from '../hooks/useVariationMutations';
import type { ProductResponse } from '../types/product';
import type { VariationResponse } from '../types/variation';
import type { RootStackParamList } from '@/navigation/types';

interface ProductVariationTabProps {
  product: ProductResponse;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProductVariationTab: React.FC<ProductVariationTabProps> = ({ product }) => {
  const { t } = useTranslation('product');
  const navigation = useNavigation<NavigationProp>();
  const { storeData } = useStoreData();
  const storeId = storeData?.id;

  // Fetch variations
  const {
    data: variationsResponse,
    isLoading,
    refetch,
  } = useVariations(product.id, {
    enabled: !!product.id,
  });

  // Mutations
  const { deleteVariation, isDeleting } = useVariationMutations(product.id);

  const variations = variationsResponse?.data || [];

  // Handlers
  const handleCreate = () => {
    navigation.navigate('EditVariation', {
      productId: product.id,
    });
  };

  const handleEdit = (variation: VariationResponse) => {
    navigation.navigate('EditVariation', {
      productId: product.id,
      variationId: variation.id,
      variation: variation,
    });
  };

  const handleDelete = (variation: VariationResponse) => {
    Alert.alert(
      t('variations.deleteConfirmTitle'),
      t('variations.deleteConfirmMessage', { name: variation.name }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('variations.deleteButton'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVariation.mutateAsync(variation.id);
              Alert.alert(t('variations.success'), t('variations.deleteSuccess'));
            } catch (error: any) {
              Alert.alert(t('variations.error'), error.message || t('variations.deleteError'));
            }
          },
        },
      ]
    );
  };

  // Render functions
  const renderItem = ({ item }: { item: VariationResponse }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.variationCard,
          pressed && styles.variationCardPressed,
        ]}
        onPress={() => handleEdit(item)}
      >
        <View style={styles.mainContent}>
          <View style={styles.infoSection}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>

            <Text style={styles.variationName}>{item.name}</Text>

            <Text style={styles.variationSku}>{t('variations.sku')} {item.sku}</Text>
          </View>

          <View style={styles.illustrationSection}>
            <View style={styles.iconContainer}>
              {item.fileUrls && item.fileUrls.length > 0 ? (
                <Image
                  source={{ uri: item.fileUrls[0] }}
                  style={styles.variationImage}
                  resizeMode='cover'
                />
              ) : (
                <HugeiconsIcon icon={Package01Icon} size={40} color={colors.primary} />
              )}
            </View>
          </View>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dashedLine} />
        </View>

        <View style={styles.footer}>
          <View style={styles.variationDetails}>
            {item.unit && (
              <Text style={styles.variationDetail}>{t('variations.unit')} {item.unit}</Text>
            )}
            <View style={styles.variationPricing}>
              {item.price && (
                <Text style={styles.variationPrice}>
                  {t('variations.price')} {item.price.toLocaleString('vi-VN')} {product.currency}
                </Text>
              )}
              {item.sale_price && (
                <Text style={styles.variationSalePrice}>
                  {t('variations.salePrice')} {item.sale_price.toLocaleString('vi-VN')} {product.currency}
                </Text>
              )}
            </View>
            <Text style={styles.variationQuantity}>
              {t('variations.quantity')} {item.quantity || 0}
            </Text>
          </View>

          <View style={styles.variationActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => handleEdit(item)}
            >
              <HugeiconsIcon icon={Edit02Icon} size={18} color={colors.primary} />
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
              disabled={isDeleting}
            >
              <HugeiconsIcon icon={Delete02Icon} size={18} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.emptyText}>{t('variations.loading')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('variations.empty')}</Text>
        <Text style={styles.emptySubtext}>
          {t('variations.emptyHelper')}
        </Text>
      </View>
    );
  };

  if (!product.has_variation) {
    return (
      <View style={styles.container}>
        <View style={styles.noVariationContainer}>
          <Text style={styles.noVariationText}>
            {t('variations.noVariation')}
          </Text>
          <Text style={styles.noVariationSubtext}>
            {t('variations.noVariationHelper')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Variations List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.listContent,
          variations.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {variations.length === 0 ? (
          renderEmpty()
        ) : (
          variations.map((item) => (
            <View key={item.id}>
              {renderItem({ item })}
              {variations.indexOf(item) < variations.length - 1 && (
                <View style={{ height: spacing.md }} />
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <Pressable style={styles.addButton} onPress={handleCreate}>
        <HugeiconsIcon icon={Add01Icon} size={16} color={colors.light} />
        <Text style={styles.addButtonText}>{t('variations.addVariation')}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    marginBottom: spacing.lg,
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
    ...typographyStyles.subtitle,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typographyStyles.body,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  noVariationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  noVariationText: {
    ...typographyStyles.subtitle,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noVariationSubtext: {
    ...typographyStyles.body,
    color: colors.text.secondary,
    opacity: 0.7,
    textAlign: 'center',
  },
  variationCard: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  variationCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoSection: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  illustrationSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: dimensions.radius.sm,
    marginBottom: spacing.xs,
  },
  statusText: {
    ...typographyStyles.caption,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    color: colors.primary,
  },
  variationName: {
    ...typographyStyles.subtitle,
    color: colors.text.primary,
    marginBottom: 4,
  },
  variationSku: {
    ...typographyStyles.body,
    color: colors.text.secondary,
  },
  dividerContainer: {
    height: 1,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variationDetails: {
    flex: 1,
  },
  variationDetail: {
    ...typographyStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  variationPricing: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  variationPrice: {
    ...typographyStyles.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
  },
  variationSalePrice: {
    ...typographyStyles.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.danger,
  },
  variationQuantity: {
    ...typographyStyles.bodySmall,
    color: colors.text.secondary,
  },
  variationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    borderColor: colors.danger,
  },
  iconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.radius.md,
  },
  variationImage: {
    width: '100%',
    height: '100%',
    borderRadius: dimensions.radius.md
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: dimensions.radius.md,
    backgroundColor: colors.primary,
  },
  addButtonText: {
    ...typographyStyles.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.light,
  },
});

export default ProductVariationTab;
