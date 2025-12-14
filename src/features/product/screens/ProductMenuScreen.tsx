import React, { useState, useRef, useEffect } from 'react';
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
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Text from '@/shared/components/base/Text';
import { VerificationRequiredOverlay, StoreVerificationRequiredOverlay, BackgroundPattern } from '@/shared/components';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
  Package01Icon,
  UserGroupIcon,
  Location01Icon,
  Folder01Icon,
} from '@hugeicons/core-free-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

interface MenuItemData {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  backgroundColor: string;
  onPress: () => void;
}

export const ProductMenuScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation('product');
  const scaleValues = useRef<{ [key: string]: Animated.Value }>({}).current;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useStatusBarEffect('transparent', 'dark-content', true);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const menuItems: MenuItemData[] = [
    {
      id: 'products',
      title: t('menu.productManagement', 'Quản Lý Hàng Hóa'),
      description: t('menu.productManagementDesc', 'Quản lý sản phẩm, biến thể và phiên bản kho'),
      icon: Package01Icon,
      iconColor: '#FF8A6D',
      backgroundColor: '#FFF0ED',
      onPress: () => navigation.navigate('ProductManagement'),
    },
    {
      id: 'suppliers',
      title: t('menu.supplierManagement', 'Nhà Cung Cấp'),
      description: t('menu.supplierManagementDesc', 'Quản lý thông tin nhà cung cấp và liên hệ'),
      icon: UserGroupIcon,
      iconColor: '#E8A5FF',
      backgroundColor: '#FAF0FF',
      onPress: () => navigation.navigate('SupplierManagement'),
    },
    {
      id: 'locations',
      title: t('menu.locationManagement', 'Vị Trí Kho'),
      description: t('menu.locationManagementDesc', 'Quản lý kho, vị trí lưu trữ hàng hóa'),
      icon: Location01Icon,
      iconColor: '#4CAF50',
      backgroundColor: '#E8F5E8',
      onPress: () => navigation.navigate('LocationManagement'),
    },
    {
      id: 'categories',
      title: t('menu.categoryManagement', 'Danh Mục'),
      description: t('menu.categoryManagementDesc', 'Quản lý danh mục sản phẩm và phân loại'),
      icon: Folder01Icon,
      iconColor: '#FFB800',
      backgroundColor: '#FFF9E5',
      onPress: () => navigation.navigate('CategoryManagement'),
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
    <VerificationRequiredOverlay>
      <StoreVerificationRequiredOverlay>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" />

          {/* <BackgroundPattern /> */}

          <ScreenHeader
            title={t('menu.title')}
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
            {/* Menu Grid */}
            <View style={styles.menuGrid}>
              {menuItems.map(renderMenuItem)}
            </View>
          </ScrollView>
        </View>
      </StoreVerificationRequiredOverlay>
    </VerificationRequiredOverlay>
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
