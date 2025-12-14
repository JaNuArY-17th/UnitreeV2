import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, BackHandler, Keyboard } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors } from '@/shared/themes';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import HapticFeedback from 'react-native-haptic-feedback';
import TransferProcessingModal from '../components/TransferProcessingModal';
import { useTransferVerify, useTransferResendOtp } from '../hooks/useTransfer';
import type { TransferRecipient } from '../types/transfer';
import type { PaymentSource } from '../components/PaymentSourceCard';
import OtpVerificationScreen from '@/shared/screens/OtpVerificationScreen';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

interface TransferData {
  amount: string;
  recipient: TransferRecipient;
  paymentSource: PaymentSource;
  tempTransactionId: string;
  phoneNumber: string;
  expireInSeconds: number;
}

interface RouteParams {
  transferData: TransferData;
}

type TransferOtpScreenRouteProp = RouteProp<any, any>;

const TransferOtpScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<TransferOtpScreenRouteProp>();
  const queryClient = useQueryClient();
  const { transferData } = route.params as RouteParams;
  const { t } = useTranslation('payment');

  const [isProcessing, setIsProcessing] = useState(false);

  // Transfer API hooks
  const verifyMutation = useTransferVerify();
  const resendMutation = useTransferResendOtp();

  const verificationInProgress = useRef(false);

  // Dismiss keyboard when processing
  useEffect(() => {
    if (isProcessing) {
      Keyboard.dismiss();
    }
  }, [isProcessing]);

  // Prevent back during processing
  useEffect(() => {
    if (isProcessing) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [isProcessing]);

  const handleVerify = async (otp: string) => {
    if (otp.length !== CODE_LENGTH || verificationInProgress.current) return;

    // Prevent duplicate API calls
    verificationInProgress.current = true;

    try {
      const result = await verifyMutation.mutateAsync({
        tempTransactionId: transferData?.tempTransactionId,
        otp,
      });

      if (result.success && result.data) {
        HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
        setIsProcessing(true);
        await processTransfer(result.data);
      } else {
        throw new Error(result.message || t('transfer.otpInvalid') || 'Invalid OTP. Please try again.');
      }
    } catch (e: any) {
      verificationInProgress.current = false; // Reset flag on error
      throw e; // Re-throw to let OtpVerificationScreen handle the error display
    }
  };

  const processTransfer = async (transferResult: any) => {
    // Simulate server processing
    await new Promise<void>(resolve => setTimeout(() => resolve(), 2200));

    // Invalidate caches so fresh data is fetched when user navigates
    // Transactions list will be refreshed
    queryClient.invalidateQueries({ queryKey: ['transaction', 'list'] });
    // Bank balance will be refreshed
    queryClient.invalidateQueries({ queryKey: ['bank'] });
    // Notifications might include transaction info
    queryClient.invalidateQueries({ queryKey: ['notifications'] });

    console.log('🔄 [TransferOtp] Cache invalidated after successful transfer');

    navigation.replace('TransferSuccess' as any, {
      transferResult: {
        ...transferData,
        transactionId: transferResult.transactionId,
        transactionCode: transferResult.transactionCode,
        description: transferResult.description,
        transferTime: new Date().toISOString(),
        status: 'completed'
      }
    });
  };

  const handleResend = async () => {
    // Reset verification flag when resending OTP
    verificationInProgress.current = false;

    const result = await resendMutation.mutateAsync({
      tempTransactionId: transferData?.tempTransactionId,
    });

    if (!result.success) {
      throw new Error(result.message || t('transfer.resendFailed') || 'Failed to resend OTP');
    }

    HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
  };

  const maskPhoneNumber = (phone: string): string => {
    if (phone.length <= 4) return phone;
    const start = phone.slice(0, 3);
    const end = phone.slice(-2);
    const middle = '*'.repeat(phone.length - 5);
    return `${start}${middle}${end}`;
  };

  const maskedPhone = maskPhoneNumber(transferData.phoneNumber);

  return (
    <View style={styles.container}>
      <OtpVerificationScreen
        title={t('transfer.otpVerification') || 'Transfer Verification'}
        subtitle={`${t('transfer.otpSentTo') || 'Enter the 6-digit code sent to'} ${maskedPhone} ${t('transfer.toConfirm') || 'to confirm this transfer.'}`}
        codeLength={CODE_LENGTH}
        resendSeconds={transferData?.expireInSeconds ?? RESEND_SECONDS}
        onVerify={handleVerify}
        onResend={handleResend}
        onBackPress={() => navigation.goBack()}
        resendText={t('transfer.didNotReceive') || "Didn't receive the code?"}
        resendButtonText={t('transfer.resendCode') || 'Resend code'}
        resendButtonDisabledText={t('transfer.resendIn', { seconds: '' }).replace(/\d+s?/, '').trim() || 'Resend in'}
        continueButtonText={t('transfer.verifyTransfer') || 'Verify Transfer'}
      />

      {isProcessing && (
        <TransferProcessingModal
          title={t('transfer.processing') || 'Processing Transfer'}
          subtitle={t('transfer.processingSubtitle') || 'Please wait while we process your transfer...'}
          preventBackButton
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
});

export default TransferOtpScreen;
export { TransferOtpScreen };
