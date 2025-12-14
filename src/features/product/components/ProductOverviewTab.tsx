import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, dimensions } from '@/shared/themes';
import typographyStyles from '@/shared/themes/typography';
import { Text } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Edit02Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import { useProductMutations } from '../hooks/useProductMutations';
import type { ProductResponse } from '../types/product';
import type { RootStackParamList } from '@/navigation/types';

interface ProductOverviewTabProps {
  product: ProductResponse;
  onRefresh?: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProductOverviewTab: React.FC<ProductOverviewTabProps> = ({
  product,
  onRefresh,
}) => {
  const { t } = useTranslation('product');
  const navigation = useNavigation<NavigationProp>();
  const { storeData } = useStoreData();
  const storeId = storeData?.id;

  const { deleteProduct, isDeleting } = useProductMutations();

  const handleEdit = () => {
    navigation.navigate('EditProduct', { productId: product.id });
  };

  const handleDelete = () => {
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
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: any) {
              Alert.alert(t('overview.error'), error.message || t('overview.deleteError'));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Product Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('overview.basicInfo')}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('overview.productNameLabel')}</Text>
          <Text style={styles.infoValue}>{product.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('overview.categoryIdLabel')}</Text>
          <Text style={styles.infoValue}>{product.category_name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('overview.currencyLabel')}</Text>
          <Text style={styles.infoValue}>{product.currency || 'VND'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('overview.hasVariationLabel')}</Text>
          <Text style={styles.infoValue}>
            {product.has_variation ? t('overview.yes') : t('overview.no')}
          </Text>
        </View>

        {product.description && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('overview.descriptionLabel')}</Text>
            <Text style={styles.infoValueMultiline}>{product.description}</Text>
          </View>
        )}
      </View>

      {/* Suppliers */}
      {product.suppliers && product.suppliers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('overview.suppliersSection')}</Text>
          {product.suppliers.map((supplier, index) => (
            <View key={supplier.id || index} style={styles.supplierCard}>
              <Text style={styles.supplierName}>{supplier.name}</Text>
              {supplier.contact_info && (
                <Text style={styles.supplierContact}>
                  {supplier.contact_info}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <HugeiconsIcon icon={Edit02Icon} size={18} color={colors.light} />
          <Text style={styles.actionButtonText}>{t('overview.editButton')}</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          <HugeiconsIcon icon={Delete02Icon} size={18} color={colors.light} />
          <Text style={styles.actionButtonText}>{t('overview.deleteButton')}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  actionSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: dimensions.radius.md,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    ...typographyStyles.body,
    color: colors.light,
  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: dimensions.radius.lg,
  },
  sectionTitle: {
    ...typographyStyles.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typographyStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typographyStyles.body,
    color: colors.text.primary,
  },
  infoValueMultiline: {
    ...typographyStyles.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  supplierCard: {
    backgroundColor: colors.light,
    padding: spacing.md,
    borderRadius: dimensions.radius.md,
    marginBottom: spacing.sm,
  },
  supplierName: {
    ...typographyStyles.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  supplierContact: {
    ...typographyStyles.bodySmall,
    color: colors.text.secondary,
  },
});

export default ProductOverviewTab;
