import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { colors, FONT_WEIGHTS, getFontFamily, dimensions, typography } from '@/shared/themes';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import Button from '@/shared/components/base/Button';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shop, Lock, Clock } from '@/shared/assets/icons';
import { useStatusBarEffect } from '../utils/StatusBarManager';
import type { statusType } from '@/features/authentication/types/store';

interface StoreVerificationRequiredOverlayProps {
  children?: React.ReactNode;
}

const StoreVerificationRequiredOverlay: React.FC<StoreVerificationRequiredOverlayProps> = ({ children }) => {
  const { t } = useTranslation('store');
  const navigation = useNavigation();
  const { storeData, hasStore } = useStoreData();
  const insets = useSafeAreaInsets();

  const storeStatus: statusType | undefined = storeData?.status;

  // IMPORTANT: Call all hooks before any conditional returns
  useStatusBarEffect(colors.light, 'dark-content', true);

  // Render children only if store is APPROVED
  if (storeStatus === 'APPROVED') {
    return <>{children}</>;
  }

  // If no store or store data is null (404 from API), show "Create Store" overlay
  const needsStoreCreation = !hasStore || !storeData;

  // Overlay as a full screen, with status bar and header (back only)
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  let title = '';
  let message = '';
  let buttonLabel = '';
  let buttonAction: (() => void) | undefined = undefined;
  let IconComponent: React.ReactNode = null;
  let showButton = true;

  if (needsStoreCreation) {
    // User doesn't have a store - show create store UI
    title = t('verification.no_store', 'Tạo cửa hàng để bắt đầu');
    message = t('verification.no_store_description', 'Bạn cần tạo cửa hàng để có thể sử dụng tính năng này và quản lý đơn hàng.');
    buttonLabel = t('verification.create_store', 'Tạo cửa hàng');
    buttonAction = () => navigation.navigate('CreateStoreStart' as never);
    IconComponent = <Shop width={52} height={52} color={colors.primary} />;
  } else if (storeStatus === 'PENDING') {
    title = t('verification.store_pending', 'Cửa hàng đang chờ duyệt');
    message = t('verification.store_pending_description', 'Cửa hàng của bạn đang được xem xét. Vui lòng chờ trong ít phút để chúng tôi xác minh thông tin.');
    buttonLabel = t('verification.view_store_details', 'Xem thông tin cửa hàng');
    buttonAction = () => navigation.navigate('StoreDetail' as never);
    IconComponent = <Clock width={52} height={52} color={colors.warning} />;
  } else if (storeStatus === 'LOCKED') {
    title = t('verification.store_locked', 'Cửa hàng đã bị khóa');
    message = t('verification.store_locked_description', 'Cửa hàng của bạn đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.');
    buttonLabel = t('verification.contact_support', 'Liên hệ hỗ trợ');
    buttonAction = () => navigation.navigate('SupportCenter' as never);
    IconComponent = <Lock width={52} height={52} color={colors.danger} />;
  } else {
    // Fallback for unknown status - shouldn't happen
    title = t('verification.store_unavailable', 'Cửa hàng không khả dụng');
    message = t('verification.store_unavailable_description', 'Không thể truy cập cửa hàng. Vui lòng thử lại sau.');
    showButton = false;
    IconComponent = <Shop width={52} height={52} color={colors.gray} />;
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} />
      <ScreenHeader
        title=""
        showBack={true}
        onBackPress={handleGoBack}
        containerStyle={styles.header}
      />
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          {IconComponent}
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {showButton && buttonAction && (
          <Button
            style={styles.button}
            label={buttonLabel}
            onPress={buttonAction}
            testID="store-action"
            size="lg"
          />
        )}
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: colors.light,
    elevation: 0,
    borderBottomWidth: 0,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 193, 7, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg,
  },
  title: {
    ...typography.h1,
    fontSize: 24,
    color: colors.text.primary,
    marginBottom: dimensions.spacing.sm,
    textAlign: 'center',
    paddingVertical: dimensions.spacing.lg,
  },
  message: {
    ...typography.subtitle,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: dimensions.spacing.xl,
    lineHeight: 22,
    paddingHorizontal: dimensions.spacing.md,
  },
  button: {
    width: '100%',
    marginBottom: dimensions.spacing.md,
    marginTop: dimensions.spacing.lg,
  },
});

export default StoreVerificationRequiredOverlay;
