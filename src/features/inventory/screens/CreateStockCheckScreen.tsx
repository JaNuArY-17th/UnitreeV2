/**
 * Create Stock Check Screen
 * Screen for creating inventory stock check (reconciliation)
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
  ActivityIndicator,
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
  Delete02Icon,
  PackageIcon,
} from '@hugeicons/core-free-icons';
import { inventoryService } from '../services';
import { useGlobalVariations } from '@/features/product/hooks/useVariations';
import { ProductSearchModal } from '../components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface StockCheckItem {
  id: string;
  productVariationId: string;
  productName: string;
  sku: string;
  currentStock: number;
  actualStock: number;
  difference: number;
  note: string;
}

const CreateStockCheckScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('inventory');
  const navigation = useNavigation<NavigationProp>();

  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<StockCheckItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Product search modal
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load variations using the hook - load all products when modal opens
  const { data: variationsData, isLoading, isFetching } = useGlobalVariations(
    searchQuery.length >= 2 ? { name: searchQuery } : {},
    { enabled: modalVisible }
  );

  const variations = variationsData?.data || [];
  const loadingVariations = isLoading || isFetching;


  const handleAddProduct = (variation: any) => {
    // Check if product already exists
    const existingIndex = items.findIndex(
      (item) => item.productVariationId === variation.id
    );

    if (existingIndex !== -1) {
      Alert.alert('Thông báo', 'Sản phẩm đã có trong danh sách');
      return;
    }

    // Add new item (we don't have currentStock from variations API, set to 0)
    const newItem: StockCheckItem = {
      id: Date.now().toString(),
      productVariationId: variation.id,
      productName: variation.name || 'Unnamed product',
      sku: variation.sku || 'N/A',
      currentStock: 0, // Will need to fetch from inventory or set manually
      actualStock: 0,
      difference: 0,
      note: '',
    };
    setItems([...items, newItem]);
    Alert.alert('Thành công', 'Đã thêm sản phẩm vào danh sách');

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

  const handleUpdateActualStock = (id: string, actualStock: number) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const newActualStock = Math.max(0, actualStock);
        const difference = newActualStock - item.currentStock;
        return { ...item, actualStock: newActualStock, difference };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleUpdateNote = (id: string, note: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, note } : item
    );
    setItems(updatedItems);
  };

  const totalDifference = items.reduce((sum, item) => sum + item.difference, 0);

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    Alert.alert(
      'Xác nhận hoàn thành',
      `Bạn có chắc chắn muốn hoàn thành phiếu kiểm kho này?\nTổng chênh lệch: ${totalDifference > 0 ? '+' : ''}${totalDifference}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setSubmitting(true);

              const code = 'KC' + Date.now().toString().slice(-8);
              const requestData = {
                name: code,
                notes: notes || '',
                items: items.map((item) => ({
                  productVariationId: item.productVariationId,
                  actualQuantity: item.actualStock,
                })),
              };

              const response = await inventoryService.createStockCheck(requestData);

              if (response.success) {
                Alert.alert('Thành công', 'Đã hoàn thành phiếu kiểm kho', [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('InventoryManagement'),
                  },
                ]);
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể tạo phiếu kiểm kho');
              }
            } catch (error) {
              console.error('Error creating stock check:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo phiếu kiểm kho');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: StockCheckItem }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName}
          </Text>
          <Text style={styles.productSku}>SKU: {item.sku}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveProduct(item.id)}
        >
          <HugeiconsIcon icon={Delete02Icon} size={20} color="#F44336" />
        </TouchableOpacity>
      </View>

      <View style={styles.stockRow}>
        <View style={styles.stockItem}>
          <Text style={styles.stockLabel}>Tồn kho</Text>
          <Text style={styles.stockValue}>{item.currentStock}</Text>
        </View>

        <View style={styles.stockItem}>
          <Text style={styles.stockLabel}>Thực tế</Text>
          <View style={styles.actualStockInput}>
            <TouchableOpacity
              style={styles.stockButton}
              onPress={() => handleUpdateActualStock(item.id, item.actualStock - 1)}
            >
              <Text style={styles.stockButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.stockTextInput}
              value={item.actualStock.toString()}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                handleUpdateActualStock(item.id, value);
              }}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.stockButton}
              onPress={() => handleUpdateActualStock(item.id, item.actualStock + 1)}
            >
              <Text style={styles.stockButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stockItem}>
          <Text style={styles.stockLabel}>Chênh lệch</Text>
          <Text
            style={[
              styles.stockValue,
              styles.differenceValue,
              {
                color:
                  item.difference > 0
                    ? '#F44336'
                    : item.difference < 0
                    ? '#4CAF50'
                    : colors.gray,
              },
            ]}
          >
            {item.difference > 0 ? '+' : ''}
            {item.difference}
          </Text>
        </View>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteLabel}>Ghi chú:</Text>
        <TextInput
          style={styles.noteInput}
          value={item.note}
          onChangeText={(text) => handleUpdateNote(item.id, text)}
          placeholder="Nhập ghi chú (tùy chọn)"
          placeholderTextColor={colors.gray}
        />
      </View>
    </View>
  );


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <ScreenHeader
        title={t('stockCheck.create', 'Tạo phiếu kiểm kho')}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Thông tin phiếu kiểm kho</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mã phiếu</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>
                KC{Date.now().toString().slice(-8)}
              </Text>
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Nhập ghi chú (tùy chọn)"
              placeholderTextColor={colors.gray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
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
              <HugeiconsIcon icon={PackageIcon} size={48} color={colors.gray} />
              <Text style={styles.emptyText}>
                Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
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
        </View>

        {/* Summary Section */}
        {items.length > 0 && (
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng số sản phẩm:</Text>
              <Text style={styles.summaryValue}>{items.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng chênh lệch:</Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      totalDifference > 0
                        ? '#F44336'
                        : totalDifference < 0
                        ? '#4CAF50'
                        : colors.dark,
                  },
                ]}
              >
                {totalDifference > 0 ? '+' : ''}
                {totalDifference}
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        {items.length > 0 && (
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.7}
          >
            {submitting ? (
              <ActivityIndicator color={colors.light} />
            ) : (
              <Text style={styles.submitButtonText}>Hoàn thành kiểm kho</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Product Search Modal */}
      <ProductSearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
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
  infoCard: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  disabledInput: {
    backgroundColor: colors.lightGray,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  disabledInputText: {
    ...typography.body,
    color: colors.gray,
  },
  textArea: {
    ...typography.body,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    color: colors.dark,
    minHeight: 80,
  },
  productsSection: {
    marginBottom: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: dimensions.radius.md,
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.body,
    color: colors.light,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderStyle: 'dashed',
  },
  emptyText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  productCard: {
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  productName: {
    ...typography.subtitle,
    color: colors.dark,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  productSku: {
    ...typography.caption,
    color: colors.gray,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  stockItem: {
    flex: 1,
    alignItems: 'center',
  },
  stockLabel: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  stockValue: {
    ...typography.subtitle,
    color: colors.dark,
    fontWeight: '600',
  },
  differenceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  actualStockInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stockButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stockButtonText: {
    ...typography.subtitle,
    fontSize: 18,
    color: colors.primary,
  },
  stockTextInput: {
    ...typography.subtitle,
    color: colors.dark,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 40,
    paddingHorizontal: spacing.xs,
  },
  noteSection: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: spacing.sm,
  },
  noteLabel: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  noteInput: {
    ...typography.body,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
    color: colors.dark,
  },
  summarySection: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.subtitle,
    color: colors.light,
    fontWeight: '600',
  },
});

export default CreateStockCheckScreen;
