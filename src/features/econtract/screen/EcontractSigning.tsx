import React, { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, Alert, Text, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { PencilEdit } from '@/shared/assets/icons';
import { useAppDispatch } from '@/shared/hooks/useRedux';

import { styles } from '../styles';
import { NavigationProp } from '../types';
import { theme } from '@/shared/themes';

// Components
import {
  HeaderComponent,
  LoadingState,
  ContractPdfViewer,
  SignedContractViewer,
  SignatureModal,
  ExpiredModal,
} from '@/features/econtract/components';

// Hooks
import { useContractGeneration } from '@/features/econtract/hooks/useContractGeneration';
import { usePdfDownload } from '@/features/econtract/hooks/usePdfDownload';
import { useContractSigning } from '@/features/econtract/hooks/useContractSigning';
import { useEcontract } from '@/features/econtract/hooks/useEcontract';
import { initializeOTPServices } from '@/features/otp/setup';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEYS, useUserData } from '@/features/profile/hooks/useUserData';
import { STORE_QUERY_KEYS, refreshStoreData } from '@/features/authentication/hooks/useStoreData';
import { BANK_QUERY_KEYS } from '@/features/deposit/hooks/useBankAccount';
import { userProfileQueryKeys } from '@/features/authentication/hooks/useUserProfile';

