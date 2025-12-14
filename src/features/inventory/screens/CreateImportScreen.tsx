/**
 * Create Import Screen
 * Screen for creating inventory import papers
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Text from '@/shared/components/base/Text';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  PackageIcon,
} from '@hugeicons/core-free-icons';
import { inventoryService } from '../services';
import { useGlobalVariations } from '@/features/product/hooks/useVariations';
import { ProductSearchModal, ProductItemCard } from '../components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ImportItem {
  id: string;
  productVariationId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
}

const CreateImportScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('inventory');
  const navigation = useNavigation<NavigationProp>();

  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ImportItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Product selection modal
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load variations using the hook - load all products when modal opens
  const { data: variationsData, isLoading: loadingVariations } = useGlobalVariations(
    searchQuery.length >= 2 ? { name: searchQuery } : {},
    { enabled: modalVisible }
  );

  const variations = variationsData?.data || [];

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddProduct = (variation: any) => {
    // Check if product already exists
    const existingIndex = items.findIndex(
      (item) => item.productVariationId === variation.id
    );

    if (existingIndex !== -1) {
      // Update existing item quantity
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += 1;
      setItems(updatedItems);
      Alert.alert('Thành công', 'Đã cập nhật số lượng sản phẩm');
    } else {
      // Add new item with default quantity = 1
      const newItem: ImportItem = {
        id: Date.now().toString(),
        productVariationId: variation.id,
        productName: variation.name || 'Unnamed product',
        sku: variation.sku || 'N/A',
        quantity: 1,
        unit: 'cái',
      };
      setItems([...items, newItem]);
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào danh sách');
    }

    setModalVisible(false);
    setSearchQuery('');
  };

  const handleRemoveProduct = (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setItems(items.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setItems(updatedItems);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    Alert.alert(
      'Xác nhận nhập kho',
      `Bạn có chắc chắn muốn nhập ${totalItems} sản phẩm vào kho?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setSubmitting(true);
              const code = 'NK' + Date.now().toString().slice(-8);

              const requestData = {
                name: code,
                type: 'IMPORT' as const,
                notes: notes || '',
                items: items.map((item) => ({
                  productVariationId: item.productVariationId,
                  quantity: item.quantity,
                  notes: '',
                })),
              };

              const response = await inventoryService.importInventory(requestData);

              if (response.success) {
                Alert.alert('Thành công', 'Nhập kho thành công', [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('InventoryManagement'),
                  },
                ]);
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể nhập kho');
              }
            } catch (error) {
              console.error('Error importing:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi nhập kho');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: ImportItem }) => (
    <ProductItemCard
      productName={item.productName}
      sku={item.sku}
      quantity={item.quantity}
      onQuantityChange={(quantity) => handleUpdateQuantity(item.id, quantity)}
      onRemove={() => handleRemoveProduct(item.id)}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <ScreenHeader
        title={t('import.title', 'Tạo phiếu nhập kho')}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin phiếu nhập</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Nhập ghi chú (nếu có)"
              placeholderTextColor={colors.gray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <HugeiconsIcon icon={Add01Icon} size={20} color={colors.light} />
              <Text style={styles.addButtonText}>Thêm sản phẩm</Text>
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <HugeiconsIcon icon={PackageIcon} size={48} color={colors.lightGray} />
              <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
              <Text style={styles.emptySubtext}>
                Nhấn "Thêm sản phẩm" để bắt đầu
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}

          {items.length > 0 && (
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Tổng số sản phẩm:</Text>
              <Text style={styles.summaryValue}>{totalItems} sản phẩm</Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (items.length === 0 || submitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={items.length === 0 || submitting}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Đang xử lý...' : 'Tạo phiếu nhập'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Product Selection Modal */}
      <ProductSearchModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        variations={variations}
        loading={loadingVariations}
        onSelectProduct={handleAddProduct}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
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
    ...typography.h3,
    color: colors.dark,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.dark,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.dark,
    minHeight: 100,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: dimensions.radius.md,
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.light,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    marginTop: spacing.md,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.gray,
  },
  summaryValue: {
    ...typography.subtitle,
    fontSize: 18,
    color: colors.dark,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: dimensions.radius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.5,
  },
  submitButtonText: {
    ...typography.subtitle,
    color: colors.light,
    fontWeight: '600',
  },
});

export default CreateImportScreen;
