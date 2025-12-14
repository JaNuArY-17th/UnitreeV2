import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { TicketCard, Text, Button } from '@/shared/components/base';
import { SkeletonBox } from '@/shared/components/skeleton/Skeleton';
import { QRScan, Gift } from '@/shared/assets/icons';
import { colors, spacing, shadows, getFontFamily, FONT_WEIGHTS, dimensions } from '@/shared/themes';
import typographyStyles from '@/shared/themes/typography';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { QRPaymentData } from '../types';
import QRCode from 'react-native-qrcode-svg';
import { EnsogoFlowerLogo } from '../../../shared/assets/images/EnsogoFlower';
import { useUserData } from '@/features/profile/hooks/useUserData';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import { CreateStorePhoto } from '@/shared/assets/images/CreateStorePhoto';
import ProfileIcon from '@/shared/assets/icons/Profile';

interface QRCodeDisplayProps {
  qrData: QRPaymentData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onPromotionPress?: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrData,
  isLoading = false,
  onRefresh,
  onPromotionPress,
}) => {
  const { t } = useTranslation('payment');
  const [countdown, setCountdown] = useState(qrData?.autoUpdateInterval || 38);

  // Get cached user data
  const { data: userData, isLoading: isUserDataLoading, isError: isUserDataError } = useUserData();

  // Get store data - always fetch to check if user has a store
  const { storeData, isLoading: isStoreDataLoading, refetch: refetchStoreData } = useStoreData();

  // Determine if this is a store account - check both account_type and if storeData exists
  // Some users may have stores but account_type field is not set in API response
  const isStoreAccount = userData?.account_type === 'STORE' || (!!storeData && userData?.is_shop === true);

  // Force refetch store data when we detect user has shop flag (only once)
  useEffect(() => {
    if (userData?.is_shop && !storeData && !isStoreDataLoading) {
      refetchStoreData();
    }
    // Only run when is_shop changes or on mount, not on every refetchStoreData change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.is_shop]);

  // Handle countdown timer - but don't auto-refresh
  useEffect(() => {
    if (qrData) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev > 0 ? prev - 1 : 0);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [qrData]);

  // Update countdown when qrData changes
  useEffect(() => {
    if (qrData) {
      setCountdown(qrData.autoUpdateInterval || 38);
    }
  }, [qrData]);

  // Log user data for debugging (only on mount and when critical data changes)
  useEffect(() => {
    // Only log when we have complete data (not loading)
    if (!isUserDataLoading && !isStoreDataLoading) {
      console.log('� [QRCodeDisplay] Display logic state:', {
        isStoreAccount,
        accountType: userData?.account_type,
        isShop: userData?.is_shop,
        hasStoreData: !!storeData,
        storeName: storeData?.name,
        userName: userData?.full_name
      });

      if (isStoreAccount && !storeData) {
        console.warn('⚠️ [QRCodeDisplay] Store account detected but no store data available');
      }
    }
  }, [
    // Only log when these critical values change, not on every render
    isStoreAccount,
    !!storeData,
    !!userData,
    isUserDataLoading,
    isStoreDataLoading
  ]);

  const formatAddress = (address: string | null | undefined) => {
    if (!address) return '--';
    // Remove \n and display in one line
    return address.replace(/\n/g, ', ');
  };

  return (
    <View style={styles.outerContainer}>
      <TicketCard style={styles.container} perforationPosition="bottom" perforationColor={colors.lightGray} backgroundColor={colors.light}
      >
        <View style={{ backgroundColor: colors.light }}>
          <View style={styles.qrSection}>
            {/* QR Code */}
            <TouchableOpacity
              style={styles.qrCodeContainer}
              activeOpacity={0.8}
              disabled={isLoading || !qrData}
            >
              <View style={styles.qrImageContainer}>
                <View style={styles.qrCodeBackground}>
                  {isLoading || !qrData ? (
                    <View style={styles.loadingContainer}>
                      <SkeletonBox
                        width={200}
                        height={200}
                        borderRadius={12}
                        baseColor={colors.lightGray}
                        highlightColor={colors.light}
                      />
                    </View>
                  ) : qrData.qrDataURL ? (
                    <Image
                      source={{ uri: qrData.qrDataURL }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <QRCode
                      size={200}
                      value={qrData.qrCode}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Auto update info */}
            {/* <View style={styles.updateInfo}>
              <Text style={styles.updateText}>
                {t('qrCode.autoUpdate', { seconds: countdown })}
              </Text>
              <TouchableOpacity onPress={onRefresh}>
                <Text style={styles.updateButton}>
                  {t('qrCode.update')}
                </Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.bottomCardContainer}>
            <View style={styles.avatarContainer}>
              {isStoreAccount ? (
                // Store account - always show CreateStorePhoto
                <View style={styles.defaultAvatarContainer}>
                  <CreateStorePhoto width={60} height={60} />
                </View>
              ) : (
                // User account - show avatar or Profile icon
                userData?.avatar?.file_url ? (
                  <Image
                    source={{ uri: userData.avatar.file_url }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.defaultAvatarContainer}>
                    <ProfileIcon width={50} height={50} color={colors.primary} />
                  </View>
                )
              )}
            </View>
            <View style={styles.userInfoContainer}>
              {isUserDataLoading ? (
                <View style={styles.userDataLoading}>
                  <Text style={[typographyStyles.bodySmall, styles.loadingText]}>
                    {t('common.loading', 'Đang tải...')}
                  </Text>
                </View>
              ) : isUserDataError || !userData ? (
                <>
                  <Text style={styles.businessName}>{t('business.defaultName', 'ESPay User')}</Text>
                  <Text style={styles.businessAddress}>{t('business.defaultAddress', 'Vietnam')}</Text>
                </>
              ) : isStoreAccount ? (
                // Store account logic
                isStoreDataLoading ? (
                  <View style={styles.userDataLoading}>
                    <Text style={[typographyStyles.bodySmall, styles.loadingText]}>
                      {t('common.loading', 'Đang tải...')}
                    </Text>
                  </View>
                ) : storeData ? (
                  <>
                    <Text style={styles.businessName}>
                      {storeData.name || t('business.defaultName', 'ESPay Store')}
                    </Text>
                    <Text style={styles.businessAddress}>
                      {[storeData.addressDetail, storeData.addressWard, storeData.addressProvince]
                        .filter(Boolean)
                        .join(', ') || t('business.defaultAddress', 'Vietnam')}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.businessName}>{t('business.defaultName', 'ESPay Store')}</Text>
                    <Text style={styles.businessAddress}>{t('business.defaultAddress', 'Vietnam')}</Text>
                  </>
                )
              ) : (
                // User account logic
                <>
                  <Text style={styles.businessName}>
                    {userData.full_name || userData.phone_number || t('business.defaultName', 'ESPay User')}
                  </Text>
                  <Text style={styles.businessAddress}>
                    {formatAddress(userData.contact_address) || formatAddress(userData.permanent_address) || t('business.defaultAddress', 'Vietnam')}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TicketCard>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: spacing.sm,
  },
  container: {
    borderRadius: dimensions.radius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  paymentMethods: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  paymentMethodsText: {
    ...typographyStyles.caption,
    textAlign: 'center',
    lineHeight: 16,
  },
  qrCodeContainer: {
    marginVertical: spacing.sm,
  },
  qrImageContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCodeBackground: {
    width: 240,
    height: 240,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    ...shadows.sm,
  },
  bottomSection: {
    marginTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  bottomTitleContainer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  bottomTitle: {
    color: colors.text.primary,
  },
  bottomCardContainer: {
    flexDirection: 'row',
    backgroundColor: colors.light,
    padding: spacing.lg,
    marginTop: spacing.md,
    // marginHorizontal: spzacing.xs,
    borderRadius: dimensions.radius.lg,
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: dimensions.radius.lg,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  defaultAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: dimensions.radius.lg,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  businessName: {
    ...typographyStyles.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  businessAddress: {
    ...typographyStyles.bodySmall,
    color: colors.text.secondary,
    flexWrap: 'wrap',
    flexShrink: 1,
    lineHeight: 18,
  },
  loadingContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  qrImage: {
    width: 230,
    height: 230,
  },
  userDataLoading: {
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  userInfoContainer: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
});

export default QRCodeDisplay;