export default function EcontractSigningScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isExpiredModalVisible, setIsExpiredModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data: userData } = useUserData();

  // Econtract hook for OTP operations
  const { requestOtp } = useEcontract();

  // Function to refresh app data after successful contract signing
  const refreshAppData = useCallback(async () => {
    try {
      console.log('🔄 [EcontractSigning] Refreshing app data after successful contract signing...');

      // Refresh user data (my-data API)
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.userData });
      console.log('✅ [EcontractSigning] User data refreshed');

      // Refresh store data (stores/my API) - this will also update hasStore in cache/storage
      await refreshStoreData(queryClient);
      console.log('✅ [EcontractSigning] Store data refreshed');

      // Refresh bank data (bank API)
      await queryClient.invalidateQueries({ queryKey: BANK_QUERY_KEYS.linkedBanks() });
      console.log('✅ [EcontractSigning] Bank data refreshed');

      console.log('🎉 [EcontractSigning] All app data refreshed successfully');
    } catch (error) {
      console.error('❌ [EcontractSigning] Error refreshing app data:', error);
      // Don't throw error - data refresh failure shouldn't block the signing flow
    }
  }, [queryClient]);

  // Khởi tạo các hooks
  const {
    initializeContract,
    currentStatus,
    isJobCompleted,
    pdfUrl,
    cleanupResources: cleanupContractResources
  } = useContractGeneration();

  const {
    isDownloading,
    downloadProgress,
    pdfSource,
    downloadPdf,

    isDownloadingSignedPdf,
    signedPdfDownloadProgress,
    signedPdfSource,
    downloadSignedPdf,

    cleanupResources: cleanupPdfResources
  } = usePdfDownload();

  const {
    signatureRef,
    isSignatureModalVisible,
    isSignedPdfVisible,
    signatureBase64,
    setIsSignatureModalVisible,
    setIsSignedPdfVisible,
    handleSignContract,
    saveSignature,
    resetSignature,
    cleanupResources: cleanupSigningResources
  } = useContractSigning();

  // Quay về trang chủ
  const handleGoHome = () => {
    setIsExpiredModalVisible(false);
    navigation.navigate('Main');
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  // Khởi tạo hợp đồng khi component mount
  useEffect(() => {
    console.log('EcontractSigningScreen mounted, initializing contract');

    // Initialize OTP services with dispatch for econtract
    initializeOTPServices(dispatch);

    // Initialize contract
    initializeContract();

    return () => {
      console.log('EcontractSigningScreen unmounting, cleaning up');
      cleanupContractResources();
      cleanupPdfResources();
      cleanupSigningResources();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tải PDF khi nhận được URL từ useContractGeneration
  useEffect(() => {
    if (pdfUrl && currentStatus === 'completed' && isJobCompleted && !pdfSource) {
      console.log('Contract completed, downloading PDF from URL:', pdfUrl);
      downloadPdf(pdfUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, currentStatus, isJobCompleted]);

  // Xử lý quay lại và đi đến màn hình chính
  const handleGoBack = () => {
    navigation.navigate('Main');
  };

  // Xác nhận đã xem file đã ký và hoàn tất quá trình
  const handleConfirmSigned = useCallback(async () => {
    try {
      console.log('✅ [EcontractSigning] User confirmed viewing signed contract');
      // Đóng màn hình hiển thị PDF đã ký
      setIsSignedPdfVisible(false);

      // Force refresh user data to ensure verify status is updated
      console.log('🔄 [EcontractSigning] Forcing user data refresh before navigation...');
      await queryClient.invalidateQueries({
        queryKey: userProfileQueryKeys.all,
        refetchType: 'active'
      });

      // Small delay để đảm bảo query đã complete
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));

      // Log that we're navigating back to Home where portfolio will refresh
      console.log('🔄 [EcontractSigning] Navigating to Home screen where PortfolioValueCard will refresh');

      // Chuyển về màn hình Home
      navigation.navigate('Main');
    } catch (error) {
      console.error('❌ [EcontractSigning] Error in handleConfirmSigned:', error);
      // Fallback - still try to navigate to Main
      navigation.navigate('Main');
    }
  }, [setIsSignedPdfVisible, navigation, queryClient]);

  // Callback khi signature được lưu và cần navigate đến OTP
  const handleSignatureComplete = useCallback(async (signature: string) => {
    console.log('🚀 [EcontractSigning] Signature completed, requesting OTP...');

    try {
      // Validate user phone number
      if (!userData?.phone_number) {
        throw new Error('Không tìm thấy số điện thoại. Vui lòng đăng nhập lại.');
      }

      // Request OTP first
      const otpRequested = await requestOtp();

      if (otpRequested) {
        console.log('✅ [EcontractSigning] OTP requested successfully, navigating to OTP screen...');

        // Navigate to dedicated Econtract OTP screen
        navigation.navigate('EcontractOtp', {
          phone: userData.phone_number,
          otpType: 'econtract-signing',
          context: {
            signatureBase64: signature,
            onSuccess: async (result: any) => {
              console.log('✅ [EcontractSigning] OTP verification successful:', result);

              try {
                // Process the contract signing result
                if (result && result.data && result.data.success) {
                  console.log('✅ [EcontractSigning] Contract signing successful, refreshing app data...');

                  // Refresh all app data (user, store, bank) after successful contract signing
                  await refreshAppData();

                  if (result.data.pdfUrl) {
                    console.log('📄 [EcontractSigning] Downloading signed PDF from URL:', result.data.pdfUrl);

                    // Navigate back to contract screen first
                    navigation.goBack();

                    // Add small delay to ensure navigation completes
                    await new Promise<void>(resolve => setTimeout(resolve, 500));

                    // Tải PDF đã ký về thiết bị
                    const downloadSuccess = await downloadSignedPdf(result.data.pdfUrl);
                    if (downloadSuccess) {
                      // Hiển thị PDF đã ký
                      setIsSignedPdfVisible(true);
                    } else {
                      console.error('❌ [EcontractSigning] Failed to download signed PDF');
                      // Nếu không tải được, hiển thị thông báo lỗi
                      Alert.alert(
                        t('common.error', 'Lỗi'),
                        'Không thể tải file PDF đã ký. Vui lòng thử lại.',
                        [
                          {
                            text: t('common.ok', 'OK')
                          }
                        ]
                      );
                    }
                  } else {
                    console.error('❌ [EcontractSigning] No signed PDF URL returned from API');
                    navigation.goBack();
                    // Nếu không tìm thấy URL file PDF đã ký, hiển thị thông báo lỗi
                    Alert.alert(
                      t('common.error', 'Lỗi'),
                      'API không trả về URL file PDF đã ký. Vui lòng liên hệ hỗ trợ.',
                      [
                        {
                          text: t('common.ok', 'OK')
                        }
                      ]
                    );
                  }
                } else {
                  console.error('❌ [EcontractSigning] Contract signing failed:', result);
                  navigation.goBack();
                  Alert.alert(
                    t('common.error', 'Lỗi'),
                    'Ký hợp đồng thất bại. Vui lòng thử lại.',
                    [
                      {
                        text: t('common.ok', 'OK')
                      }
                    ]
                  );
                }
              } catch (error) {
                console.error('❌ [EcontractSigning] Error in onSuccess:', error);
                navigation.goBack();
                Alert.alert(
                  t('common.error', 'Lỗi'),
                  'Có lỗi xảy ra. Vui lòng thử lại.',
                  [
                    {
                      text: t('common.ok', 'OK')
                    }
                  ]
                );
              }
            },
            onError: (error: any) => {
              console.error('❌ [EcontractSigning] OTP verification failed:', error);
              // Navigate back to contract signing screen on error
              navigation.goBack();

              // Show error alert
              Alert.alert(
                t('common.error', 'Lỗi'),
                error.message || 'Xác thực OTP thất bại. Vui lòng thử lại.',
                [
                  {
                    text: t('common.ok', 'OK')
                  }
                ]
              );
            }
          }
        });
      } else {
        throw new Error('Failed to request OTP');
      }
    } catch (error: any) {
      console.error('❌ [EcontractSigning] Failed to request OTP:', error);
      Alert.alert(
        t('common.error', 'Lỗi'),
        error.message || 'Không thể yêu cầu OTP. Vui lòng thử lại.',
        [
          {
            text: t('common.ok', 'OK')
          }
        ]
      );
    }
  }, [navigation, downloadSignedPdf, setIsSignedPdfVisible, t, requestOtp, userData, refreshAppData]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <HeaderComponent
        isSignedPdfVisible={isSignedPdfVisible}
        onGoBack={handleGoBack}
      />

      <View style={styles.content}>
        {isSignedPdfVisible ? (
          <SignedContractViewer
            isDownloadingSignedPdf={isDownloadingSignedPdf}
            signedPdfDownloadProgress={signedPdfDownloadProgress}
            signedPdfSource={signedPdfSource}
            onConfirmSigned={handleConfirmSigned}
          />
        ) : isDownloading || currentStatus === 'pending' ? (
          <LoadingState currentStatus={currentStatus} />
        ) : (
          <>
            <View style={styles.pdfContainer}>
              <ContractPdfViewer
                isDownloading={isDownloading}
                downloadProgress={downloadProgress}
                pdfSource={pdfSource}
              />
            </View>

            {/* Actions */}
            {currentStatus === 'completed' && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.signButton}
                  onPress={() => handleSignContract(handleSignatureComplete)}
                >
                  <PencilEdit width={20} height={20} color={theme.colors.light} />
                  <Text style={styles.signButtonText}>
                    {t('econtract.sign', 'Ký hợp đồng')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Modals */}
      <SignatureModal
        isVisible={isSignatureModalVisible}
        onClose={() => setIsSignatureModalVisible(false)}
        onSave={saveSignature}
        onReset={resetSignature}
        signatureRef={signatureRef}
      />

      <ExpiredModal
        isVisible={isExpiredModalVisible}
        onClose={() => setIsExpiredModalVisible(false)}
        onGoHome={handleGoHome}
      />
    </View>
  );
}
