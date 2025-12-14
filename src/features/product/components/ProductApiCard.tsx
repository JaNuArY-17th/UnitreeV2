import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/shared/components/base';
import { colors, spacing, dimensions } from '@/shared/themes';
import typographyStyles from '@/shared/themes/typography';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Package01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import type { ProductResponse } from '../types/product';

interface ProductApiCardProps {
  product: ProductResponse;
  onPress?: (product: ProductResponse) => void;
}

const ProductApiCard: React.FC<ProductApiCardProps> = ({ product, onPress }) => {
  const { t } = useTranslation('product');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress?.(product)}
    >
      <View style={styles.mainContent}>
        <View style={styles.iconContainer}>
          <HugeiconsIcon icon={Package01Icon} size={22} color={colors.primary} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
        </View>

        <View style={styles.actionSection}>
          {product.has_variation && (
            <View style={styles.variationBadge}>
              <Text style={styles.variationText}>
                {t('hasVariation', 'Biến thể')}
              </Text>
            </View>
          )}
          <View style={styles.arrowContainer}>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} color={colors.gray} />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardPressed: {
    backgroundColor: colors.background,
    transform: [{ scale: 0.99 }],
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: dimensions.radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    ...typographyStyles.subtitle,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  variationBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.sm,
  },
  variationText: {
    ...typographyStyles.caption,
    color: colors.primary,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: dimensions.radius.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductApiCard;
