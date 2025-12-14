/**
 * Inventory Management Screen
 * Main screen for inventory management with options to view history and stock check
 */

import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Pressable,
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
  TimeScheduleIcon,
  PackageSearchIcon,
  ArrowRight01Icon,
  DeliveryBox01Icon,
  DeliveryReturn01Icon,
} from '@hugeicons/core-free-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItemData {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  backgroundColor: string;
  onPress: () => void;
}

const InventoryManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('inventory');
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const scaleValues = useRef<{ [key: string]: Animated.Value }>({}).current;

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const menuItems: MenuItemData[] = [
    {
      id: 'import',
      title: t('menu.import', 'Nhập kho'),
      description: t('menu.importDesc', 'Tạo phiếu nhập hàng hóa vào kho'),
      icon: DeliveryBox01Icon,
      iconColor: '#4CAF50',
      backgroundColor: '#E8F5E9',
      onPress: () => navigation.navigate('CreateImport' as any),
    },
    {
      id: 'export',
      title: t('menu.export', 'Xuất kho'),
      description: t('menu.exportDesc', 'Tạo phiếu xuất hàng hóa khỏi kho'),
      icon: DeliveryReturn01Icon,
      iconColor: '#F44336',
      backgroundColor: '#FFEBEE',
      onPress: () => navigation.navigate('CreateExport' as any),
    },
    {
      id: 'history',
      title: t('menu.inventoryHistory', 'Lịch sử giao dịch kho'),
      description: t('menu.inventoryHistoryDesc', 'Xem lịch sử nhập, xuất và điều chỉnh kho'),
      icon: TimeScheduleIcon,
      iconColor: '#2196F3',
      backgroundColor: '#E3F2FD',
      onPress: () => navigation.navigate('InventoryHistory' as any),
    },
    {
      id: 'stockCheck',
      title: t('menu.stockCheck', 'Kiểm kho'),
      description: t('menu.stockCheckDesc', 'Tạo và quản lý phiếu kiểm kho'),
      icon: PackageSearchIcon,
      iconColor: '#FF9800',
      backgroundColor: '#FFF3E0',
      onPress: () => navigation.navigate('StockCheck' as any),
    },
  ];

  // Initialize scale values for each menu item
  menuItems.forEach(item => {
    if (!scaleValues[item.id]) {
      scaleValues[item.id] = new Animated.Value(1);
    }
  });

  const handlePressIn = (id: string) => {
    Animated.spring(scaleValues[id], {
      toValue: 0.96,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (id: string) => {
    Animated.spring(scaleValues[id], {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const renderMenuItem = (item: MenuItemData) => (
    <Pressable
      key={item.id}
      onPress={item.onPress}
      onPressIn={() => handlePressIn(item.id)}
      onPressOut={() => handlePressOut(item.id)}
    >
      <Animated.View
        style={[
          styles.menuCard,
          { backgroundColor: item.backgroundColor },
          { transform: [{ scale: scaleValues[item.id] }] },
        ]}
      >
        <View style={styles.iconWrapper}>
          <HugeiconsIcon icon={item.icon} size={32} color={item.iconColor} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardDescription} numberOfLines={1}>
            {item.description}
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={item.iconColor} />
        </View>
      </Animated.View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <ScreenHeader
        title={t('title', 'Quản lý kho')}
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
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.menuGrid}>
          {menuItems.map(renderMenuItem)}
        </View>
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
    paddingBottom: spacing.xl,
  },
  menuGrid: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: dimensions.radius.lg,
    padding: spacing.md,
    paddingVertical: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.lightGray,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: dimensions.radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.subtitle,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.caption,
    fontSize: 13,
    color: colors.text.secondary,
  },
  arrowContainer: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});

export default InventoryManagementScreen;
