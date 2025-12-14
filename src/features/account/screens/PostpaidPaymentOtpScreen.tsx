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
import { useTranslation } from '@/shared/hooks/useTranslation';
import HapticFeedback from 'react-native-haptic-feedback';
import TransferProcessingModal from '@/features/payment/components/TransferProcessingModal';
import {
  usePostpaidPaymentVerify,
  usePostpaidPaymentResendOtp
} from '../hooks/usePostpaidPayment';
import type { RootStackParamList } from '@/navigation/types';

const CODE_LENGTH = 6;
const FAKE_OTP = '123456';
const RESEND_SECONDS = 30;

interface PaymentData {
  amount: number;
  postpaidData: {
    userId: string;
    creditLimit: number;
    spentCredit: number;
    commissionPercent: number;
    status: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
  };
  paymentSource: {
    id: string;
    type: 'main_account' | 'espay_later';
    balance: number;
    accountNumber?: string;
    status?: string;
    bankName?: string;
    isDefault?: boolean;
  };
  tempRequestId: string;
  phoneNumber: string;
  expireInSeconds: number;
}

interface RouteParams {
  paymentData: PaymentData;
}

type PostpaidPaymentOtpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PostpaidPaymentOtpScreenRouteProp = RouteProp<any, any>;

const PostpaidPaymentOtpScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PostpaidPaymentOtpScreenNavigationProp>();
  const route = useRoute<PostpaidPaymentOtpScreenRouteProp>();
  const { paymentData } = route.params as RouteParams;
  const { t } = useTranslation('account');

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [seconds, setSeconds] = useState(paymentData?.expireInSeconds ?? RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);

  // Postpaid payment API hooks
  const verifyMutation = usePostpaidPaymentVerify();
  const resendMutation = usePostpaidPaymentResendOtp();

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
      const result = await verifyMutation.mutateAsync({
        tempRequestId: paymentData?.tempRequestId,
        otp: codeToVerify,
      });

      if (result.success && result.data) {
        HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
        setIsSubmitting(false);
        setIsProcessing(true);
        await processPayment(result.data);
      } else {
        throw new Error(result.message || t('loan.otpInvalid') || 'Mã OTP không hợp lệ. Vui lòng thử lại.');
      }
    } catch (e: any) {
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });
      setError(e?.message || t('loan.otpInvalid') || 'Mã OTP không hợp lệ. Vui lòng thử lại.');
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

  const processPayment = async (paymentResult: any) => {
    // Simulate server processing
    await new Promise(r => setTimeout(r, 2200));

    navigation.replace('PostpaidPaymentSuccess' as any, {
      paymentResult: {
        ...paymentData,
        paymentSource: paymentData.paymentSource,
        paidAmount: paymentResult.paidAmount,
        status: paymentResult.status,
        spentCredit: paymentResult.spentCredit,
        paymentTime: new Date().toISOString(),
        paymentStatus: 'completed'
      }
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
      const result = await resendMutation.mutateAsync({
        tempRequestId: paymentData?.tempRequestId,
      });

      if (result.success) {
        HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
        setSeconds(RESEND_SECONDS);
        setOtp('');
      } else {
        throw new Error(result.message || t('loan.resendFailed') || 'Không thể gửi lại mã OTP');
      }
    } catch (e: any) {
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });
      setError(e?.message || t('loan.resendFailed') || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
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
  };

  const maskPhoneNumber = (phone: string): string => {
    if (phone.length <= 4) return phone;
    const start = phone.slice(0, 3);
    const end = phone.slice(-2);
    const middle = '*'.repeat(phone.length - 5);
    return `${start}${middle}${end}`;
  };

  const maskedPhone = maskPhoneNumber(paymentData.phoneNumber);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('loan.otpVerification') || 'Xác thực OTP'}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardDismissWrapper style={styles.content}>
        <View style={styles.formArea}>
          <Body style={styles.subtitle}>
            {t('loan.otpSentTo') || 'Nhập mã 6 số được gửi đến'} {maskedPhone} {t('loan.toConfirm') || 'để xác nhận thanh toán này.'}
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
                accessibilityLabel: 'Postpaid Payment OTP',
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
            <ErrorMessage
              message={error}
              style={styles.errorMessage}
            />
          ) : null}

          <View style={styles.resendContainer}>
            <Body style={styles.resendText}>
              {t('loan.didntReceiveCode') || "Không nhận được mã?"}{' '}
            </Body>
            <Pressable onPress={onResend} disabled={seconds > 0 || isResending}>
              <Body style={[
                styles.resendButton,
                { color: seconds > 0 || isResending ? colors.gray : colors.primary }
              ]}>
                {isResending ? (t('loan.resending') || 'Đang gửi...') :
                  seconds > 0 ? `${t('loan.resendIn') || 'Gửi lại sau'} ${seconds}s` :
                    (t('loan.resend') || 'Gửi lại')
                }
              </Body>
            </Pressable>
          </View>
        </View>
      </KeyboardDismissWrapper>

      {/* Processing Modal */}
      {isProcessing && (
        <TransferProcessingModal
          title={t('loan.processingPayment') || 'Đang xử lý thanh toán'}
          subtitle={t('loan.processingSubtitle') || 'Vui lòng chờ trong khi chúng tôi xử lý thanh toán của bạn...'}
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
  otpBoxFocused: { borderColor: colors.primary },
  otpText: {
    fontSize: 20,

    color: colors.text.primary,
  },
  otpFocusStick: { backgroundColor: colors.primary },
  errorMessage: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  resendText: { color: colors.text.secondary },
  resendButton: { fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR) },
});

export default PostpaidPaymentOtpScreen;
export { PostpaidPaymentOtpScreen };
