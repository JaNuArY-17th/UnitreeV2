import React, { useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing } from '@/shared/themes';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';

// Components
import { ScreenHeader, VerificationRequiredOverlay, StoreVerificationRequiredOverlay } from '@/shared/components';
import { Text, Button } from '@/shared/components/base';
import { BackgroundPattern } from '@/shared/components/base';
import { MenuSection } from '../components/MenuSection';

// Icons
import { Profile, Address, CheckCircle, Close, Calendar, SmsTracking, CallCalling, CreditCard, Percent, Shield, FileText } from '@/shared/assets/icons';
import { ScrollView } from 'react-native-gesture-handler';

// Hooks and Services
import { useStoreData, STORE_QUERY_KEYS, setPersistedHasStore } from '@/features/authentication/hooks/useStoreData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/features/authentication/services/storeService';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

interface StoreDetailScreenProps {
  // Navigation props would be passed here
}

interface Owner {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  citizenNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface StoreData {
  name: string;
  addressProvince: string;
  addressWard: string;
  addressDetail: string;
  postpaid: {
    commissionPercent: number;
  };
  owner: Owner;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const StoreDetailScreen: React.FC<StoreDetailScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('profile');
  const queryClient = useQueryClient();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useStatusBarEffect('transparent', 'dark-content', true);

  // Fetch store data from API
  const { storeData, isLoading, error, refetch } = useStoreData();

  // Refresh store data whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 [StoreDetailScreen] Screen focused - refreshing store data...');

