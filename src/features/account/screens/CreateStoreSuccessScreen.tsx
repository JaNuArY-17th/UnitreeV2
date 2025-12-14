import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useQueryClient } from '@tanstack/react-query';
import { STORE_QUERY_KEYS } from '@/features/authentication/hooks/useStoreData';
import Text from '@/shared/components/base/Text';
import { Button, BackgroundPattern } from '@/shared/components/base';
import { SuccessIllustration, SuccessPageMessage, TransactionStatsCard } from '@/shared/components';
import { Shop, Profile, Phone, Calendar } from '@/shared/assets/icons';
import type { RootStackParamList } from '@/navigation/types';
import type { StoreMyDataResponse } from '@/features/authentication/types/store';

interface RouteParams {
  storeData?: StoreMyDataResponse['data'];
}

type CreateStoreSuccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CreateStoreSuccessScreenRouteProp = RouteProp<any, any>;

export const CreateStoreSuccessScreen: React.FC = () => {
  const { t } = useTranslation('account');
  const navigation = useNavigation<CreateStoreSuccessScreenNavigationProp>();
  const route = useRoute<CreateStoreSuccessScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const params = route.params as RouteParams;
  const { storeData } = params;

  // Prevent hardware back button from going back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Do nothing, prevent going back
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return t('store.status.approved') || 'Đã phê duyệt';
      case 'PENDING':
        return t('store.status.pending') || 'Chờ phê duyệt';
      case 'LOCKED':
        return t('store.status.locked') || 'Đã khóa';
      default:
        return status;
    }
  };

  // Success page data
  const successData = [
    {
      label: t('store.storeName') || 'Tên cửa hàng',
      value: storeData?.name || '',
      icon: <Shop width={16} height={16} color={colors.primary} />
    },
    {
      label: t('store.address') || 'Địa chỉ',
      value: `${storeData?.addressDetail || ''}, ${storeData?.addressWard || ''}, ${storeData?.addressProvince || ''}`
    },
    {
      label: t('store.ownerName') || 'Tên chủ sở hữu',
      value: storeData?.owner?.name || '--',
      icon: <Profile width={16} height={16} color={colors.primary} />
    },
    {
      label: t('store.ownerPhone') || 'Số điện thoại',
      value: storeData?.owner?.phoneNumber || '--',
      icon: <Phone width={16} height={16} color={colors.primary} />
    },
    {
      label: t('store.status.label') || 'Trạng thái',
      value: getStatusText(storeData?.status ?? ''),
      isHighlighted: storeData?.status === 'APPROVED'
    },
    {
      label: t('store.createdAt') || 'Ngày tạo',
      value: formatDate(storeData?.createdAt ?? ''),
      icon: <Calendar width={16} height={16} color={colors.primary} />,
      isTotal: true
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <SuccessIllustration style={styles.illustration} />
        <SuccessPageMessage
          title={t('store.createSuccessTitle') || 'Tạo cửa hàng thành công!'}
          subtitle={t('store.createSuccessSubtitle') || 'Cửa hàng của bạn đã được tạo thành công. Vui lòng chờ phê duyệt.'}
        />
        <TransactionStatsCard stats={successData} style={styles.statsCard} />
        <View style={styles.buttonContainer}>
          <Button
            style={styles.primaryButton}
            label={t('store.backToHome') || 'Về trang chủ'}
            onPress={async () => {
              // Invalidate store queries to refetch fresh data
              await queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEYS.all });
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }}
            size="lg"
          />
          <Button
            style={styles.secondaryButton}
            label={t('store.viewStore') || 'Xem cửa hàng'}
            variant="outline"
            onPress={() => {
              navigation.navigate('AccountManagement' as any);
            }}
            size="lg"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg
  },
  illustration: {
    alignSelf: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl
  },
  statsCard: {
    marginVertical: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.lg
  },
  primaryButton: {
    flex: 1
  },
  secondaryButton: {
    flex: 1
  },
});

export default CreateStoreSuccessScreen;