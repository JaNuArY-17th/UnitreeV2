import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, dimensions, typography } from '@/shared/themes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

import AuthInput from '../components/LoginScreen/AuthInput';
import LoadingOverlay from '@/shared/components/LoadingOverlay';
import { Mail, SignUp } from '@/shared/assets/icons';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { KeyboardDismissWrapper, ScreenHeader, Text, Button } from '../../../shared/components';

const RegisterEmailScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSendEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Error', t('login:validation.emailRequired') || 'Email is required');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to send verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('RegisterCode', { email });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.safeContainer, { paddingTop: insets.top }]}>
      <LoadingOverlay visible={isLoading} />
      <ScreenHeader title={t('register:register_step_1')} titleStyle={styles.titleStyle} backIconColor={colors.text.light} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <KeyboardDismissWrapper>
          <Text style={styles.instructionText}>{t('register:instructions_email')}</Text>
          <AuthInput
            label={t('register:email_label')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('register:email_placeholder')}
            icon={<Mail width={20} height={20} />}
            editable={!isLoading}
          />
          <Button
            onPress={handleSendEmail}
            disabled={isLoading || !email.trim()}
            loading={isLoading}
            style={styles.button}
            textStyle={styles.buttonText}
            size='lg'
            variant='primary'
            label={isLoading ? t('register:sending') : t('register:send_code')}
            leftIcon={SignUp({ width: 24, height: 24, color: colors.text.light })}
          />
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
  scrollView: {
    flex: 1,
  },
  instructionText: {
    ...typography.subtitle,
    color: colors.text.light,
    marginBottom: dimensions.spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: dimensions.spacing.lg,
    paddingBottom: dimensions.spacing.xl,
  },
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: dimensions.radius.round,
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
    borderWidth: 0.5
  },
  buttonText: {
    ...typography.subtitle,
    color: colors.text.light,
  },
});

export default RegisterEmailScreen;
