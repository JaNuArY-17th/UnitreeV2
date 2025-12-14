import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useProduct } from './useProduct';
import { useVariations } from './useVariations';
import { useProductMutations } from './useProductMutations';
import { useVariationMutations } from './useVariationMutations';
import type { RootStackParamList } from '@/navigation/types';
import type { VariationResponse } from '../types/variation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

interface UseProductDetailOptions {
  productId: string;
}

export const useProductDetail = ({ productId }: UseProductDetailOptions) => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation('product');

  // Fetch product data
  const {
    data: productResponse,
    isLoading: isLoadingProduct,
    error: productError,
    refetch: refetchProduct,
  } = useProduct(productId, {
    enabled: !!productId,
  });

  const product = productResponse?.data;

  // Fetch variations if product has variations
  const {
    data: variationsResponse,
    isLoading: isLoadingVariations,
    refetch: refetchVariations,
  } = useVariations(productId, {
    enabled: !!productId && !!product?.has_variation,
  });

  const variations = variationsResponse?.data || [];

  // Mutations
  const { deleteProduct, isDeleting: isDeletingProduct } = useProductMutations();
  const { deleteVariation, isDeleting: isDeletingVariation } = useVariationMutations(productId);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEdit = useCallback(() => {
    if (product) {
      navigation.navigate('EditProduct', { productId: product.id });
    }
  }, [navigation, product]);

  const handleCreateVariation = useCallback(() => {
    navigation.navigate('EditVariation', { productId });
  }, [navigation, productId]);

  const handleEditVariation = useCallback((variation: VariationResponse) => {
    navigation.navigate('EditVariation', {
      productId,
      variationId: variation.id,
      variation,
    });
  }, [navigation, productId]);

  // Delete handlers
  const handleDelete = useCallback(() => {
    if (!product) return;
    Alert.alert(
      t('overview.deleteConfirmTitle'),
      t('overview.deleteConfirmMessage', { name: product.name }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('overview.deleteButton'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct.mutateAsync(product.id);
              Alert.alert(t('overview.success'), t('overview.deleteSuccess'), [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              Alert.alert(t('overview.error'), error.message || t('overview.deleteError'));
            }
          },
        },
      ]
    );
  }, [product, t, deleteProduct, navigation]);

  const handleDeleteVariation = useCallback((variation: VariationResponse) => {
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
  }, [t, deleteVariation]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    refetchProduct();
    if (product?.has_variation) {
      refetchVariations();
    }
  }, [refetchProduct, refetchVariations, product?.has_variation]);

  return {
    // Data
    product,
    variations,

    // Loading states
    isLoadingProduct,
    isLoadingVariations,
    isDeletingProduct,
    isDeletingVariation,

    // Error states
    productError,

    // Handlers
    handleBack,
    handleEdit,
    handleDelete,
    handleCreateVariation,
    handleEditVariation,
    handleDeleteVariation,
    handleRefresh,

    // Refetch functions
    refetchProduct,
    refetchVariations,
  };
};
