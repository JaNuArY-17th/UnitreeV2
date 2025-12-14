/**
 * Stock Check Screen
 * Manages stock check papers (phiếu kiểm kho)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
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
  Add01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  FileViewIcon,
} from '@hugeicons/core-free-icons';
import { inventoryService } from '../services';
import type { InventoryPaper } from '../types';
import { format } from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StockCheckScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('inventory');
  const navigation = useNavigation<NavigationProp>();

  const [stockChecks, setStockChecks] = useState<InventoryPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStockChecks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryPapers();
      if (response.success && response.data) {
        const paperList = Array.isArray(response.data)
          ? response.data
          : response.data.content || [];
        setStockChecks(paperList);
      }
    } catch (error) {
      console.error('Error loading stock checks:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phiếu kiểm kho');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStockChecks();
    }, [loadStockChecks])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStockChecks();
  }, [loadStockChecks]);

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

  const handleViewDetail = async (paper: InventoryPaper) => {
    navigation.navigate('StockCheckDetail', { paperId: paper.id });
  };

  const handleConfirm = async (paper: InventoryPaper) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn xác nhận phiếu kiểm kho "${paper.code || paper.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              const response = await inventoryService.confirmStockCheck(paper.id);
              if (response.success) {
                Alert.alert('Thành công', 'Đã xác nhận phiếu kiểm kho');
                loadStockChecks();
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể xác nhận phiếu kiểm kho');
              }
            } catch (error) {
              console.error('Error confirming stock check:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi xác nhận phiếu kiểm kho');
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (paper: InventoryPaper) => {
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
              const response = await inventoryService.cancelStockCheck(paper.id);
              if (response.success) {
                Alert.alert('Thành công', 'Đã hủy phiếu kiểm kho');
                loadStockChecks();
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể hủy phiếu kiểm kho');
              }
            } catch (error) {
              console.error('Error canceling stock check:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi hủy phiếu kiểm kho');
            }
          },
        },
      ]
    );
  };

  const renderStockCheckItem = ({ item }: { item: InventoryPaper }) => {
    const statusColor = getStatusColor(item.status);
    const isPending = item.status === 'PENDING';

    return (
      <View style={styles.stockCheckCard}>
        <View style={styles.cardHeader}>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{item.code || item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
          </Text>
        </View>

        {item.notes && (
          <Text style={styles.notesText} numberOfLines={2}>
            Ghi chú: {item.notes}
          </Text>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Số sản phẩm:</Text>
            <Text style={styles.statValue}>{item.items?.length || 0}</Text>
          </View>
          {item.differenceCount !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Chênh lệch:</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      item.differenceCount > 0
                        ? '#F44336'
                        : item.differenceCount < 0
                        ? '#4CAF50'
                        : colors.gray,
                  },
                ]}
              >
                {item.differenceCount > 0 ? '+' : ''}
                {item.differenceCount}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewDetail(item)}
            activeOpacity={0.7}
          >
            <HugeiconsIcon icon={FileViewIcon} size={18} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Chi tiết
            </Text>
          </TouchableOpacity>

          {isPending && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => handleConfirm(item)}
                activeOpacity={0.7}
              >
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} color="#4CAF50" />
                <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>
                  Xác nhận
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancel(item)}
                activeOpacity={0.7}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} color="#F44336" />
                <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Hủy</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <ScreenHeader
        title={t('stockCheck.title', 'Kiểm kho')}
        showBack
        onBackPress={() => navigation.goBack()}
        actions={[
          {
            key: 'add',
            icon: <HugeiconsIcon icon={Add01Icon} size={24} color={colors.primary} />,
            onPress: () => navigation.navigate('CreateStockCheck'),
            accessibilityLabel: 'Add stock check',
          },
        ]}
      />

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={stockChecks}
          renderItem={renderStockCheckItem}
          keyExtractor={(item) => item.id}
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
              <HugeiconsIcon
                icon={FileViewIcon}
                size={64}
                color={colors.lightGray}
              />
              <Text style={styles.emptyText}>Chưa có phiếu kiểm kho nào</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateStockCheck')}
                activeOpacity={0.7}
              >
                <HugeiconsIcon icon={Add01Icon} size={20} color={colors.light} />
                <Text style={styles.createButtonText}>Tạo phiếu kiểm kho</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  addButton: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  stockCheckCard: {
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
  cardHeader: {
    marginBottom: spacing.sm,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  codeText: {
    ...typography.subtitle,
    color: colors.dark,
    flex: 1,
    fontWeight: '600',
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
  dateText: {
    ...typography.caption,
    color: colors.gray,
  },
  notesText: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray,
  },
  statValue: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.dark,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: dimensions.radius.md,
    gap: spacing.xs,
    flex: 1,
    borderWidth: 1,
  },
  viewButton: {
    backgroundColor: '#E3F2FD',
    borderColor: colors.primary,
  },
  confirmButton: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  actionButtonText: {
    ...typography.caption,
    fontWeight: '600',
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
    marginBottom: spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: dimensions.radius.lg,
    gap: spacing.xs,
  },
  createButtonText: {
    ...typography.subtitle,
    color: colors.light,
    fontWeight: '600',
  },
});

export default StockCheckScreen;
