import { useState, useEffect } from 'react';
import { Alert, Clipboard, Platform, PermissionsAndroid, Share, Linking } from 'react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import * as FileSystem from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

import { Bank } from '../constants/banks';
import { fetchBankAccountInfo } from '../services/bankService';
import { bankTypeManager } from '../utils/bankTypeManager';
import type { BankInfo } from '../types/bank';

export const useBankTransfer = (selectedBank: Bank, initialAmount: string) => {
  const { t } = useTranslation('deposit');
  const [amount, setAmount] = useState(initialAmount);
  const [isAmountModalVisible, setIsAmountModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: selectedBank.name,
    accountHolder: '',
    accountNumber: '',
    transferContent: '',
  });

  useEffect(() => {
    loadBankAccountInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBankAccountInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load bank account info from API using current bank type
      const currentBankType = bankTypeManager.getBankType();
      const response = await fetchBankAccountInfo(currentBankType);

      if (response.success) {
        setBankInfo({
          bankName: selectedBank.name,
          accountHolder: response.data.bankHolder,
          accountNumber: response.data.bankNumber,
          transferContent: `Nap tien TK ${response.data.bankNumber.substring(0, 8)} tai Ensogo EST`,
        });
        setLoading(false);
      } else {
        setError(response.message || t('errors.loadAccount'));
        setLoading(false);
      }
    } catch (err) {
       
      console.error('Failed to fetch bank account info:', err);
      setError(t('errors.loadAccount'));
      setLoading(false);
    }
  };

  const formatAmount = (value: string): string => {
    if (!value) return '0';
    const number = parseInt(value.replace(/[^0-9]/g, ''));
    return Number.isNaN(number) ? '0' : number.toLocaleString('vi-VN');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBankAccountInfo();
    setRefreshing(false);
  };

  const handleCopyToClipboard = async (text: string) => {
    await Clipboard.setString(text);
  Alert.alert(t('qr.copiedTitle'), t('qr.copiedMessage'));
  };

  const getQRImageUrl = () => {
    const numericAmount = amount.replace(/[^0-9]/g, '');
    return `https://img.vietqr.io/image/970407-${bankInfo.accountNumber}-compact.jpg?amount=${numericAmount}&addInfo=${encodeURIComponent(bankInfo.transferContent)}&accountName=${encodeURIComponent(bankInfo.accountHolder)}`;
  };

  // Request Android permission every press; if user selected "Don't ask again", guide to Settings
  const requestAndroidImagesPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Quyền truy cập thư viện ảnh',
          message: 'Ứng dụng cần quyền truy cập thư viện ảnh để lưu mã QR',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Đồng ý',
        },
      );
      if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          t('qr.permissionDeniedTitle'),
          t('qr.permissionDeniedMessage'),
          [
            { text: t('qr.cancel'), style: 'cancel' },
            { text: t('qr.openSettings'), onPress: () => Linking.openSettings?.() },
          ],
        );
      }
      return false;
    }
    // Android 12 and below
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Quyền truy cập thư viện ảnh',
        message: 'Ứng dụng cần quyền truy cập thư viện ảnh để lưu mã QR',
        buttonNeutral: 'Hỏi lại sau',
        buttonNegative: 'Từ chối',
        buttonPositive: 'Đồng ý',
      },
    );
    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        t('qr.permissionDeniedTitle'),
        t('qr.permissionDeniedMessage'),
        [
          { text: t('qr.cancel'), style: 'cancel' },
          { text: t('qr.openSettings'), onPress: () => Linking.openSettings?.() },
        ],
      );
    }
    return false;
  };

  const handleSaveQR = async () => {
    try {
      // Request storage permission on Android when needed
      if (Platform.OS === 'android') {
        const granted = await requestAndroidImagesPermission();
        if (!granted) return;
      }

      const qrImageUrl = getQRImageUrl();
      const filename = `qr_code_${Date.now()}.jpg`;
      const filePath = `${FileSystem.CachesDirectoryPath}/${filename}`;

      // Download the image directly to the cache directory to avoid Blob/FileReader issues
      const result = await FileSystem.downloadFile({ fromUrl: qrImageUrl, toFile: filePath }).promise;
      if (result.statusCode !== 200) {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }

      // Save to camera roll
      const toSavePath = Platform.OS === 'ios' ? `file://${filePath}` : `file://${filePath}`;
      await CameraRoll.save(toSavePath, { type: 'photo' });

      // Clean up the temporary file
      await FileSystem.unlink(filePath).catch(() => undefined);

      Alert.alert(t('qr.successTitle'), t('qr.saveSuccess'));
    } catch (error) {
       
      console.error('Error saving QR code:', error);
      if (Platform.OS === 'ios') {
        // On iOS, after denial, system won't re-prompt; guide user to Settings
        Alert.alert(
          t('qr.permissionDeniedTitle'),
          t('qr.iosPermissionHelp'),
          [
            { text: t('qr.cancel'), style: 'cancel' },
            { text: t('qr.openSettings'), onPress: () => Linking.openSettings?.() },
          ],
        );
      } else {
        Alert.alert(t('qr.errorTitle'), t('qr.saveError'));
      }
    }
  };

  const handleShareQR = async () => {
    try {
      const qrImageUrl = getQRImageUrl();
      const filePath = `${FileSystem.CachesDirectoryPath}/qr_code_${Date.now()}.jpg`;
      const result = await FileSystem.downloadFile({ fromUrl: qrImageUrl, toFile: filePath }).promise;
      if (result.statusCode !== 200) {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }

      await Share.share({
        url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
        title: t('qr.share'),
      });

      // Clean up the temporary file
      await FileSystem.unlink(filePath).catch(() => undefined);
    } catch (error) {
      Alert.alert(t('qr.errorTitle'), t('qr.shareError'));
    }
  };
  return {
    amount,
    isAmountModalVisible,
    refreshing,
    loading,
    error,
    bankInfo,
    formatAmount,
    loadBankAccountInfo,
    handleSaveQR,
    handleShareQR,
    handleCopyToClipboard,
    handleRefresh,
    getQRImageUrl,
    setAmount,
    setIsAmountModalVisible
  } as const;
};
