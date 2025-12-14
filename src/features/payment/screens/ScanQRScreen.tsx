import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  Text,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCodeScanner, useCameraPermission } from 'react-native-vision-camera';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, typography } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FlashIcon, Image01Icon } from '@hugeicons/core-free-icons';

import { ScreenHeader } from '@/shared/components';
import { QRScanFrame, QRBottomActions, QRHighlightFrame } from '../components';
import { QR_READER_HTML } from '../utils/qrReaderWebView';

import { useQRInformation } from '../hooks/useQRInformation';
import { bankTypeManager } from '../../deposit/utils/bankTypeManager';
import type { BankType } from '../../deposit/types/bank';
import { useBankAccount } from '@/features/deposit/hooks';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScanQRScreenProps {
  hideBottomActions?: boolean;
}

const ScanQRScreen: React.FC<ScanQRScreenProps> = ({ hideBottomActions = false }) => {
  const { t } = useTranslation('payment');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  // Camera setup for react-native-vision-camera
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedCodeValue, setScannedCodeValue] = useState<string | null>(null);
  const [showHighlightFrame, setShowHighlightFrame] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get both USER and STORE bank accounts to compare with scanned QR
  const { data: userBankData } = useBankAccount('USER');
  const { data: storeBankData } = useBankAccount('STORE');

  // QR info mutation
  const {
    mutate: fetchQRInfo,
    data: qrInfoData,
    error: qrInfoError,
    reset: resetQRInfo,
  } = useQRInformation();
  const [screenData, setScreenData] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  });

  // Animation values for the scanning frame
  const [scanLinePosition, setScanLinePosition] = useState(0);
  const [scanFrameScale, setScanFrameScale] = useState(1);
  const [frameOpacity, setFrameOpacity] = useState(0);
  const [frameX, setFrameX] = useState(0);
  const [frameY, setFrameY] = useState(0);
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);

  // WebView for QR decoding
  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const qrDecodePromiseRef = useRef<{
    resolve: (value: string | null) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  // Define handleQRCodeDetected before useCodeScanner
  const handleQRCodeDetected = useCallback((qrValue: string) => {
    if (!qrValue || !isScanning || isProcessing) return;
    setIsScanning(false);
    setIsProcessing(true);
    setShowHighlightFrame(true);
    setScannedCodeValue(qrValue);

    // Call QR info API
    fetchQRInfo(
      { qrContent: qrValue },
      {
        onSuccess: async (data) => {
          setIsProcessing(false);
          if (data?.success && data.data) {
            // Get current user's bank account numbers
            const userAccountNumber = userBankData?.data?.bankNumber || '';
            const storeAccountNumber = storeBankData?.data?.bankNumber || '';
            const scannedAccountNumber = data.data.bankNumber || '';

            console.log('🔍 [ScanQRScreen] Checking scanned QR account:', {
              scannedAccount: scannedAccountNumber,
              userAccount: userAccountNumber,
              storeAccount: storeAccountNumber,
            });

            // Check if scanned account matches current user's accounts
            if (scannedAccountNumber &&
              (scannedAccountNumber === userAccountNumber || scannedAccountNumber === storeAccountNumber)) {
              console.warn('⚠️ [ScanQRScreen] Self-transfer detected - scanned own QR code');

              // Show alert and allow user to scan again
              Alert.alert(
                t('scanQR.selfTransferTitle', 'Không thể chuyển tiền'),
                t('scanQR.selfTransferMessage', 'Bạn không thể chuyển tiền cho chính mình. Vui lòng quét mã QR của người nhận khác.'),
                [
                  {
                    text: t('scanQR.scanAgain', 'Quét lại'),
                    onPress: handleScanAgain
                  },
                  {
                    text: t('scanQR.cancel', 'Hủy'),
                    onPress: () => navigation.goBack(),
                    style: 'cancel'
                  },
                ]
              );
              return;
            }

            // Get current bank type
            const currentBankType = await bankTypeManager.getBankType();

            console.log('✅ [ScanQRScreen] Valid recipient QR - navigating to transfer screen');

            // Redirect to TransferMoneyScreen with recipient info (bankNumber, bankHolder, bankBin)
            navigation.replace(
              'TransferMoney',
              {
                recipient: {
                  name: data.data.bankHolder || data.data.bankNumber || '',
                  accountNumber: data.data.bankNumber || '',
                  bankName: '', // Not available in QR, can be resolved by bankBin if needed
                  bankCode: data.data.bankBin || '',
                  bankType: currentBankType || 'USER',
                  // logoUrl can be constructed if needed
                  // isEzyWallet: false (default)
                },
                amount: data.data.amount,
                note: data.data.description,
                transferMode: 'bank',
                autoSelectedRecipient: true,
                orderIdValid: data.data.orderIdValid,
                orderId: data.data.orderId,

              }
            );
          } else {
            Alert.alert(
              'QR Error',
              data?.message || 'Không thể đọc thông tin QR',
              [
                { text: 'Scan Again', onPress: handleScanAgain },
                { text: 'Cancel', onPress: () => navigation.navigate('Main' as never) },
              ]
            );
          }
        },
        onError: (error: any) => {
          setIsProcessing(false);
          Alert.alert(
            'QR Error',
            error?.message || 'Không thể đọc thông tin QR',
            [
              { text: 'Scan Again', onPress: handleScanAgain },
              { text: 'Cancel', onPress: () => navigation.navigate('Main' as never) },
            ]
          );
        },
      }
    );
  }, [isScanning, isProcessing, fetchQRInfo, navigation, userBankData, storeBankData, t]);

  const handleScanAgain = () => {
    setIsProcessing(false);
    setIsScanning(true);
    setShowHighlightFrame(false);
    setScannedCodeValue(null);
    setFrameOpacity(0);
  };

  // Code scanner setup
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isScanning && !isProcessing) {
        const codeValue = codes[0].value;
        if (codeValue) {
          handleQRCodeDetected(codeValue);
        }
      }
    }
  });

  useEffect(() => {
    checkCameraPermission();

    // Handle orientation changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData({
        width: window.width,
        height: window.height,
      });
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Start scan animation when component mounts
    if (isScanning && isFocused) {
      startScanAnimation();
    }

    return () => {
      clearAnimations();
    };
  }, [isScanning, isFocused]);

  const checkCameraPermission = async () => {
    if (!hasPermission) {
      await requestPermission();
    }
  };

  const startScanAnimation = () => {
    // Simple animation loop for scan line
    const animateFrame = () => {
      setScanLinePosition(prev => {
        const newPos = prev >= 1 ? 0 : prev + 0.01;
        return newPos;
      });
      setScanFrameScale(prev => {
        const newScale = prev >= 1.03 ? 1 : prev + 0.001;
        return newScale;
      });
    };

    const interval = setInterval(animateFrame, 16); // 60fps
    return () => clearInterval(interval);
  };

  const clearAnimations = () => {
    setScanLinePosition(0);
    setScanFrameScale(1);
  };


  const handleBack = () => {
    navigation.goBack();
  };

  const toggleTorch = () => {
    setIsTorchOn(!isTorchOn);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'READY') {
        setIsWebViewReady(true);
        console.log('✅ [ScanQRScreen] WebView QR reader ready');
      } else if (message.type === 'QR_RESULT') {
        if (qrDecodePromiseRef.current) {
          qrDecodePromiseRef.current.resolve(message.data);
          qrDecodePromiseRef.current = null;
        }
      } else if (message.type === 'QR_ERROR') {
        if (qrDecodePromiseRef.current) {
          qrDecodePromiseRef.current.reject(new Error(message.error));
          qrDecodePromiseRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const decodeQRFromImage = (base64Image: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (!isWebViewReady || !webViewRef.current) {
        reject(new Error('WebView not ready'));
        return;
      }

      qrDecodePromiseRef.current = { resolve, reject };

      const message = JSON.stringify({
        type: 'DECODE_QR',
        imageData: base64Image,
      });

      webViewRef.current.postMessage(message);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (qrDecodePromiseRef.current) {
          qrDecodePromiseRef.current.reject(new Error('QR decode timeout'));
          qrDecodePromiseRef.current = null;
        }
      }, 10000);
    });
  };

  const handlePickImageFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          t('scanQR.error', 'Lỗi'),
          t('scanQR.imagePickerError', 'Không thể chọn ảnh từ thư viện'),
        );
        return;
      }

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri) {
          try {
            setIsProcessing(true);

            // Read image as base64
            const base64 = await RNFS.readFile(asset.uri, 'base64');
            const base64Image = `data:image/jpeg;base64,${base64}`;

            // Decode QR using WebView
            const qrContent = await decodeQRFromImage(base64Image);

            setIsProcessing(false);

            if (qrContent) {
              console.log('✅ [ScanQRScreen] QR detected from image:', qrContent);
              handleQRCodeDetected(qrContent);
            } else {
              Alert.alert(
                t('scanQR.error', 'Lỗi'),
                t('scanQR.noQRFound', 'Không tìm thấy mã QR trong ảnh. Vui lòng chọn ảnh khác.'),
              );
            }
          } catch (error) {
            setIsProcessing(false);
            console.error('Error decoding QR from image:', error);
            Alert.alert(
              t('scanQR.error', 'Lỗi'),
              t('scanQR.qrDetectionError', 'Không thể đọc mã QR từ ảnh. Vui lòng thử lại.'),
            );
          }
        }
      }
    } catch (error) {
      setIsProcessing(false);
      console.error('Error picking image:', error);
      Alert.alert(
        t('scanQR.error', 'Lỗi'),
        t('scanQR.imagePickerError', 'Không thể chọn ảnh từ thư viện'),
      );
    }
  };

  const renderCameraView = () => {
    if (!hasPermission) {
      return (
        <View style={styles.fullScreenView}>
          <Text style={styles.permissionText}>
            Camera permission denied. Please enable camera access in settings to scan QR codes.
          </Text>
        </View>
      );
    }

    if (!device) {
      return (
        <View style={styles.fullScreenView}>
          <Text style={styles.permissionText}>No camera device found</Text>
        </View>
      );
    }

    return (
      <Camera
        device={device}
        isActive={isFocused && isScanning}
        codeScanner={codeScanner}
        torch={isTorchOn ? 'on' : 'off'}
        style={[
          styles.fullScreenCamera,
          {
            width: screenData.width,
            height: screenData.height,
          },
        ]}
      />
    );
  };

  const handlePaymentQR = () => {
    // Navigate back to the QR payment screen
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
        hidden={false}
      />

      {/* Real Camera View - Full Screen */}
      {renderCameraView()}

      {/* QR Highlight Frame */}
      {/* <QRHighlightFrame
        showHighlightFrame={showHighlightFrame}
        frameX={frameX}
        frameY={frameY}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
        frameOpacity={frameOpacity}
        scanFrameScale={scanFrameScale}
      /> */}

      {/* Header Overlay */}
      <ScreenHeader
        showBack={true}
        onBackPress={handleBack}
        transparent={false}
        backIconColor={colors.light}
        actions={[
          {
            key: 'gallery',
            icon: <HugeiconsIcon icon={Image01Icon} size={20} color={colors.light} />,
            onPress: handlePickImageFromGallery,
            accessibilityLabel: 'Pick image from gallery',
          },
          {
            key: 'torch',
            icon: <HugeiconsIcon icon={FlashIcon} size={20} color={isTorchOn ? colors.warning : colors.light} />,
            onPress: toggleTorch,
            accessibilityLabel: isTorchOn ? 'Turn off torch' : 'Turn on torch',
          }
        ]}
        containerStyle={{
        }}
      />

      {/* Scan Frame Overlay - only show when scanning */}
      {isScanning && !showHighlightFrame && (
        <QRScanFrame
          scanText={t('qrCode.instruction')}
          scanLinePosition={scanLinePosition}
          scanFrameScale={scanFrameScale}
        />
      )}

      {/* Bottom Actions */}
      {!hideBottomActions && (
        <View style={[styles.bottomActionsContainer]}>
          <QRBottomActions
            onScanQRPress={handlePaymentQR}
            activeTab="scan"
          />
        </View>
      )}

      {/* Hidden WebView for QR decoding */}
      <WebView
        ref={webViewRef}
        source={{ html: QR_READER_HTML }}
        onMessage={handleWebViewMessage}
        style={{ height: 0, width: 0, opacity: 0 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  fullScreenView: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCamera: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    ...typography.body,
    color: colors.light,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  bottomActionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  iconText: {
    ...typography.title,
    color: colors.light,
  },
});

export default ScanQRScreen;
