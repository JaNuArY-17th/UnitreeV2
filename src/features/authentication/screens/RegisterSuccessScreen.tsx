import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { colors, dimensions, typography } from '@/shared/themes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

import { ScreenHeader, KeyboardDismissWrapper, Text, Button } from '@/shared/components';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { useTranslation } from '@/shared/hooks/useTranslation';

const RegisterSuccessScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RegisterSuccess'>>();
  const nickname = route.params?.nickname || 'User';
  const { t } = useTranslation();

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.safeContainer, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('register:register_step_4')} titleStyle={styles.titleStyle} backIconColor={colors.text.light} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <KeyboardDismissWrapper>
          <View style={styles.successContainer}>
            <Text style={styles.welcomeText}>{t('register:welcome_message')}</Text>
            <Text style={styles.successMessage}>
              {t('register:account_created_message')} <Text style={styles.nickname}>{nickname}</Text>, {t('register:account_created_success')}
            </Text>
            <Button
              onPress={handleBackToLogin}
              disabled={false}
              size="lg"
              variant="primary"
              label={t('register:back_to_login')}
              style={styles.button}
              textStyle={styles.buttonText}
            />
          </View>
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
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.xl,
  },
  welcomeText: {
    ...typography.h2,
    color: colors.text.light,
    marginBottom: dimensions.spacing.md,
  },
  successMessage: {
    ...typography.subtitle,
    color: colors.text.light,
    textAlign: 'center',
    marginBottom: dimensions.spacing.lg,
  },
  nickname: {
    ...typography.subtitle,
    color: colors.text.light,
    fontWeight: '700',
  },
  button: {
    marginTop: dimensions.spacing.lg,
  },
  buttonText: {
    ...typography.subtitle,
    color: colors.text.light,
  },
});

export default RegisterSuccessScreen;
