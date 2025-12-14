import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Package01Icon } from '@hugeicons/core-free-icons';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, typography, dimensions } from '@/shared/themes';
import { formatVND } from '@/shared/utils/format';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { Product, ProductStatus } from '../types';

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { t } = useTranslation('product');

  const getStatusColor = (status: ProductStatus): string => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'out_of_stock':
        return colors.warning;
      case 'inactive':
        return colors.gray;
      default:
        return colors.gray;
    }
  };

  const getStatusText = (status: ProductStatus): string => {
    switch (status) {
      case 'active':
        return t('statusActive', 'Active');
      case 'out_of_stock':
        return t('statusOutOfStock', 'Out of Stock');
      case 'inactive':
        return t('statusInactive', 'Inactive');
      default:
        return status;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress?.(product)}
    >
      <View style={styles.leftSection}>
        {/* Avatar with Icon */}
        <View style={styles.avatar}>
          <HugeiconsIcon icon={Package01Icon} size={24} color={colors.primary} />
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          {product.unit && (
            <Text style={styles.unit} numberOfLines={1}>
              {product.unit}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {/* Price */}
        <Text style={styles.price}>
          {formatVND(product.price)}
        </Text>

        {/* Stock */}
        <Text style={styles.stock}>
          {t('stock')}: {product.stock}
        </Text>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(product.status) }]}>
          <Text style={styles.statusText}>
            {getStatusText(product.status)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
  },
  cardPressed: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.subtitle,
    color: colors.primary,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  unit: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  price: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  stock: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: dimensions.radius.md,
  },
  statusText: {
    ...typography.caption,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.light,
  },
});

export default ProductCard;
