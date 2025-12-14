/**
 * Product Item Card Component
 * Displays a product with quantity control and delete button
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import QuantityControl from './QuantityControl';

interface ProductItemCardProps {
  productName: string;
  sku: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

const ProductItemCard: React.FC<ProductItemCardProps> = ({
  productName,
  sku,
  quantity,
  onQuantityChange,
  onRemove,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {productName}
        </Text>
        <Text style={styles.sku}>SKU: {sku}</Text>
      </View>

      <View style={styles.actions}>
        <QuantityControl
          value={quantity}
          onIncrement={() => onQuantityChange(quantity + 1)}
          onDecrement={() => onQuantityChange(quantity - 1)}
        />

        <TouchableOpacity style={styles.deleteButton} onPress={onRemove}>
          <HugeiconsIcon icon={Delete02Icon} size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.subtitle,
    color: colors.dark,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sku: {
    ...typography.caption,
    color: colors.gray,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButton: {
    padding: spacing.xs,
  },
});

export default ProductItemCard;
