import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OtpInput } from 'react-native-otp-entry';
import { colors, spacing } from '@/shared/themes';
import { Heading, Body, Text as BaseText, ErrorMessage } from '@/shared/components/base';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
import ChevronLeft from '@/shared/assets/icons/ChevronLeft';
import { useOTP } from '../hooks';
import type { OTPType, OTPSessionConfig } from '../types';
import { getOTPTypeTitle, getOTPTypeSubtitle, getOTPSuccessMessage } from '../utils';
import { useAlert } from '@/shared/providers/AlertProvider';

interface OTPVerificationScreenProps {
  // Optional props for direct usage
  phone?: string;
  type?: OTPType;
  config?: OTPSessionConfig;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  phone: propPhone,
  type: propType,
  config: propConfig,
  onSuccess: propOnSuccess,
  onError: propOnError,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { t } = useTranslation('otp');
  const { alert } = useAlert();

  // Get configuration from props or route params
  const phone = propPhone || route?.params?.phone || '';
  const type = propType || route?.params?.otpType || 'general';
  const contextFromRoute = route?.params?.context || {};
  const legacyOrderData = route?.params?.orderData;
  const legacyTransactionData = route?.params?.transactionData;
  
  // Handle legacy route params for withdrawal OTPs
  const legacyAccountId = route?.params?.accountId;
  const legacyAmount = route?.params?.amount;
  
  // Build context with legacy params for backward compatibility
  let buildContext = { ...contextFromRoute };
  if (legacyOrderData) buildContext.orderData = legacyOrderData;
  if (legacyTransactionData) buildContext.transactionData = legacyTransactionData;
  
  // For withdrawal OTPs, ensure accountId and amount are included
  if (type === 'withdraw') {
    if (legacyAccountId) buildContext.accountId = legacyAccountId;
    if (legacyAmount) buildContext.amount = legacyAmount;
    
    console.log('[DEBUG] OTPVerificationScreen: Building context for withdraw with accountId:', legacyAccountId);
  }
  
  const context = propConfig?.context || buildContext;
  const sessionConfig = propConfig || route?.params?.sessionConfig || {};


  // Handle success callback
  const handleSuccess = useCallback(async (result: any) => {
    if (propOnSuccess) {
      propOnSuccess(result);
      return;
    }

    // Default success handling based on OTP type
    try {
      switch (type) {
        case 'bank-withdraw':
          // Navigate to standard WithdrawSuccess screen for bank withdrawals
          navigation.replace('WithdrawSuccess', {
            withdrawResult: {
              amount: context?.amount || 0,
              accountNumber: context?.accountNumber || '',
              transferContent: context?.transferContent || '',
              fee: Math.min(Math.round((context?.amount || 0) * 0.001), 20000),
              netAmount: (context?.amount || 0) - Math.min(Math.round((context?.amount || 0) * 0.001), 20000),
              transactionId: `WTD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              processedAt: new Date().toLocaleString('vi-VN'),
              linkedBank: context?.linkedBank,
            },
          });
          break;

        case 'econtract-signing':
          // Handle econtract signing - call context.onSuccess callback
          if (context?.onSuccess) {
            await context.onSuccess(result);
          }
          break;

        case 'register':
        case 'login-new-device':
          // These types typically don't need special navigation as auth state change handles it
          const successMessage = getOTPSuccessMessage(type, t);
          alert(
            successMessage.title,
            result?.message || successMessage.message,
            [{ text: t('common.ok', 'OK'), onPress: () => navigation.navigate('Login') }]
          );
          break;

        default:
          // Use custom success screen if provided
          if (context?.successScreen) {
            navigation.replace(context.successScreen, context.successParams || {});
          } else {
            // Default success alert
            const successMessage = getOTPSuccessMessage(type, t);
            alert(
              successMessage.title,
              result?.message || successMessage.message,
              [{ text: t('common.ok', 'OK'), onPress: () => navigation.goBack() }]
            );
          }
          break;
      }
    } catch (error) {
      console.error('Error handling OTP success:', error);
    }
  }, [type, context, navigation, phone, t, alert, propOnSuccess]);

  // Handle error callback
  const handleError = useCallback((error: any) => {
    if (propOnError) {
      propOnError(error);
    }
    // Error display is handled by the hook and ErrorMessage component
  }, [propOnError]);

  // Use shared OTP hook
  const {
    config: otpConfig,
    formData,
    updateField,
    handleSubmit,
    handleResend,
    isSubmitting,
    isResending,
    error,
  } = useOTP({
    initialPhone: phone,
    type,
    config: sessionConfig.config,
    context,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const isComplete = formData.otp.length === otpConfig.codeLength;


  // Dynamic title and subtitle based on OTP type
  const title = getOTPTypeTitle(type, t);
  const subtitle = getOTPTypeSubtitle(type, phone, t);

  const onVerify = async () => {
    if (!isComplete || isSubmitting) return;

    try {
      await handleSubmit();
    } catch (error) {
      // Error handling is done by the hook
    }
  };

  const onResend = async () => {
    if (isResending) return;

    try {
      await handleResend();
    } catch (error) {
      // Error handling is done by the hook
    }
  };

  const onCodeChange = (text: string) => {
    updateField('otp', text);
    
    // Auto-submit if configured and code is complete
    if (otpConfig.autoSubmit && text.length === otpConfig.codeLength) {
      setTimeout(() => onVerify(), 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} testID="back-button">
          <ChevronLeft color={colors.text.primary} />
        </Pressable>
        <View style={styles.spacer} />
        <LanguageSwitcher />
      </View>

      <View style={styles.content}>
        <View style={styles.formArea}>
          <Heading level={1} style={styles.title}>{title}</Heading>
          <Body style={styles.subtitle}>{subtitle}</Body>

          <View style={styles.codeContainer}>
            <OtpInput
              numberOfDigits={otpConfig.codeLength || 6}
              focusColor={colors.primary}
              focusStickBlinkingDuration={500}
              onTextChange={onCodeChange}
              onFilled={otpConfig.autoSubmit ? onVerify : undefined}
              textInputProps={{
                accessibilityLabel: "One-Time Password",
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

          {error && (
            <ErrorMessage
              message={error}
              visible={!!error}
              style={styles.errorMessage}
            />
          )}

          <Pressable
            onPress={onVerify}
            style={[styles.verifyButton, (!isComplete || isSubmitting) && styles.verifyButtonDisabled]}
            disabled={!isComplete || isSubmitting}
            testID="verify-button"
          >
            <BaseText style={[styles.verifyButtonText, (!isComplete || isSubmitting) && styles.verifyButtonTextDisabled]}>
              {isSubmitting ? t('verifying') : t('verify')}
            </BaseText>
          </Pressable>
        </View>

        <View style={styles.resendArea}>
          <Body style={styles.resendText}>{t('noCode')}</Body>
          <Pressable onPress={onResend} disabled={isResending} testID="resend-button">
            <Body style={[styles.resendLink, isResending && styles.resendLinkDisabled]}>
              {isResending ? t('resending') : t('resend')}
            </Body>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  spacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  formArea: {
    flex: 1,
    paddingTop: spacing.xxl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: spacing.xxxl,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  // OTP Input styles
  otpContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.light,
  },
  otpBoxFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  otpText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
  },
  otpFocusStick: {
    backgroundColor: colors.primary,
    height: 2,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  verifyButtonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButtonTextDisabled: {
    color: colors.text.secondary,
  },
  resendArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  resendText: {
    color: colors.text.secondary,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: colors.text.secondary,
  },
  errorMessage: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});

export default OTPVerificationScreen;
