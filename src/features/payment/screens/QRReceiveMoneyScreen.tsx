import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import { Body, Button, BackgroundPatternSolid } from '@/shared/components/base';
import {
  QRCard,
  ProsperityWalletSection,
  AddAmountModal,
  CustomizeQRModal,
  QRCardSkeleton
} from '../components';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { useUserData } from '@/features/profile/hooks/useUserData';
import { useQRPayment } from '../hooks/useQRPayment';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

const QRReceiveMoneyScreen: React.FC = () => {
  const { t } = useTranslation('payment');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Get cached user data from my-data API
  const { data: userData, isLoading: isUserDataLoading, error: userDataError } = useUserData();

  // Use the same QR payment hook as QRPaymentScreen
  const {
    qrData,
    countdown,
    isGenerating,
    isError,
    error,
    generateQR,
    refreshQR,
  } = useQRPayment();

  // Extract user information from cached data with fallbacks
  const userName = userData?.full_name || userData?.phone_number || 'Unknown User';
  const userID = userData?.id ? `*******${userData.id.slice(-3)}` : '*******264';
  const phoneNumber = userData?.phone_number ? `*******${userData.phone_number.slice(-3)}` : 'Unknown Number';

  const [isAddAmountModalVisible, setIsAddAmountModalVisible] = useState(false);
  const [isCustomizeModalVisible, setIsCustomizeModalVisible] = useState(false);
  const [qrAmount, setQrAmount] = useState<string>('');
  const [qrNote, setQrNote] = useState<string>('');
  const [customizeOptions, setCustomizeOptions] = useState({
    showUserName: true,
    showPhoneNumber: true,
    maskPhoneNumber: true,
  });
  const hasInitializedRef = useRef(false);
  const viewShotRef = useRef<ViewShot>(null);

  // Apply customization options
  const displayUserName = customizeOptions.showUserName ? userName : '';
  const displayPhoneNumber = customizeOptions.showPhoneNumber
    ? (customizeOptions.maskPhoneNumber ? phoneNumber : (userData?.phone_number || 'Unknown Number'))
    : '';

  // Generate initial QR code when user data is available - only once
  useEffect(() => {
    if (userData && !hasInitializedRef.current) {
      console.log('🚀 [QRReceiveMoneyScreen] User data available, generating initial QR code...');
      hasInitializedRef.current = true;
      // Use async/await to properly catch errors and prevent unhandled promise rejection
      const initQR = async () => {
        try {
          await generateQR({
            amount: 0, // Always start with 0 amount
            description: undefined, // No initial description
          });
        } catch (error) {
          // Error is already logged in useQRPayment hook
          // Just catch here to prevent unhandled promise rejection
          console.log('⚠️ [QRReceiveMoneyScreen] QR generation failed, will show error state');
        }
      };
      initQR();
    }
  }, [userData]); // Only depend on userData, not generateQR function

  // Cleanup function to reset initialization state when component unmounts
  useEffect(() => {
    return () => {
      console.log('🧹 [QRReceiveMoneyScreen] Component unmounting, resetting initialization state');
      hasInitializedRef.current = false;
    };
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCopyUserID = () => {
    if (!userData?.id) {
      Alert.alert('Error', 'User ID not available');
      return;
    }

    // Implement copy functionality with actual user ID
    // Clipboard.setString(userData.id);
    // console.log('📋 [QRReceiveMoneyScreen] Copied user ID:', userData.id);
    // Alert.alert('Copied', 'User ID copied to clipboard');
  };

  const handleRefreshQR = async () => {
    console.log('🔄 [QRReceiveMoneyScreen] Manual refresh requested');
    try {
      await refreshQR();
    } catch (error) {
      // Error already handled in hook
      console.log('⚠️ [QRReceiveMoneyScreen] QR refresh failed');
    }
  };

  const handleAddAmount = () => {
    // Always show add amount modal directly (with pre-filled values if they exist)
    setIsAddAmountModalVisible(true);
  };

  const handleAddAmountModalClose = (amount?: string, note?: string) => {
    setIsAddAmountModalVisible(false);
    if (amount !== undefined) {
      // Check if user cleared the amount (empty or '0')
      const isClearing = !amount || amount === '0';

      setQrAmount(amount || '');
      setQrNote(note || '');

      // Regenerate QR code with new amount and note (or clear them)
      generateQR({
        amount: isClearing ? 0 : parseInt(amount, 10),
        description: (note && !isClearing) ? note : undefined,
      });

      if (!isClearing) {
        Alert.alert(
          t('addAmount.success', 'Thành công'),
          t('addAmount.amountAdded', 'Đã thêm số tiền vào QR code')
        );
      }
    }
  };

  const captureScreen = async (): Promise<string | null> => {
    try {
      if (!viewShotRef.current?.capture) {
        Alert.alert('Error', 'Unable to capture screen');
        return null;
      }

      const uri = await viewShotRef.current.capture();
      console.log('📸 [QRReceiveMoneyScreen] Screen captured:', uri);
      return uri;
    } catch (error) {
      console.error('❌ [QRReceiveMoneyScreen] Screen capture failed:', error);
      Alert.alert('Error', 'Failed to capture screen');
      return null;
    }
  };

  const handleDownload = async () => {
    try {
      const imageUri = await captureScreen();
      if (!imageUri) return;

      // Save to photo library using CameraRoll
      const result = await CameraRoll.save(imageUri, {
        type: 'photo',
        album: 'ENSOGO ESPay',
      });

      Alert.alert(
        t('download.success', 'Thành công'),
        t('download.savedToLibrary', 'QR code đã được lưu vào thư viện ảnh')
      );

      console.log('💾 [QRReceiveMoneyScreen] QR code saved to photo library:', result);
    } catch (error) {
      console.error('❌ [QRReceiveMoneyScreen] Download failed:', error);
      Alert.alert('Error', 'Failed to save QR code to photo library');
    }
  };

  const handleCustomize = () => {
    setIsCustomizeModalVisible(true);
  };

  const handleShare = async () => {
    try {
      const imageUri = await captureScreen();
      if (!imageUri) return;

      const shareOptions = {
        title: t('share.title', 'Chia sẻ mã QR'),
        message: t('share.message', 'Gửi tiền qua ENSOGO ESPay'),
        url: imageUri,
        type: 'image/png',
      };

      await Share.open(shareOptions);
      console.log('📤 [QRReceiveMoneyScreen] QR code shared successfully');
    } catch (error) {
      if ((error as Error).message !== 'User did not share') {
        console.error('❌ [QRReceiveMoneyScreen] Share failed:', error);
        Alert.alert('Error', 'Failed to share QR code');
      }
    }
  };

  const handleSplitMoney = () => {
  };

  const handleSpecialOccasion = () => {
  };

  const handleOpenWallet = () => {
    Alert.alert('Prosperity Wallet', 'Open prosperity wallet');
  };

  const handleCreatedQRs = () => {
    Alert.alert('History', 'View created QRs history');
  };

  const handleCustomizeModalClose = () => {
    setIsCustomizeModalVisible(false);
  };

  useStatusBarEffect('transparent', 'light-content', true);

  return (
    <VerificationRequiredOverlay>
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        }}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <StatusBar barStyle="light-content" backgroundColor='transparent' />

        {/* Background Pattern */}
        <BackgroundPatternSolid
          backgroundColor={colors.primary}
          patternColor={colors.light}
        />

        {/* Header */}
        <ScreenHeader
          title={t('receiveMoney.title', 'Nhận tiền')}
          centerTitle
          backIconColor={colors.light}
          titleStyle={{ color: colors.light }}
        // actions={[
        //   {
        //     key: 'support',
        //     icon: (
        //       <Button
        //         label="Hỗ trợ"
        //         variant="outline"
        //         size="sm"
        //         onPress={() => Alert.alert('Hỗ trợ', 'Liên hệ hỗ trợ')}
        //       />
        //     ),
        //     onPress: () => Alert.alert('Hỗ trợ', 'Liên hệ hỗ trợ'),
        //   }
        // ]}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* QR Card with Action Buttons */}
          {isUserDataLoading ? (
            <QRCardSkeleton />
          ) : userDataError ? (
            <View style={styles.errorContainer}>
              <Body style={styles.errorText}>
                {t('receiveMoney.errorLoadingData', 'Error loading user data. Please try again.')}
              </Body>
            </View>
          ) : (
            <QRCard
              userName={displayUserName || ' '}
              userID={displayPhoneNumber || ' '}
              isLoading={isGenerating}
              qrDataURL={qrData?.qrDataURL || null}
              qrCode={qrData?.qrCode}
              amount={qrAmount}
              description={qrNote}
              showUserName={customizeOptions.showUserName}
              showPhoneNumber={customizeOptions.showPhoneNumber}
              onCopyUserID={handleCopyUserID}
              onAddAmount={handleAddAmount}
              onRefreshQR={handleRefreshQR}
              onDownload={handleDownload}
              onCustomize={handleCustomize}
              onShare={handleShare}
            />
          )}


          {/* Prosperity Wallet Section */}
          {/* <ProsperityWalletSection
          onOpenWallet={handleOpenWallet}
        /> */}

          {/* Bottom spacing */}
          <View style={{ height: spacing.xl }} />
        </ScrollView>

        {/* Add Amount Modal */}
        <AddAmountModal
          isVisible={isAddAmountModalVisible}
          onClose={handleAddAmountModalClose}
          initialAmount={qrAmount}
          initialNote={qrNote}
        />

        {/* Customize Modal */}
        <CustomizeQRModal
          visible={isCustomizeModalVisible}
          onClose={handleCustomizeModalClose}
          options={customizeOptions}
          onOptionsChange={setCustomizeOptions}
        />
      </ViewShot>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  errorContainer: {
    backgroundColor: colors.light,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
  },
});

export default QRReceiveMoneyScreen;
