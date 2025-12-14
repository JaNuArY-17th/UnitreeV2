/**
 * Stock Check Detail Screen
 * Displays detailed information about a stock check paper
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Text from '@/shared/components/base/Text';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { inventoryService } from '../services';
import type { InventoryPaper, InventoryTransaction } from '../types';
import { format } from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type StockCheckDetailRouteProp = RouteProp<RootStackParamList, 'StockCheckDetail'>;

interface ProductDetail {
  code: string;
  name: string;
  currentStock: number;
  actualStock: number;
  difference: number;
  note: string;
}

const StockCheckDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('inventory');
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StockCheckDetailRouteProp>();
  const { paperId } = route.params;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paper, setPaper] = useState<InventoryPaper | null>(null);
  const [products, setProducts] = useState<ProductDetail[]>([]);

  const loadStockCheckDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getStockCheckDetails(paperId);

      if (response.success && response.data) {
        const { paper, transactions } = response.data;
        console.log('Stock check paper:', paper);
        console.log('Paper status:', paper.status);
        setPaper(paper);

        // Transform transactions to product details
        const productDetails: ProductDetail[] = transactions.map((transaction: InventoryTransaction) => ({
          code: transaction.productVariationId,
          name: transaction.variationName || transaction.productName || 'N/A',
          currentStock: transaction.currentStock || 0,
          actualStock: (transaction.currentStock || 0) - (transaction.quantityChange || 0),
          difference: transaction.quantityChange || 0,
          note: transaction.notes || '',
        }));

        setProducts(productDetails);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy chi tiết phiếu kiểm kho');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading stock check details:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết phiếu kiểm kho');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [paperId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadStockCheckDetails();
    }, [loadStockCheckDetails])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStockCheckDetails();
  }, [loadStockCheckDetails]);

  const handleConfirm = async () => {
    if (!paper) return;

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn xác nhận phiếu kiểm kho "${paper.code || paper.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await inventoryService.confirmStockCheck(paperId);
              if (response.success) {
                Alert.alert('Thành công', 'Đã xác nhận phiếu kiểm kho', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể xác nhận phiếu kiểm kho');
              }
            } catch (error) {
              console.error('Error confirming stock check:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi xác nhận phiếu kiểm kho');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    if (!paper) return;

    Alert.alert(
      'Xác nhận hủy',
      `Bạn có chắc chắn muốn hủy phiếu kiểm kho "${paper.code || paper.name}"?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy phiếu',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await inventoryService.cancelStockCheck(paperId);
              if (response.success) {
                Alert.alert('Thành công', 'Đã hủy phiếu kiểm kho', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể hủy phiếu kiểm kho');
              }
            } catch (error) {
              console.error('Error canceling stock check:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi hủy phiếu kiểm kho');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Đang tiến hành',
      complete: 'Hoàn thành',
      cancel: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: '#FF9800',
      complete: '#4CAF50',
      cancel: '#F44336',
    };
    return colorMap[status] || colors.gray;
  };

  const renderProductItem = (product: ProductDetail, index: number) => {
    const isPositive = product.difference > 0;
    const isNegative = product.difference < 0;

    return (
      <View key={`${product.code}-${index}`} style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productCode}>{product.code}</Text>
        </View>

        <View style={styles.productStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tồn kho:</Text>
            <Text style={styles.statValue}>{product.currentStock}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Thực tế:</Text>
            <Text style={styles.statValue}>{product.actualStock}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Chênh lệch:</Text>
            <Text
              style={[
                styles.statValue,
                styles.differenceValue,
                {
                  color: isPositive
                    ? '#F44336'
                    : isNegative
                    ? '#4CAF50'
                    : colors.gray,
                },
              ]}
            >
              {isPositive ? '+' : ''}
              {product.difference}
            </Text>
          </View>
        </View>

        {product.note && (
          <Text style={styles.productNote} numberOfLines={2}>
            Ghi chú: {product.note}
          </Text>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <ScreenHeader
          title={t('stockCheck.detailTitle', 'Chi tiết phiếu kiểm kho')}
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <ScreenHeader
        title={t('stockCheck.detailTitle', 'Chi tiết phiếu kiểm kho')}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {paper && (
          <>
            {/* Paper Information */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Thông tin phiếu kiểm kho</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã phiếu:</Text>
                <Text style={styles.infoValue}>{paper.code || paper.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày tạo:</Text>
                <Text style={styles.infoValue}>
                  {format(new Date(paper.createdAt), 'dd/MM/yyyy HH:mm')}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Người tạo:</Text>
                <Text style={styles.infoValue}>{paper.createdBy || paper.createdUser || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Trạng thái:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(paper.status)}20` },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(paper.status) }]}>
                    {getStatusText(paper.status)}
                  </Text>
                </View>
              </View>

              {paper.notes && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ghi chú:</Text>
                  <Text style={styles.infoValue}>{paper.notes}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số sản phẩm:</Text>
                <Text style={styles.infoValue}>{products.length}</Text>
              </View>
            </View>

            {/* Products List */}
            <View style={styles.productsSection}>
              <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
              {products.map((product, index) => renderProductItem(product, index))}
            </View>

            {/* Action Buttons */}
            {paper.status === 'PENDING' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={handleConfirm}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color={colors.light} />
                  <Text style={styles.confirmButtonText}>Xác nhận phiếu kiểm kho</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={20} color={colors.light} />
                  <Text style={styles.cancelButtonText}>Hủy phiếu kiểm kho</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  sectionTitle: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    ...typography.body,
    color: colors.gray,
    flex: 1,
  },
  infoValue: {
    ...typography.body,
    color: colors.dark,
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  productsSection: {
    marginBottom: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  productName: {
    ...typography.subtitle,
    color: colors.dark,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  productCode: {
    ...typography.caption,
    color: colors.gray,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.dark,
  },
  differenceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  productNote: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: dimensions.radius.lg,
    gap: spacing.sm,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    ...typography.subtitle,
    color: colors.light,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    ...typography.subtitle,
    color: colors.light,
    fontWeight: '600',
  },
});

export default StockCheckDetailScreen;
