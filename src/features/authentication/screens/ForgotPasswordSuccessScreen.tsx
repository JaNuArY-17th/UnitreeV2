import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, dimensions, typography } from '@/shared/themes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { KeyboardDismissWrapper, ScreenHeader, Text, Button } from '../../../shared/components';

const ForgotPasswordSuccessScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.safeContainer, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('forgotPassword:forgot_password_step_4')} titleStyle={styles.titleStyle} backIconColor={colors.text.light} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <KeyboardDismissWrapper>
          <Text style={styles.instructionText}>{t('forgotPassword:success_message')}</Text>
          <Button
            onPress={handleBackToLogin}
            disabled={false}
            size='lg'
            variant='primary'
            label={t('forgotPassword:back_to_login')}
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
  keyboardView: {
    flex: 1,
    paddingHorizontal: dimensions.spacing.lg,
  },
  titleStyle: {
    ...typography.h2,
    color: colors.text.light,
  },
  instructionText: {
    ...typography.subtitle,
    color: colors.text.light,
    marginBottom: dimensions.spacing.md,
  },
  button: {
    marginTop: dimensions.spacing.lg,
  },
  buttonText: {
    ...typography.subtitle,
    color: colors.text.light,
  },
});

export default ForgotPasswordSuccessScreen;