      // Invalidate React Query cache for store data
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEYS.all });

      // Refetch store data from API
      refetch().then(async (result) => {
        // Update AsyncStorage hasStore flag based on the fresh API response
        if (result.data) {
          const hasStore = result.data.success === true;
          await setPersistedHasStore(hasStore);
          console.log('✅ [StoreDetailScreen] Store data refreshed - hasStore:', hasStore);
          
          // DEBUG: Log full store data structure
          console.log('🔍 [StoreDetailScreen] Full store data:', JSON.stringify(result.data?.data, null, 2));
        }
      }).catch((err) => {
        console.error('❌ [StoreDetailScreen] Failed to refresh store data:', err);
      });
    }, [queryClient, refetch])
  );

  // Mutations for activating/deactivating store
  const activateMutation = useMutation({
    mutationFn: storeService.activateStore,
    onSuccess: async () => {
      console.log('✅ [StoreDetailScreen] Store activated successfully');
      // Invalidate and refetch store data to get updated status
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEYS.all });
      await refetch();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: storeService.deactivateStore,
    onSuccess: async () => {
      console.log('✅ [StoreDetailScreen] Store deactivated successfully');
      // Invalidate and refetch store data to get updated status
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEYS.all });
      await refetch();
    },
  });

  const toggleStoreStatus = () => {
    if (!storeData) return;

    if (storeData.isActive) {
      deactivateMutation.mutate();
    } else {
      activateMutation.mutate();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return colors.primary;
      case 'PENDING':
        return colors.warning;
      case 'REJECTED':
        return colors.danger;
      default:
        return colors.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return t('storeDetail.status.approved');
      case 'PENDING':
        return t('storeDetail.status.pending');
      case 'REJECTED':
        return t('storeDetail.status.rejected');
      default:
        return status;
    }
  };

  const formatTitle = (value: string | number | undefined | null) => {
    if (value === null || value === undefined || value === '') {
      return '--';
    }
    return String(value);
  };

  // Format data for display
  const formatPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return '--';
    // Format as +84 XXX XXX XXX (show full number)
    const cleanPhone = phone.replace(/^84/, '');
    if (cleanPhone.length >= 9) {
      return `+84 ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
    }
    return phone;
  };

  const storeInfoItems = storeData ? [
    {
      id: 'storeName',
      title: formatTitle(storeData.name),
      subtitle: t('storeDetail.fields.storeName'),
      icon: <Profile width={24} height={24} color="#00492B" />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'address',
      title: formatTitle(`${storeData.addressDetail}, ${storeData.addressWard}, ${storeData.addressProvince}`),
      subtitle: t('storeDetail.fields.address'),
      icon: <Address width={24} height={24} color="#00492B" />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'activeStatus',
      title: storeData.isActive ? t('storeDetail.status.active') : t('storeDetail.status.inactive'),
      subtitle: t('storeDetail.fields.activeStatus'),
      icon: storeData.isActive ? (
        <CheckCircle width={20} height={20} color={colors.primary} />
      ) : (
        <Close width={24} height={24} color={colors.danger} />
      ),
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'approvalStatus',
      title: getStatusText(storeData.status),
      subtitle: t('storeDetail.fields.approvalStatus'),
      icon: <Shield width={24} height={24} color={getStatusColor(storeData.status)} />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'commissionPercent',
      title: formatTitle(storeData.postpaid?.commissionPercent ? `${storeData.postpaid.commissionPercent}%` : null),
      subtitle: t('storeDetail.fields.commissionPercent'),
      icon: <Percent width={24} height={24} color="#00492B" />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'createdAt',
      title: formatTitle(storeData.createdAt ? formatDate(storeData.createdAt) : null),
      subtitle: t('storeDetail.fields.createdAt'),
      icon: <Calendar width={24} height={24} color="#00492B" />,
      onPress: () => { },
      showArrow: false,
    },
  ] : [];

  const ownerInfoItems = storeData ? [
    {
      id: 'ownerName',
      title: formatTitle(storeData.owner.name),
      subtitle: t('storeDetail.fields.ownerName'),
      icon: <Profile width={24} height={24} color="#00492B" />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'ownerEmail',
      title: formatTitle(storeData.owner.email),
      subtitle: t('storeDetail.fields.ownerEmail'),
      icon: <SmsTracking width={24} height={24} color="#00492B" />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'ownerPhone',
      title: formatPhoneNumber(storeData.owner.phoneNumber),
      subtitle: t('storeDetail.fields.ownerPhone'),
      icon: <CallCalling width={24} height={24} color="#00492B" />,
      onPress: () => { },
      showArrow: false,
    },
  ] : [];

  return (
    <VerificationRequiredOverlay>
      <StoreVerificationRequiredOverlay>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" />
          <BackgroundPattern />

          <ScreenHeader
            title={t('storeDetail.title')}
            showBack
          />

          <ScrollView style={styles.content}>
            {isLoading ? (
              <View style={styles.centerContent}>
                <Text style={styles.loadingText}>{t('storeDetail.loading')}</Text>
              </View>
            ) : error ? (
              <View style={styles.centerContent}>
                <Text style={styles.errorText}>{t('storeDetail.error')}</Text>
                <Button
                  label={t('storeDetail.retry')}
                  variant="primary"
                  size="md"
                  onPress={() => refetch()}
                  style={styles.retryButton}
                />
              </View>
            ) : (
              <>
                <Text style={styles.description}>
                  {t('storeDetail.description')}
                </Text>

                {/* Store Information Section */}
                <MenuSection title={t('storeDetail.storeInfo')} items={storeInfoItems} />

                {/* Owner Information Section */}
                <MenuSection title={t('storeDetail.ownerInfo')} items={ownerInfoItems} />

                {/* Upload Business License Button */}
                <View style={styles.buttonContainer}>
                  <Button
                    label={t('storeDetail.uploadBusinessLicense', 'Tải lên giấy phép kinh doanh')}
                    variant="outline"
                    size="lg"
                    fullWidth
                    onPress={() => {
                      console.log('[StoreDetail] Upload button pressed, storeId:', storeData?.id);
                      if (storeData?.id) {
                        console.log('[StoreDetail] Navigating to UploadBusinessLicense with storeId:', storeData.id);
                        navigation.navigate('UploadBusinessLicense', {
                          storeId: storeData.id
                        });
                      } else {
                        console.error('[StoreDetail] No storeId available, cannot navigate');
                      }
                    }}
                    leftIcon={<FileText width={20} height={20} color={colors.primary} />}
                  />
                </View>

                {/* Toggle Store Status Button */}
                {storeData && (
                  <View style={[styles.buttonContainer, { marginBottom: spacing.xl, }]}>
                    <Button
                      label={storeData.isActive ? t('storeDetail.deactivateStore') : t('storeDetail.activateStore')}
                      variant={storeData.isActive ? 'danger' : 'primary'}
                      size="lg"
                      fullWidth
                      onPress={toggleStoreStatus}
                      loading={activateMutation.isPending || deactivateMutation.isPending}
                      disabled={activateMutation.isPending || deactivateMutation.isPending}
                    />
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </StoreVerificationRequiredOverlay>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#727272',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    marginTop: spacing.md,
  },
  buttonContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});

export default StoreDetailScreen;
