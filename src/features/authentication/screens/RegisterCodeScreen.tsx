import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, dimensions, typography } from '@/shared/themes';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

import LogoHeader from '../components/LoginScreen/LogoHeader';
import FormContainer from '../components/LoginScreen/FormContainer';
import AuthInput from '../components/LoginScreen/AuthInput';
import LoadingOverlay from '@/shared/components/LoadingOverlay';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { Button } from '@/shared/components';

const RegisterCodeScreen: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RegisterCode'>>();
  const email = route.params?.email || '';

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('RegisterComplete', { email });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid verification code');
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
      Alert.alert('Error', err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
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
            title="Verify Code"
            onSignUp={() => navigation.navigate('Login')}>
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
              <Text style={styles.resendLink} onPress={handleResendCode}>
                Didn't receive code? Resend
              </Text>
            )}
            <Button
              onPress={handleVerifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              loading={isLoading}
              label="Verify"
            />
          </FormContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
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
  resendText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: dimensions.spacing.md,
  },
  resendLink: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    marginVertical: dimensions.spacing.md,
    textDecorationLine: 'underline',
  },
});

export default RegisterCodeScreen;
