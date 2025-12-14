import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  Linking,
  Share,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/shared/themes';
import { Button, Body } from '@/shared/components/base';
import { useRoute } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { PencilEdit02Icon, Share01Icon, Download01Icon, BankIcon, Copy01Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useQRGeneration, useBankAccountData } from '../hooks';
import { formatVND } from '@/shared/utils/format';
import type { VietQRBank } from '../types/bank';
import { BankSelectionModal, BankSelectionCard } from '../components';
import { AddAmountModal } from '@/features/payment/components';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import ScreenHeader from '@/shared/components/ScreenHeader';

const QRCodeDepositScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const { t } = useTranslation('deposit');

  // Get route params
  const { amount: initialAmount, accountNumber, transferContent, selectedBank } = route.params || {};

  // Get bank account data from cache using dynamic bank type
  const { bankAccount } = useBankAccountData();

  // Local state
  const [amount, setAmount] = useState<number>(initialAmount || 0);
  const [currentBank, setCurrentBank] = useState<VietQRBank | undefined>(selectedBank);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);

  // QR generation mutation
  const qrMutation = useQRGeneration();

  // Generate QR code when component mounts or amount changes
  useEffect(() => {
    if (amount > 0) {
      generateQR();
    }
  }, [amount]);

  const generateQR = async () => {
    try {
      const result = await qrMutation.mutateAsync({
        request: {
          amount,
          bin: '970407', // Always use this BIN as specified
        },
        // params omitted to use current bank type from manager
      });
      console.log('QR Generation Response:', result);

      // Extract base64 data and remove the data:image/png;base64, prefix
      const qrDataURL = result.data.qrData.qrDataURL;
      const base64Data = qrDataURL.replace('data:image/png;base64,', '');

      // Create the proper data URI for the Image component
      const imageUri = `data:image/png;base64,${base64Data}`;
      setQrData(imageUri);
    } catch (error) {
      console.error('QR Generation Error:', error);
      Alert.alert(t('qr.qrGeneration'), t('qr.qrGenerationMessage'));
    }
  };

  const handleAmountConfirm = (newAmountString?: string) => {
    setShowAmountModal(false); // Always close modal
    if (newAmountString) {
      const newAmount = parseInt(newAmountString, 10);
      setAmount(newAmount);
      // QR will regenerate automatically due to useEffect dependency
    }
  };

  const handleBankSelect = (bank: VietQRBank) => {
    setCurrentBank(bank);
    setShowBankModal(false);
  };

  const downloadQR = async () => {
    if (!qrData) return;

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(t('qr.permission'), t('qr.storagePermission'));
          return;
        }
      }

      // Convert base64 to file
      const base64Data = qrData.replace('data:image/png;base64,', '');
      const fileName = `QR Nạp tiền.png`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(filePath, base64Data, 'base64');

      // Save to camera roll
      await CameraRoll.save(filePath, { type: 'photo' });

      Alert.alert(t('qr.successTitle'), t('qr.downloadMessage'));
    } catch (error) {
      Alert.alert(t('qr.errorTitle'), t('qr.saveError'));
    }
  };

  const shareQR = async () => {
    if (!qrData) return;

    try {
      const base64Data = qrData.replace('data:image/png;base64,', '');
      const fileName = `QR Nạp tiền.png`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(filePath, base64Data, 'base64');

      await Share.share({
        url: `file://${filePath}`,
        title: t('qr.shareTitle'),
        message: t('qr.shareMessage', { amount: formatVND(amount) }),
      });
    } catch (error) {
      Alert.alert(t('qr.errorTitle'), t('qr.shareError'));
    }
  };

  const copyAccountNumber = () => {
    if (accountNumber) {
      Clipboard.setString(accountNumber);
      Alert.alert(t('qr.copiedTitle'), t('qr.copiedMessage'));
    }
  };

  const openInBank = () => {
    if (!currentBank) {
      Alert.alert(t('qr.noBank'), t('qr.noBankMessage'));
      return;
    }
    /*
     * Re-implemented VietQR deeplink
     * New required base format (per request): https://dl.vietqr.io/pay?app=vcb
     * Assumptions (can adjust if spec differs):
     *  - "app" query param maps to selected bank code (lowercased) used by VietQR to route to the correct banking app.
     *  - Include additional params for account, amount & description using commonly seen VietQR param names:
     *      acc  : destination account number
     *      amount: numeric amount (no thousand separators)
     *      des  : transfer content/description (URL-encoded)
     * If actual param names differ (e.g. "accountNo", "content"), update here accordingly.
     */
    const bankCode = currentBank.code?.toLowerCase();
    const numericAmount = amount || 0;
    const description = encodeURIComponent(transferContent || '');
    const deeplink = `https://dl.vietqr.io/pay?app=${bankCode}&acc=${accountNumber}&amount=${numericAmount}&des=${description}`;

    Linking.openURL(deeplink).catch(() => {
      Alert.alert(t('qr.openBank'), t('qr.openBankMessage'));
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />

      <ScreenHeader title={t('qrTitle')} centerTitle />

      <View style={styles.content}>
        {/* QR Code Display */}
        <View style={styles.qrContainer}>
          {qrMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Body style={styles.loadingText}>{t('qr.generating')}</Body>
            </View>
          ) : qrData ? (
            <Image source={{ uri: qrData }} style={styles.qrImage} resizeMode="contain" />
          ) : (
            <View style={styles.errorContainer}>
              <Body style={styles.errorText}>{t('qr.qrNotGenerated')}</Body>
            </View>
          )}
        </View>

        {/* Amount Display with Edit Button */}
        <View style={styles.inputSection}>
          {/* <Body style={styles.label}>{t('qr.amount')}</Body> */}
          <View style={styles.amountInputContainer}>
            <View style={styles.amountDisplay}>
              <Body style={styles.amountValue}>{formatVND(amount)}</Body>
            </View>
            <Button onPress={() => setShowAmountModal(true)} style={styles.editButton}>
              <HugeiconsIcon icon={PencilEdit02Icon} size={20} color={colors.light} />
            </Button>
          </View>
        </View>

        {/* Bank Selection */}
        <BankSelectionCard
          selectedBank={currentBank}
          onPress={() => setShowBankModal(true)}
        />

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <View style={styles.infoRow}>
            <Body style={styles.infoLabel}>{t('qr.accountHolder')}</Body>
            <Body style={styles.infoValue}>{bankAccount?.bankHolder || '---'}</Body>
          </View>
          <View style={styles.infoRow}>
            <Body style={styles.infoLabel}>{t('qr.accountNumber')}</Body>
            <View style={styles.infoValueWithCopy}>
              <Body style={styles.infoValue}>{accountNumber || '---'}</Body>
              {accountNumber && (
                <TouchableOpacity onPress={copyAccountNumber} style={styles.copyButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <HugeiconsIcon icon={Copy01Icon} size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.infoRow}>
            <Body style={styles.infoLabel}>{t('qr.transferContent')}</Body>
            <Body style={styles.infoValue}>{transferContent || '---'}</Body>
          </View>
        </View>
      </View>

      {/* Action Buttons - Sticky Bottom */}
      <View style={[styles.actionButtonsContainer, { paddingBottom: insets.bottom }]}>
        {/* Primary Action - Open in Bank */}
        <Button
          label={currentBank ? `${t('qr.openApp')} ${currentBank.shortName || currentBank.name}` : t('qr.selectBank')}
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<HugeiconsIcon icon={BankIcon} size={22} color={colors.light} />}
          onPress={openInBank}
          disabled={!currentBank || !qrData}
          style={styles.openBankButton}
        />

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <Button
            label={t('qr.download')}
            variant="tonal"
            size="md"
            leftIcon={<HugeiconsIcon icon={Download01Icon} size={18} color={colors.primary} />}
            onPress={downloadQR}
            disabled={!qrData}
            style={styles.secondaryButton}
          />
          <Button
            label={t('qr.share')}
            variant="tonal"
            size="md"
            leftIcon={<HugeiconsIcon icon={Share01Icon} size={18} color={colors.primary} />}
            onPress={shareQR}
            disabled={!qrData}
            style={styles.secondaryButton}
          />
        </View>
      </View>

      {/* Bank Selection Modal */}
      <BankSelectionModal
        visible={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSelectBank={handleBankSelect}
        selectedBank={currentBank}
      />

      {/* Amount Edit Modal */}
      <AddAmountModal
        isVisible={showAmountModal}
        onClose={handleAmountConfirm}
        initialAmount={amount.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: 140, // Add space for sticky action buttons
    backgroundColor: colors.background,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    padding: spacing.xs,
    backgroundColor: colors.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
  },
  inputSection: {
    // marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,

    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountDisplay: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  amountValue: {
    fontSize: 16,
    color: colors.text.primary,

  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  accountInfo: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    // marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text.primary,
  },
  infoValueWithCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  copyButton: {
    padding: spacing.xs,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  openBankButton: {
    borderRadius: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 10,
  }
});

export default QRCodeDepositScreen;
