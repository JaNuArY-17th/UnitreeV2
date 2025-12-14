/**
 * Product Variation Item Component
 * Displays a product variation in the search modal
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { PackageIcon } from '@hugeicons/core-free-icons';

interface ProductVariationItemProps {
  item: {
    id: string;
    name: string;
    sku?: string;
    fileUrls?: string[];
  };
  onPress: () => void;
}

const ProductVariationItem: React.FC<ProductVariationItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {item.fileUrls && item.fileUrls.length > 0 ? (
        <Image
          source={{ uri: item.fileUrls[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <HugeiconsIcon icon={PackageIcon} size={24} color={colors.gray} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name || 'Unnamed product'}
        </Text>
        {item.sku && <Text style={styles.sku}>SKU: {item.sku}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: 'center',
    gap: spacing.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: dimensions.radius.sm,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: dimensions.radius.sm,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
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
});

export default ProductVariationItem;
