import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, dimensions, typography } from '@/shared/themes';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

import AuthInput from '../components/LoginScreen/AuthInput';
import LoadingOverlay from '@/shared/components/LoadingOverlay';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { KeyboardDismissWrapper, ScreenHeader, Text, Button } from '../../../shared/components';
import { Verify } from '../../../shared/assets';

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
      Alert.alert(t('register:error_title'), t('register:errors.invalid_6digit_code'));
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('RegisterComplete', { email });
    } catch (err: any) {
      Alert.alert(t('register:error_title'), err.message || t('register:errors.invalid_code'));
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
      Alert.alert(t('register:error_title'), err.message || t('register:errors.failed_to_resend'));
    } finally {
      setIsLoading(false);
    }
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.safeContainer, { paddingTop: insets.top }]}>
      <LoadingOverlay visible={isLoading} />
      <ScreenHeader title={t('register:register_step_2')} titleStyle={styles.titleStyle} backIconColor={colors.text.light} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <KeyboardDismissWrapper>
          <Text style={styles.instructionText}>{t('register:instructions_code')}</Text>
          <AuthInput
            label={t('register:verification_code')}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder={t('register:verification_code_placeholder')}
            keyboardType="number-pad"
            editable={!isLoading}
          />
          <Button
            onPress={handleVerifyCode}
            disabled={isLoading || verificationCode.length !== 6}
            loading={isLoading}
            size='lg'
            variant='primary'
            label={isLoading ? t('register:verifying') : t('register:verify')}
            style={styles.button}
            textStyle={styles.buttonText}
            leftIcon={Verify({ width: 24, height: 24, color: colors.text.light })}
          />
          {resendCountdown > 0 ? (
            <Text style={styles.resendText}>
              {t('register:resend_code')} {resendCountdown}s
            </Text>
          ) : (
            <Text style={styles.resendLink} onPress={handleResendCode}>
              {t('register:resend_link')}
            </Text>
          )}
        </KeyboardDismissWrapper>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  titleStyle: {
    ...typography.h2,
    color: colors.text.light,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: dimensions.spacing.lg,
  },
  instructionText: {
    ...typography.subtitle,
    color: colors.text.light,
    marginBottom: dimensions.spacing.md,
  },
  resendText: {
    ...typography.subtitle,
    color: colors.text.light,
    textAlign: 'center',
    marginVertical: dimensions.spacing.md,
    opacity: 0.8,
  },
  resendLink: {
    ...typography.subtitle,
    color: colors.text.light,
    textAlign: 'center',
    marginVertical: dimensions.spacing.md,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    ...typography.subtitle,
    color: colors.text.light,
  },
});

export default RegisterCodeScreen;
