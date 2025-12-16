import React, { useState } from 'react';
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
import { Lock } from '@/shared/assets/icons';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { KeyboardDismissWrapper, ScreenHeader, Button } from '../../../shared/components';

const ForgotPasswordResetScreen: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ForgotPasswordReset'>>();
  const email = route.params?.email || '';

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert(t('forgotPassword:error_title'), t('forgotPassword:errors.password_required'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('forgotPassword:error_title'), t('forgotPassword:errors.passwords_dont_match'));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t('forgotPassword:error_title'), t('forgotPassword:errors.password_min_chars'));
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to reset password
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('ForgotPasswordSuccess', { email });
    } catch (err: any) {
      Alert.alert(t('forgotPassword:error_title'), err.message || t('forgotPassword:errors.reset_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.safeContainer, { paddingTop: insets.top }]}>
      <LoadingOverlay visible={isLoading} />
      <ScreenHeader title={t('forgotPassword:title')} titleStyle={styles.titleStyle} backIconColor={colors.text.light} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <KeyboardDismissWrapper>
          <AuthInput
            label={t('forgotPassword:new_password_label')}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t('forgotPassword:new_password_placeholder')}
            icon={<Lock width={20} height={20} />}
            secureTextEntry
            editable={!isLoading}
          />
          <AuthInput
            label={t('forgotPassword:confirm_password_label')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('forgotPassword:confirm_password_placeholder')}
            icon={<Lock width={20} height={20} />}
            secureTextEntry
            editable={!isLoading}
          />
          <Button
            onPress={handleResetPassword}
            disabled={isLoading || !newPassword.trim() || !confirmPassword.trim()}
            loading={isLoading}
            size='lg'
            variant='primary'
            label={isLoading ? t('forgotPassword:resetting') : t('forgotPassword:reset')}
            style={styles.button}
            textStyle={styles.buttonText}
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
  button: {
    marginTop: dimensions.spacing.lg,
  },
  buttonText: {
    ...typography.subtitle,
    color: colors.text.light,
  },
});

export default ForgotPasswordResetScreen;
