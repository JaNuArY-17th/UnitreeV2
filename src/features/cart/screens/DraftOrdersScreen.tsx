import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@/shared/components/base';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { Trash, Edit, Clock } from '@/shared/assets/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem } from '../types';
import type { RootStackParamList } from '@/navigation';
import { formatVND } from '@/shared/utils/format';

interface DraftOrder {
  id: string;
  items: CartItem[];
  total: number;
  discount: number;
  createdAt: string;
  storeId: string;
}

const DraftOrdersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('cart');
  const [draftOrders, setDraftOrders] = useState<DraftOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Set status bar
  useStatusBarEffect('light', 'dark-content', false);

  useEffect(() => {
    loadDraftOrders();
  }, []);

  const loadDraftOrders = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem('draft_orders');
      if (stored) {
        let orders: DraftOrder[] = JSON.parse(stored);

        // Get current date in YYYY-MM-DD format
        const currentDate = new Date().toISOString().split('T')[0];

        // Filter out orders from previous days
        const validOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate === currentDate;
        });

        // If some orders were removed, save the cleaned list
        if (validOrders.length !== orders.length) {
          console.log(`[DraftOrdersScreen] Removed ${orders.length - validOrders.length} expired draft orders`);
          await AsyncStorage.setItem('draft_orders', JSON.stringify(validOrders));
        }

        setDraftOrders(validOrders);
      }
    } catch (error) {
      console.error('Error loading draft orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraftOrders = async (orders: DraftOrder[]) => {
    try {
      await AsyncStorage.setItem('draft_orders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving draft orders:', error);
    }
  };

  const handleEditOrder = (order: DraftOrder) => {
    // Navigate to Cart screen with the draft order data
    navigation.replace('Cart', {
      draftOrder: order,
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    Alert.alert(
      t('draftOrders.deleteDraftOrderTitle', 'Xóa đơn hàng nháp'),
      t('draftOrders.deleteDraftOrderMessage', 'Bạn có chắc muốn xóa đơn hàng nháp này?'),
      [
        {
          text: t('cancel', 'Hủy'),
          style: 'cancel',
        },
        {
          text: t('draftOrders.delete', 'Xóa'),
          style: 'destructive',
          onPress: async () => {
            const updatedOrders = draftOrders.filter(order => order.id !== orderId);
            setDraftOrders(updatedOrders);
            await saveDraftOrders(updatedOrders);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart} - ${timePart}`;
  };

  // const formatVND = (amount: number) => {
  //   return new Intl.NumberFormat('vi-VN', {
  //     style: 'currency',
  //     currency: 'VND',
  //   }).format(amount);
  // };

  const renderDraftOrder = (order: DraftOrder) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.itemCount}>
            {t('draftOrders.itemCount', '{{count}} sản phẩm', { count: order.items.length })}
          </Text>
        </View>
        <View style={styles.orderActions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleEditOrder(order)}
          >
            <Edit width={20} height={20} color={colors.primary} />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleDeleteOrder(order.id)}
          >
            <Trash width={20} height={20} color={colors.warning} />
          </Pressable>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.slice(0, 3).map((item, index) => (
          <Text key={item.id} style={styles.itemText} numberOfLines={1}>
            {item.name} x{item.quantity}
          </Text>
        ))}
        {order.items.length > 3 && (
          <Text style={styles.moreItems}>
            {t('draftOrders.moreItems', '+{{count}} sản phẩm khác', { count: order.items.length - 3 })}
          </Text>
        )}
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.dashedLine} />
      </View>

      <View style={styles.orderFooter}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Clock width={16} height={16} color={colors.text.secondary} />
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <Text style={styles.totalText}>
          {t('summary.total', 'Tổng tiền')}: {formatVND(order.total - order.discount)}
        </Text>
      </View>
    </View>
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('draftOrders.title', 'Đơn hàng nháp')} showBack={true} onBackPress={handleGoBack} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('draftOrders.loading', 'Đang tải...')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('draftOrders.title', 'Đơn hàng nháp')} showBack={true} onBackPress={handleGoBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {draftOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('draftOrders.noDraftOrders', 'Không có đơn hàng nháp')}</Text>
            <Text style={styles.emptySubtext}>
              {t('draftOrders.noDraftOrdersDesc', 'Các đơn hàng chưa thanh toán sẽ xuất hiện ở đây')}
            </Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {draftOrders.map(renderDraftOrder)}
          </View>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    opacity: 0.7,
    textAlign: 'center',
  },
  ordersContainer: {
    gap: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
  },
  orderDate: {
    ...typography.bodySmall,
    fontSize: 13,
    color: colors.text.secondary,
  },
  itemCount: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: 4,
  },
  orderActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderItems: {
  },
  itemText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  moreItems: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    color: colors.primary,
    fontWeight: 'bold',
  },
  dividerContainer: {
    height: 1,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
});

export default DraftOrdersScreen;