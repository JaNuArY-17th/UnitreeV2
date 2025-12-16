import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, dimensions, typography } from '@/shared/themes';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

import { ScreenHeader, KeyboardDismissWrapper, Text, Button, LoadingModal } from '@/shared/components';
import AuthInput from '../components/LoginScreen/AuthInput';
import Lock from '@/shared/assets/icons/Lock';
import UserCircle from '@/shared/assets/icons/UserCircle';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { UserPlus } from '../../../shared/assets';
import { getLoadingAnimation } from '@/shared/assets/animations';

const RegisterCompleteScreen: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RegisterComplete'>>();
  const email = route.params?.email || '';

  const handleCompleteRegistration = async () => {
    if (!nickname.trim()) {
      Alert.alert(t('register:error_title'), t('register:errors.nickname_required'));
      return;
    }
    if (!password.trim()) {
      Alert.alert(t('register:error_title'), t('register:errors.password_required'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('register:error_title'), t('register:errors.passwords_dont_match'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('register:error_title'), t('register:errors.password_min_chars'));
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to complete registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to LoginScreen after 3 seconds
      setTimeout(() => {
        setIsLoading(false);
        navigation.replace('Login');
      }, 3000);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert(t('register:error_title'), err.message || t('register:errors.failed_to_complete'));
    }
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  const plantAnimation = getLoadingAnimation('plant');

  return (
    <View style={[styles.safeContainer, { paddingTop: insets.top }]}>
      <LoadingModal 
        visible={isLoading}
        title={t('register:welcome_message')}
        animationSource={plantAnimation.source}
        animationStyle={plantAnimation.style}
        duration={2500}
        completionMessage={t('register:account_created_message')}
        animationSpeed={2}
      />
      <ScreenHeader title={t('register:register_step_3')} titleStyle={styles.titleStyle} backIconColor={colors.text.light} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <KeyboardDismissWrapper>
          <Text style={styles.instructionText}>{t('register:instructions_complete')}</Text>
          <AuthInput
            label={t('register:nickname_label')}
            value={nickname}
            onChangeText={setNickname}
            placeholder={t('register:nickname_placeholder')}
            icon={<UserCircle width={20} height={20} />}
            editable={!isLoading}

          />
          <AuthInput
            label={t('register:password_label')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('register:password_placeholder')}
            icon={<Lock width={20} height={20} />}
            secureTextEntry
            editable={!isLoading}
            autoFocus={false}
          />
          <AuthInput
            label={t('register:confirm_password_label')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('register:confirm_password_placeholder')}
            icon={<Lock width={20} height={20} />}
            secureTextEntry
            editable={!isLoading}
            autoFocus={false}
          />
          <Button
            onPress={handleCompleteRegistration}
            disabled={isLoading || !nickname.trim() || !password.trim() || !confirmPassword.trim()}
            loading={isLoading}
            size="lg"
            variant="primary"
            label={t('register:create_account')}
            style={styles.button}
            textStyle={styles.buttonText}
            leftIcon={<UserPlus width={20} height={20} color={colors.text.light} />}
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

export default RegisterCompleteScreen;
