/**
 * Product Search Modal Component
 * Reusable modal for searching and selecting products
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Search01Icon, PackageIcon } from '@hugeicons/core-free-icons';
import ProductVariationItem from './ProductVariationItem';

interface ProductSearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  variations: any[];
  loading: boolean;
  onSelectProduct: (product: any) => void;
}

const ProductSearchModal: React.FC<ProductSearchModalProps> = ({
  visible,
  onClose,
  searchQuery,
  onSearchChange,
  variations,
  loading,
  onSelectProduct,
}) => {

  console.log('ProductSearchModal - variations:', variations);
  console.log('ProductSearchModal - loading:', loading);
  console.log('ProductSearchModal - variations.length:', variations.length);
  if (variations.length > 0) {
    console.log('ProductSearchModal - First item:', variations[0]);
    console.log('ProductSearchModal - First item ID:', variations[0]?.id);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Tìm kiếm sản phẩm</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <HugeiconsIcon icon={Search01Icon} size={20} color={colors.gray} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Tìm tên hoặc mã sản phẩm..."
              placeholderTextColor={colors.gray}
              autoFocus
            />
          </View>

          {(() => {
           
            if (loading) {
              return (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.centerText}>Đang tải sản phẩm...</Text>
                </View>
              );
            }

            if (variations.length === 0) {
              return (
                <View style={styles.centerContainer}>
                  <HugeiconsIcon icon={PackageIcon} size={48} color={colors.gray} />
                  <Text style={styles.centerText}>
                    {searchQuery.length > 0
                      ? 'Không tìm thấy sản phẩm'
                      : 'Chưa có sản phẩm nào'}
                  </Text>
                </View>
              );
            }

            console.log('ProductSearchModal - Rendering FlatList with', variations.length, 'items');
            return (
              <FlatList
                data={variations}
                renderItem={({ item }) => {
                  console.log('ProductSearchModal - Rendering item:', item.id, item.name);
                  return <ProductVariationItem item={item} onPress={() => onSelectProduct(item)} />;
                }}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              />
            );
          })()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.light,
    borderTopLeftRadius: dimensions.radius.xl,
    borderTopRightRadius: dimensions.radius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    height: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.dark,
    fontWeight: '600',
  },
  close: {
    ...typography.h2,
    color: colors.gray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    gap: spacing.sm,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: colors.dark,
    paddingVertical: spacing.xs,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  centerText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});

export default ProductSearchModal;
