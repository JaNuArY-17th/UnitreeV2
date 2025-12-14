import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, View, BackHandler, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OtpInput } from 'react-native-otp-entry';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { Body, ErrorMessage, KeyboardDismissWrapper } from '@/shared/components/base';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import HapticFeedback from 'react-native-haptic-feedback';
import { commissionService } from '../services/commissionService';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

interface CommissionOtpScreenProps {
  tempRequestId?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

type CommissionOtpScreenRouteProp = RouteProp<any, any>;

const CommissionOtpScreen: React.FC<CommissionOtpScreenProps> = ({
  tempRequestId: propTempRequestId,
  onSuccess: propOnSuccess,
  onError: propOnError,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<CommissionOtpScreenRouteProp>();
  const { t } = useTranslation('commission');

  // Get params from route or props
  const tempRequestId = propTempRequestId || route?.params?.tempRequestId || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);

  // Countdown timer for resend
  useEffect(() => {
    const id = setInterval(() => setCountdown(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const handleVerifyOtp = async (code?: string) => {
    const codeToVerify = code || otp;
    if (codeToVerify.length !== CODE_LENGTH || isVerifying) return;

    HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
    setIsVerifying(true);
    setError('');
    try {
      const response = await commissionService.verifyCommissionPaymentOtp({
        tempRequestId: tempRequestId,
        otp: codeToVerify,
      });

      if (response.success) {
        HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
        // Navigate to success screen
        navigation.navigate('CommissionPaymentSuccess' as any, {
          paymentResult: response.data,
        });

        if (propOnSuccess) {
          propOnSuccess();
        }
      } else {
        throw new Error(response.message || t('otpVerificationFailed', 'OTP verification failed'));
      }
    } catch (error: any) {
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });
      setError(error?.message || t('otpVerificationFailed', 'OTP verification failed'));
      setIsVerifying(false);
      setOtp('');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    HapticFeedback.trigger('impactMedium', { enableVibrateFallback: true });
    setIsResending(true);
    setError('');
    try {
      const response = await commissionService.resendCommissionPaymentOtp({
        requestId: tempRequestId,
      });

      if (response.success) {
        HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
        setCountdown(RESEND_SECONDS);
      } else {
        throw new Error(response.message || t('otpResendFailed', 'Failed to resend OTP'));
      }
    } catch (error: any) {
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });
      setError(error?.message || t('otpResendFailed', 'Failed to resend OTP. Please try again.'));
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
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('commissionPaymentOtp', 'Commission Payment OTP')}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardDismissWrapper style={styles.content}>
        <View style={styles.formArea}>
          <Body style={styles.subtitle}>
            {t('otpSentMessage', 'We have sent a 6-digit OTP to your registered phone number')}
          </Body>
          <View style={styles.codeContainer}>
            <OtpInput
              numberOfDigits={CODE_LENGTH}
              focusColor={colors.primary}
              focusStickBlinkingDuration={500}
              onTextChange={onCodeChange}
              onFilled={handleVerifyOtp}
              textInputProps={{
                accessibilityLabel: 'Commission Payment OTP',
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
            <Body style={styles.resendText}>{t('didNotReceiveOtp', "Didn't receive the code?")}</Body>
            <Pressable onPress={handleResendOtp} disabled={countdown > 0 || isResending} style={styles.resendButton}>
              <Body style={[styles.resendLink, (countdown > 0 || isResending) && styles.resendLinkDisabled]}>
                {countdown > 0
                  ? t('resendIn', { seconds: countdown }) || `Resend in ${countdown}s`
                  : isResending
                    ? t('resending', 'Resending...') || 'Resending...'
                    : t('resendOtp', 'Resend OTP') || 'Resend OTP'}
              </Body>
            </Pressable>
          </View>
        </View>
      </KeyboardDismissWrapper>
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
  resendLink: { color: colors.primary, fontFamily: getFontFamily(FONT_WEIGHTS.BOLD) },
  resendLinkDisabled: { color: colors.text.secondary, textDecorationLine: 'none' },
});

export default CommissionOtpScreen;
