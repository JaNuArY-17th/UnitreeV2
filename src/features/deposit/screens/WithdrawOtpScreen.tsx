import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, BackHandler, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OtpInput } from 'react-native-otp-entry';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { Body, ErrorMessage, KeyboardDismissWrapper } from '@/shared/components/base';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation';
import { useTranslation } from '@/shared/hooks/useTranslation';
import HapticFeedback from 'react-native-haptic-feedback';
import WithdrawProcessingModal from '../components/WithdrawProcessingModal';
import { useWithdrawVerify, useWithdrawResendOTP } from '../hooks/withdraw';

const CODE_LENGTH = 6;
const FAKE_OTP = '123456';
const RESEND_SECONDS = 30;

type WithdrawOtpRouteProp = RouteProp<RootStackParamList, 'WithdrawOtp'>;

const WithdrawOtpScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<WithdrawOtpRouteProp>();
  const { withdrawData } = route.params;
  const { t: tWithdraw } = useTranslation('withdraw');

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [seconds, setSeconds] = useState(withdrawData?.otpExpirySeconds ?? RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);
  // Withdraw API hooks
  const verifyMutation = useWithdrawVerify();
  const resendMutation = useWithdrawResendOTP();

  const otpInputRef = useRef<any>(null);
  const verificationInProgress = useRef(false);

  // Countdown timer
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  // Dismiss keyboard when processing
  useEffect(() => {
    if (isProcessing) {
      Keyboard.dismiss();
      if (otpInputRef.current && typeof otpInputRef.current.blur === 'function') {
        otpInputRef.current.blur();
      }
    }
  }, [isProcessing]);

  // Prevent back during processing
  useEffect(() => {
    if (isProcessing) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [isProcessing]);

  const verifyOtp = async (code?: string) => {
    const codeToVerify = code || otp;
    if (codeToVerify.length !== CODE_LENGTH || isSubmitting || isProcessing || verificationInProgress.current) return;

    // Prevent duplicate API calls
    verificationInProgress.current = true;

    HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
    setIsSubmitting(true);
    setError('');
    try {
      await verifyMutation.mutateAsync({
        tempTransactionId: withdrawData?.requestId,
        otp: codeToVerify,
      });
      HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
      setIsSubmitting(false);
      setIsProcessing(true);
      await processWithdraw();
    } catch (e: any) {
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });
      setError(e?.message || tWithdraw('otp.error.invalidOtp', 'Invalid OTP. Please try again.'));
      setIsSubmitting(false);
      verificationInProgress.current = false; // Reset flag on error
      setOtp('');
      setTimeout(() => {
        if (otpInputRef.current) {
          if (typeof otpInputRef.current.clear === 'function') otpInputRef.current.clear();
          if (typeof otpInputRef.current.focus === 'function') otpInputRef.current.focus();
        }
      }, 80);
    }
  };

  const processWithdraw = async () => {
    // Simulate server processing
    await new Promise(r => setTimeout(r, 2200));

    const transactionId = `WTD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const fee = Math.min(Math.round(withdrawData.amount * 0.001), 20000); // Example: 0.1% capped
    const netAmount = withdrawData.amount - fee;
    const processedAt = new Date().toLocaleString('vi-VN');

    navigation.replace('WithdrawSuccess', {
      withdrawResult: {
        amount: withdrawData.amount,
        accountNumber: withdrawData.accountNumber,
        transferContent: withdrawData.transferContent,
        fee,
        netAmount,
        transactionId,
        processedAt,
        linkedBank: withdrawData.linkedBank,
      },
    });
  };

  const onResend = async () => {
    if (seconds > 0 || isResending) return;
    HapticFeedback.trigger('impactMedium', { enableVibrateFallback: true });
    setIsResending(true);
    setError('');
    // Reset verification flag when resending OTP
    verificationInProgress.current = false;
    try {
      await resendMutation.mutateAsync({
        tempTransactionId: withdrawData?.requestId,
      });
      HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
      setSeconds(RESEND_SECONDS);
      setOtp('');
    } catch (e: any) {
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });
      setError(e?.message || tWithdraw('otp.error.resendFailed', 'Failed to resend OTP. Please try again.'));
    } finally {
      setIsResending(false);
    }
  };

  const onCodeChange = (val: string) => {
    setOtp(val);
    if (error) setError('');
    if (val.length > otp.length) {
      HapticFeedback.trigger('selection', { enableVibrateFallback: false });
    }
    // Reset verification flag when user starts typing again
    if (val.length < CODE_LENGTH) {
      verificationInProgress.current = false;
    }
    // Removed automatic verification here to prevent duplicate calls
    // The onFilled prop will handle verification when OTP is complete
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={tWithdraw('otp.title', 'Confirm Withdrawal')} onBackPress={() => navigation.goBack()} />
      <KeyboardDismissWrapper style={styles.content}>
        <View style={styles.formArea}>
          <Body style={styles.subtitle}>
            {tWithdraw('otp.subtitle', 'Enter the 6-digit code sent to your phone to confirm this withdrawal.')}
          </Body>
          <View style={styles.codeContainer}>
            <OtpInput
              ref={otpInputRef}
              numberOfDigits={CODE_LENGTH}
              focusColor={colors.primary}
              focusStickBlinkingDuration={500}
              onTextChange={onCodeChange}
              onFilled={verifyOtp}
              textInputProps={{
                accessibilityLabel: 'Withdrawal OTP',
                autoComplete: 'sms-otp',
                textContentType: 'oneTimeCode',
              }}
              theme={{
                containerStyle: styles.otpContainer,
                pinCodeContainerStyle: styles.otpBox,
                pinCodeTextStyle: styles.otpText,
                focusStickStyle: styles.otpFocusStick,
                focusedPinCodeContainerStyle: styles.otpBoxFocused,
              }}
            />
          </View>

          {error ? (
            <ErrorMessage message={error} visible style={styles.errorMessage} />
          ) : null}

          <View style={styles.resendArea}>
            <Body style={styles.resendText}>{tWithdraw('otp.noCode', "Didn't receive the code?")}</Body>
            <Pressable onPress={onResend} disabled={seconds > 0 || isResending} style={styles.resendButton}>
              <Body style={[styles.resendLink, (seconds > 0 || isResending) && styles.resendLinkDisabled]}>
                {seconds > 0
                  ? tWithdraw('otp.resendIn', { seconds })
                  : isResending
                    ? tWithdraw('otp.resending', 'Resending...')
                    : tWithdraw('otp.resend', 'Resend code')}
              </Body>
            </Pressable>
          </View>
        </View>
      </KeyboardDismissWrapper>

      {isProcessing && (
        <WithdrawProcessingModal
          title={tWithdraw('processing.title', 'Processing Withdrawal')}
          subtitle={tWithdraw('processing.subtitle', 'Please wait while we finalize your withdrawal...')}
          preventBackButton
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  formArea: { flex: 1, paddingTop: spacing.xl },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    lineHeight: 22,
    fontSize: 16,
  },
  codeContainer: { alignItems: 'center', marginBottom: spacing.md },
  otpContainer: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.light,
  },
  otpBoxFocused: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primaryLight },
  otpText: { fontSize: 26, color: colors.text.primary, textAlign: 'center' },
  otpFocusStick: { backgroundColor: colors.primary, height: 3, borderRadius: 2 },
  errorMessage: { marginBottom: spacing.lg, marginHorizontal: spacing.md },
  resendArea: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: spacing.lg,
  },
  resendText: { color: colors.text.secondary, textAlign: 'center', marginRight: spacing.xs, fontSize: 15 },
  resendButton: { padding: spacing.xs, borderRadius: 6 },
  resendLink: { color: colors.primary, },
  resendLinkDisabled: { color: colors.text.secondary, textDecorationLine: 'none' },
});

export default WithdrawOtpScreen;
