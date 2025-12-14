import React, { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, SafeAreaView, Alert, Text, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@shared/hooks/useRedux';

import { styles } from './styles';
import { NavigationProp } from './types';
import { theme } from '@shared/themes';

// Components
import {
  HeaderComponent,
  LoadingState,
  ContractPdfViewer,
  SignedContractViewer,
  SignatureModal,
  ExpiredModal,
} from './components';

// Hooks
import { useContractGeneration } from './hooks/useContractGeneration';
import { usePdfDownload } from './hooks/usePdfDownload';
import { useContractSigning } from './hooks/useContractSigning';
import { useEcontract } from './hooks/useEcontract';
import { initializeOTPServices } from '@/features/otp';

export default function EcontractSigningScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isExpiredModalVisible, setIsExpiredModalVisible] = useState(false);

  // Econtract hook for OTP operations
  const { requestOtp } = useEcontract();

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
  const handleConfirmSigned = useCallback(() => {
    try {
      console.log('✅ [EcontractSigning] User confirmed viewing signed contract');
      // Đóng màn hình hiển thị PDF đã ký
      setIsSignedPdfVisible(false);

      // Log that we're navigating back to Home where portfolio will refresh
      console.log('🔄 [EcontractSigning] Navigating to Home screen where PortfolioValueCard will refresh');

      // Chuyển về màn hình Home
      navigation.navigate('Main');
    } catch (error) {
      console.error('❌ [EcontractSigning] Error in handleConfirmSigned:', error);
      // Fallback - still try to navigate to Main
      navigation.navigate('Main');
    }
  }, [setIsSignedPdfVisible, navigation]);

  // Callback khi signature được lưu và cần navigate đến OTP
  const handleSignatureComplete = useCallback(async (signature: string) => {
    console.log('🚀 [EcontractSigning] Signature completed, requesting OTP...');

    try {
      // Request OTP first
      const otpRequested = await requestOtp();

      if (otpRequested) {
        console.log('✅ [EcontractSigning] OTP requested successfully, navigating to OTP screen...');

        // Navigate to OTP verification screen
        navigation.navigate('OTPVerification', {
          phone: '0901234567', // Mock phone number - in real app this would come from user profile
          otpType: 'econtract-signing',
          context: {
            signatureBase64: signature,
            onSuccess: async (result: any) => {
              console.log('✅ [EcontractSigning] OTP verification successful:', result);
              
              try {
                // Process the contract signing result
                if (result && result.data && result.data.success) {
                  if (result.data.pdfUrl) {
                    console.log('📄 [EcontractSigning] Downloading signed PDF from URL:', result.data.pdfUrl);
                    
                    // Navigate back to contract screen first
                    navigation.goBack();
                    
                    // Add small delay to ensure navigation completes
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
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
  }, [navigation, downloadSignedPdf, setIsSignedPdfVisible, t, requestOtp]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

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
                  {/* <Icon name="signature" size={20} color={theme.colors.light} style={styles.signButtonIcon} /> */}
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
    </SafeAreaView>
  );
}
