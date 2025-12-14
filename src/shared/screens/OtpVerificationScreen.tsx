
import React, { useState, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OtpInput } from 'react-native-otp-entry';
import { colors, spacing } from '@/shared/themes';
import typographyStyles from '@/shared/themes/typography';
import { ErrorMessage, KeyboardDismissWrapper, Text } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import HapticFeedback from 'react-native-haptic-feedback';
import ScreenHeader from '@/shared/components/ScreenHeader';
import Button from '@/shared/components/base/Button';

export interface OtpVerificationScreenProps {
  title?: string;
  subtitle?: string;
  codeLength?: number;
  resendSeconds?: number;
  onVerify?: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  onBackPress?: () => void;
  errorText?: string;
  resendText?: string;
  resendButtonText?: string;
  resendButtonDisabledText?: string;
  continueButtonText?: string;
  style?: any;
  loading?: boolean;
}

const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  title,
  subtitle,
  codeLength = 6,
  resendSeconds = 30,
  onVerify,
  onResend,
  onBackPress,
  errorText,
  resendText,
  resendButtonText,
  resendButtonDisabledText,
  continueButtonText,
  style,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Set default values using translations
  const defaultTitle = t('otp.title');
  const defaultSubtitle = t('otp.subtitle');
  const defaultResendText = t('otp.resendText');
  const defaultResendButtonText = t('otp.resendButtonText');
  const defaultResendButtonDisabledText = t('otp.resendButtonDisabledText');
  const defaultContinueButtonText = t('otp.continueButtonText') || 'Continue';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState(errorText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(resendSeconds);
  const [isResending, setIsResending] = useState(false);
  const otpInputRef = useRef<any>(null);

  // Animation values
  const otpContainerScale = useSharedValue(1);
  const errorShake = useSharedValue(0);
  const fadeInValue = useSharedValue(0);

  useEffect(() => {
    fadeInValue.value = withTiming(1, { duration: 600 });
  }, [fadeInValue]);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);



  const handleVerify = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp;
    if (codeToVerify.length !== codeLength || isSubmitting) return;

    // Additional protection: prevent rapid duplicate calls by checking if already submitting
    if (isSubmitting) {
      console.warn('🛡️ [OTP] Preventing duplicate verification call - already submitting');
      return;
    }

    HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
    setIsSubmitting(true);
    setError('');
    try {
      if (onVerify) await onVerify(codeToVerify);
      setIsSubmitting(false);
    } catch (e: any) {
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });
      errorShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      otpContainerScale.value = withSequence(
        withSpring(1.05, { damping: 20, stiffness: 300 }),
        withSpring(1, { damping: 20, stiffness: 300 })
      );
      setError(e?.message || errorText || 'Invalid OTP. Please try again.');
      setIsSubmitting(false);
      setOtp('');
      setTimeout(() => {
        if (otpInputRef.current) {
          if (typeof otpInputRef.current.clear === 'function') {
            otpInputRef.current.clear();
          }
          if (typeof otpInputRef.current.focus === 'function') {
            otpInputRef.current.focus();
          }
        }
      }, 100);
    }
  };

  const handleResend = async () => {
    if (seconds > 0 || isResending) return;
    HapticFeedback.trigger('impactMedium', { enableVibrateFallback: true });
    setIsResending(true);
    setError('');
    try {
      if (onResend) await onResend();
      setSeconds(resendSeconds);
      setOtp('');
    } catch (e: any) {
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });
      setError(e?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const onCodeChange = (text: string) => {
    setOtp(text);
    if (error) setError('');
    if (text.length > otp.length) {
      HapticFeedback.trigger('selection', { enableVibrateFallback: false });
    }
    // Auto-trigger verification when OTP is complete
    if (text.length === codeLength) {
      handleVerify(text);
    }
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
    transform: [{ translateY: interpolate(fadeInValue.value, [0, 1], [20, 0]) }],
  }));

  const otpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: otpContainerScale.value },
      { translateX: errorShake.value }
    ],
  }));

  return (
    <View style={[styles.container, style]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardDismissWrapper style={StyleSheet.flatten([styles.container, { paddingTop: insets.top }])}>
        <ScreenHeader
          title={title || defaultTitle}
          showBack={true}
          onBackPress={onBackPress}
        />

        <View style={styles.content}>
          <Animated.View style={[styles.formArea, containerAnimatedStyle]}>
            <Text variant="body" style={styles.subtitle}>
              {subtitle || defaultSubtitle}
            </Text>

            <Animated.View style={[styles.codeContainer, otpAnimatedStyle]}>
              <OtpInput
                ref={otpInputRef}
                numberOfDigits={codeLength}
                focusColor={colors.primary}
                focusStickBlinkingDuration={500}
                onTextChange={onCodeChange}
                disabled={isSubmitting}
                textInputProps={{
                  accessibilityLabel: title,
                  autoComplete: 'sms-otp',
                  textContentType: 'oneTimeCode',
                  editable: !isSubmitting,
                }}
                theme={{
                  containerStyle: styles.otpContainer,
                  pinCodeContainerStyle: styles.otpBox,
                  pinCodeTextStyle: styles.otpText,
                  focusStickStyle: styles.otpFocusStick,
                  focusedPinCodeContainerStyle: styles.otpBoxFocused,
                }}
              />
            </Animated.View>

            {error && (
              <ErrorMessage message={error} visible={!!error} style={styles.errorMessage} />
            )}

            <View style={styles.resendArea}>
              <Text variant="body" style={styles.resendText}>
                {resendText || defaultResendText}
              </Text>
              <Pressable
                onPress={handleResend}
                disabled={seconds > 0 || isResending}
                style={({ pressed }) => [
                  styles.resendButton,
                  pressed && styles.resendButtonPressed
                ]}
              >
                <Text
                  variant="body"
                  style={[
                    styles.resendLink,
                    (seconds > 0 || isResending) && styles.resendLinkDisabled
                  ]}
                >
                  {seconds > 0
                    ? `${resendButtonDisabledText || defaultResendButtonDisabledText} ${seconds}s`
                    : isResending
                      ? 'Resending...'
                      : resendButtonText || defaultResendButtonText}
                </Text>
              </Pressable>
            </View>

            <Button
              label={continueButtonText || defaultContinueButtonText}
              onPress={() => handleVerify()}
              disabled={otp.length !== codeLength || isSubmitting}
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
            />
          </Animated.View>
        </View>
      </KeyboardDismissWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  formArea: {
    flex: 1,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  subtitle: {
    ...typographyStyles.body,
    // width: '80%',
    textAlign: 'center',
    lineHeight: 22,
    // color: colors.text.secondary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  codeContainer: {
    alignItems: 'center',
    // marginBottom: spacing.lg,
  },
  otpContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 0.5,
    // borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.light,
  },
  otpBoxFocused: {
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: colors.light,
  },
  otpText: {
    ...typographyStyles.h1,
    textAlign: 'center',
    color: colors.primary,
  },
  otpFocusStick: {
    backgroundColor: colors.primary,
    height: 3,
    borderRadius: 2,
  },
  errorMessage: {
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  resendArea: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  resendText: {
    ...typographyStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  resendButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  resendButtonPressed: {
    opacity: 0.6,
  },
  resendLink: {
    ...typographyStyles.body,
    color: colors.primary,
  },
  resendLinkDisabled: {
    ...typographyStyles.body,
    color: colors.text.secondary,
  },
});

export default OtpVerificationScreen;
