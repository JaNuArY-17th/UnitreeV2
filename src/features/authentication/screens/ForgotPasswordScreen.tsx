import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, dimensions, typographyStyles } from '@/shared/themes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

import LogoHeader from '../components/LoginScreen/LogoHeader';
import FormContainer from '../components/LoginScreen/FormContainer';
import AuthInput from '../components/LoginScreen/AuthInput';
import LoginButton from '../components/LoginScreen/LoginButton';
import LoadingOverlay from '@/shared/components/LoadingOverlay';
import Mail from '@/shared/assets/icons/Mail';
import Lock from '@/shared/assets/icons/Lock';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';

const ForgotPasswordScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleSendEmail = async () => {
    setError('');
    if (!email.trim()) {
      setError(t('login:validation.emailRequired') || 'Email is required');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to send verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(2);
      setResendCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    if (!verificationCode.trim()) {
      setError('Verification code is required');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    if (!newPassword.trim()) {
      setError('Password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to reset password
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to resend verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResendCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    navigation.navigate('Login');
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.safeContainer, { paddingTop: insets.top }]}>
      <LoadingOverlay visible={isLoading} />

      <LogoHeader mascotVisible={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <FormContainer
            title={
              currentStep === 1
                ? t('login:forgotPassword')
                : currentStep === 2
                ? 'Verify Code'
                : currentStep === 3
                ? 'Reset Password'
                : 'Success'
            }
            onSignUp={() => navigation.navigate('Login')}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {currentStep === 1 && (
              <Animated.View entering={FadeInUp}>
                <AuthInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  icon={<Mail width={20} height={20} />}
                  editable={!isLoading}
                />
                <LoginButton
                  onPress={handleSendEmail}
                  disabled={isLoading || !email.trim()}
                  loading={isLoading}
                  title="Send Code"
                />
              </Animated.View>
            )}

            {currentStep === 2 && (
              <Animated.View entering={FadeInUp}>
                <AuthInput
                  label="Verification Code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
                {resendCountdown > 0 ? (
                  <Text style={styles.resendText}>
                    Resend code in {resendCountdown}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
                    <Text style={styles.resendLink}>
                      Didn't receive code? Resend
                    </Text>
                  </TouchableOpacity>
                )}
                <LoginButton
                  onPress={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  loading={isLoading}
                  title="Verify"
                />
              </Animated.View>
            )}

            {currentStep === 3 && (
              <Animated.View entering={FadeInUp}>
                <AuthInput
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  icon={<Lock width={20} height={20} />}
                  secureTextEntry
                  editable={!isLoading}
                />
                <AuthInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  icon={<Lock width={20} height={20} />}
                  secureTextEntry
                  editable={!isLoading}
                />
                <LoginButton
                  onPress={handleResetPassword}
                  disabled={
                    isLoading ||
                    !newPassword.trim() ||
                    !confirmPassword.trim()
                  }
                  loading={isLoading}
                  title="Reset Password"
                />
              </Animated.View>
            )}

            {currentStep === 4 && (
              <Animated.View entering={FadeInDown}>
                <View style={styles.successContainer}>
                  <Text style={styles.successTitle}>Password Reset</Text>
                  <Text style={styles.successMessage}>
                    Your password has been successfully reset.
                  </Text>
                  <LoginButton
                    onPress={handleSuccess}
                    disabled={false}
                    title="Back to Login"
                  />
                </View>
              </Animated.View>
            )}
          </FormContainer>
        </ScrollView>
      rdAvoidingView>
    </SafeAreaView>
  );
};

cosafeCst styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: dimensions.spacing.lg,
    paddingBottom: dimensions.spacing.xl,
  },
  errorContainer: {
    backgroundColor: colors.error,
    borderRadius: dimensions.radius.lg,
    padding: dimensions.spacing.md,
    marginBottom: dimensions.spacing.md,
  },
  errorText: {
    ...typographyStyles.caption,
    color: colors.text.light,
    textAlign: 'center',
  },
  resendText: {
    ...typographyStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: dimensions.spacing.md,
  },
  resendLink: {
    ...typographyStyles.caption,
    color: colors.primary,
    textAlign: 'center',
    marginVertical: dimensions.spacing.md,
    textDecorationLine: 'underline',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.xxxl,
  },
  successTitle: {
    ...typographyStyles.h0,
    color: colors.text.dark,
    marginBottom: dimensions.spacing.md,
  },
  successMessage: {
    ...typographyStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: dimensions.spacing.xxxl,
  },
});

export default ForgotPasswordScreen;
