/**
 * Inventory History Screen
 * Displays transaction history with filtering options
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Text from '@/shared/components/base/Text';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  FilterIcon,
  Calendar03Icon,
} from '@hugeicons/core-free-icons';
import { inventoryService } from '../services';
import type { InventoryTransaction } from '../types';
import { format } from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TransactionTypeFilter = 'ALL' | 'IMPORT' | 'EXPORT' | 'ADJUSTMENT' | 'SALE' | 'RETURN' | 'RECONCILE';

const InventoryHistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('inventory');
  const navigation = useNavigation<NavigationProp>();

  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<TransactionTypeFilter>('ALL');
  const [selectedTransaction, setSelectedTransaction] = useState<InventoryTransaction | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const loadInventoryHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryHistory();
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error loading inventory history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInventoryHistory();
    }, [loadInventoryHistory])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInventoryHistory();
  }, [loadInventoryHistory]);

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'ALL') {
      return transactions;
    }
    return transactions.filter((t) => t.transactionType === selectedFilter);
  }, [transactions, selectedFilter]);

  const getTransactionTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      IMPORT: 'Nhập kho',
      EXPORT: 'Xuất kho',
      ADJUSTMENT: 'Điều chỉnh',
      SALE: 'Bán hàng',
      RETURN: 'Trả hàng',
      RECONCILE: 'Kiểm kho',
    };
    return typeMap[type] || type;
  };

  const getTransactionTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      IMPORT: '#4CAF50',
      EXPORT: '#F44336',
      ADJUSTMENT: '#FF9800',
      SALE: '#2196F3',
      RETURN: '#9C27B0',
      RECONCILE: '#607D8B',
    };
    return colorMap[type] || colors.gray;
  };

  const handleViewDetail = (transaction: InventoryTransaction) => {
    setSelectedTransaction(transaction);
    setDetailModalVisible(true);
  };

  const renderTransactionItem = ({ item }: { item: InventoryTransaction }) => {
    const color = getTransactionTypeColor(item.transactionType);
    const isPositive = item.quantityChange > 0;

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => handleViewDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionHeader}>
          <View style={[styles.typeBadge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.typeText, { color }]}>
              {getTransactionTypeText(item.transactionType)}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
          </Text>
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {item.variationName || item.productName}
        </Text>

        <View style={styles.transactionFooter}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Thay đổi:</Text>
            <Text
              style={[
                styles.quantityValue,
                { color: isPositive ? '#4CAF50' : '#F44336' },
              ]}
            >
              {isPositive ? '+' : ''}
              {item.quantityChange}
            </Text>
          </View>
          <View style={styles.stockContainer}>
            <Text style={styles.stockLabel}>Tồn kho:</Text>
            <Text style={styles.stockValue}>{item.currentStock}</Text>
          </View>
        </View>

        {item.notes && (
          <Text style={styles.notesText} numberOfLines={1}>
            Ghi chú: {item.notes}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => {
    const filters: { value: TransactionTypeFilter; label: string }[] = [
      { value: 'ALL', label: 'Tất cả giao dịch' },
      { value: 'IMPORT', label: 'Nhập kho' },
      { value: 'EXPORT', label: 'Xuất kho' },
      { value: 'ADJUSTMENT', label: 'Điều chỉnh' },
      { value: 'SALE', label: 'Bán hàng' },
      { value: 'RETURN', label: 'Trả hàng' },
      { value: 'RECONCILE', label: 'Kiểm kho' },
    ];

    return (
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={styles.filterModal}>
            <Text style={styles.filterTitle}>Lọc theo loại giao dịch</Text>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterOption,
                  selectedFilter === filter.value && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setSelectedFilter(filter.value);
                  setFilterModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilter === filter.value && styles.filterOptionTextSelected,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderDetailModal = () => {
    if (!selectedTransaction) return null;

    const color = getTransactionTypeColor(selectedTransaction.transactionType);
    const isPositive = selectedTransaction.quantityChange > 0;

    return (
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Chi tiết giao dịch</Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailContent}>
              <View style={[styles.typeBadge, { backgroundColor: `${color}20`, alignSelf: 'flex-start' }]}>
                <Text style={[styles.typeText, { color }]}>
                  {getTransactionTypeText(selectedTransaction.transactionType)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sản phẩm:</Text>
                <Text style={styles.detailValue}>{selectedTransaction.variationName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Thời gian:</Text>
                <Text style={styles.detailValue}>
                  {format(new Date(selectedTransaction.createdAt), 'dd/MM/yyyy HH:mm')}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mã liên kết:</Text>
                <Text style={styles.detailValue}>{selectedTransaction.relatedEntityId}</Text>
              </View>

              {selectedTransaction.referenceNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mã tham chiếu:</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.referenceNumber}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Số lượng thay đổi:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    styles.quantityValueLarge,
                    { color: isPositive ? '#4CAF50' : '#F44336' },
                  ]}
                >
                  {isPositive ? '+' : ''}
                  {selectedTransaction.quantityChange}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tồn kho hiện tại:</Text>
                <Text style={[styles.detailValue, styles.stockValueLarge]}>
                  {selectedTransaction.currentStock}
                </Text>
              </View>

              {selectedTransaction.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ghi chú:</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.notes}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <ScreenHeader
        title={t('history.title', 'Lịch sử giao dịch kho')}
        showBack
        onBackPress={() => navigation.goBack()}
        actions={[
          {
            key: 'filter',
            icon: <HugeiconsIcon icon={FilterIcon} size={24} color={colors.primary} />,
            onPress: () => setFilterModalVisible(true),
            accessibilityLabel: 'Filter',
          },
        ]}
      />

      {/* Filter Info */}
      {selectedFilter !== 'ALL' && (
        <View style={styles.filterInfo}>
          <HugeiconsIcon icon={FilterIcon} size={16} color={colors.gray} />
          <Text style={styles.filterInfoText}>
            Đang lọc: {getTransactionTypeText(selectedFilter)}
          </Text>
          <TouchableOpacity onPress={() => setSelectedFilter('ALL')}>
            <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.transactionId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <HugeiconsIcon icon={Calendar03Icon} size={64} color={colors.lightGray} />
              <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
            </View>
          }
        />
      )}

      {renderFilterModal()}
      {renderDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  filterButton: {
    padding: spacing.xs,
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFF9E5',
    gap: spacing.xs,
  },
  filterInfoText: {
    ...typography.body,
    color: colors.dark,
    flex: 1,
  },
  clearFilterText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.sm,
  },
  typeText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  dateText: {
    ...typography.caption,
    color: colors.gray,
  },
  productName: {
    ...typography.subtitle,
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quantityLabel: {
    ...typography.caption,
    color: colors.gray,
  },
  quantityValue: {
    ...typography.subtitle,
    fontWeight: '700',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stockLabel: {
    ...typography.caption,
    color: colors.gray,
  },
  stockValue: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.dark,
  },
  notesText: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 3,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 400,
  },
  filterTitle: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: spacing.md,
  },
  filterOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: dimensions.radius.md,
    marginBottom: spacing.xs,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    ...typography.body,
    color: colors.dark,
  },
  filterOptionTextSelected: {
    color: colors.light,
    fontWeight: '600',
  },
  detailModal: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  detailTitle: {
    ...typography.title,
    color: colors.dark,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.gray,
  },
  detailContent: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.body,
    color: colors.gray,
    flex: 1,
  },
  detailValue: {
    ...typography.body,
    color: colors.dark,
    flex: 2,
    textAlign: 'right',
  },
  quantityValueLarge: {
    ...typography.subtitle,
    fontSize: 18,
    fontWeight: '700',
  },
  stockValueLarge: {
    ...typography.subtitle,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default InventoryHistoryScreen;
