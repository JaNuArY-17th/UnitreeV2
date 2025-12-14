import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, dimensions, typography, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Mic01Icon,
  Invoice01Icon,
  PackageIcon,
  Clock01Icon,
  Store04Icon,
  Coupon01Icon,
} from '@hugeicons/core-free-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cards per row with spacing

interface QuickAccessItem {
  id: string;
  title: string;
  icon: any;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

interface QuickAccessCardProps {
  onVoiceInvoice?: () => void;
  onManageInvoice?: () => void;
  onManageProducts?: () => void;
  onSearchProducts?: () => void;
  onDraftOrders?: () => void;
  onInventoryManagement?: () => void;
  onVoucherManagement?: () => void;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  onVoiceInvoice,
  onManageInvoice,
  onManageProducts,
  onSearchProducts,
  onDraftOrders,
  onInventoryManagement,
  onVoucherManagement,
}) => {
  const { t } = useTranslation('home');
  const [draftOrdersCount, setDraftOrdersCount] = useState(0);

  // Use useFocusEffect to reload draft orders count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDraftOrdersCount();
    }, [])
  );

  const loadDraftOrdersCount = async () => {
    try {
      const stored = await AsyncStorage.getItem('draft_orders');
      if (stored) {
        let orders = JSON.parse(stored);

        // Get current date in YYYY-MM-DD format
        const currentDate = new Date().toISOString().split('T')[0];

        // Filter out orders from previous days
        const validOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate === currentDate;
        });

        setDraftOrdersCount(validOrders.length);
      }
    } catch (error) {
      console.error('Error loading draft orders count:', error);
    }
  };

  const accessItems: QuickAccessItem[] = [
    {
      id: 'voice-invoice',
      title: t('quickAccess.voiceInvoice'),
      icon: Mic01Icon,
      color: '#FFB800',
      backgroundColor: '#FFF9E5',
      onPress: onVoiceInvoice || (() => console.log('Voice Invoice pressed')),
    },
    {
      id: 'manage-invoice',
      title: t('quickAccess.manageInvoice'),
      icon: Invoice01Icon,
      color: '#E8A5FF',
      backgroundColor: '#FAF0FF',
      onPress: onManageInvoice || (() => console.log('Manage Invoice pressed')),
    },
    {
      id: 'manage-products',
      title: t('quickAccess.manageProducts'),
      icon: PackageIcon,
      color: '#FF8A6D',
      backgroundColor: '#FFF0ED',
      onPress: onManageProducts || (() => console.log('Manage Products pressed')),
    },
    {
      id: 'inventory-management',
      title: t('quickAccess.inventoryManagement', 'Quản lý kho'),
      icon: Store04Icon,
      color: '#2196F3',
      backgroundColor: '#E3F2FD',
      onPress: onInventoryManagement || (() => console.log('Inventory Management pressed')),
    },
    {
      id: 'draft-orders',
      title: t('quickAccess.draftOrders', 'Đơn hàng nháp'),
      icon: Clock01Icon,
      color: '#4CAF50',
      backgroundColor: '#E8F5E8',
      onPress: onDraftOrders || (() => console.log('Draft Orders pressed')),
    },
    {
      id: 'voucher-management',
      title: t('quickAccess.voucherManagement', 'Quản lý Voucher'),
      icon: Coupon01Icon,
      color: '#FF6B6B',
      backgroundColor: '#FFE5E5',
      onPress: onVoucherManagement || (() => console.log('Voucher Management pressed')),
    },
  ];

  const renderAccessItem = (item: QuickAccessItem) => {
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.accessItem, { backgroundColor: item.backgroundColor }]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.accessItemContent}>
          <View style={styles.iconContainer}>
            <HugeiconsIcon icon={item.icon} size={40} color={item.color} />
          </View>
          <Text style={[styles.accessItemTitle, { color: '#1A1A1A' }]}>
            {item.title}
          </Text>
        </View>
        {item.id === 'draft-orders' && draftOrdersCount > 0 && (
          <View style={[styles.sparkle, { backgroundColor: item.color }]}>
            <Text style={styles.sparkleText}>
              {draftOrdersCount.toString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {accessItems.map(renderAccessItem)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  accessItem: {
    width: '48.5%',
    borderRadius: dimensions.radius.lg,
    borderColor: colors.lightGray,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 110,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  accessItemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  accessItemTitle: {
    ...typography.subtitle,
    lineHeight: 22,
  },
  sparkle: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    opacity: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleText: {
    ...typography.caption,
    // opacity: 1,
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuickAccessCard;
