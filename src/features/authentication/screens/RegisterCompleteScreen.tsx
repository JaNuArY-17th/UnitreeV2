import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, dimensions, typography } from '@/shared/themes';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

import { ScreenHeader, KeyboardDismissWrapper, Text, Button } from '@/shared/components';
import AuthInput from '../components/LoginScreen/AuthInput';
import LoadingOverlay from '@/shared/components/LoadingOverlay';
import Lock from '@/shared/assets/icons/Lock';
import UserCircle from '@/shared/assets/icons/UserCircle';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';

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
      Alert.alert('Error', 'Nickname is required');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Password is required');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to complete registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('RegisterSuccess', { nickname });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to complete registration');
    } finally {
      setIsLoading(false);
    }
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.safeContainer, { paddingTop: insets.top }]}>
      <LoadingOverlay visible={isLoading} />
      <ScreenHeader title={t('login:completeProfile')} titleStyle={styles.titleStyle} backIconColor={colors.text.light} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <KeyboardDismissWrapper>
          <Text style={styles.instructionText}>Complete your profile to finish registration</Text>
          <AuthInput
            label="Nickname"
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter your nickname"
            icon={<UserCircle width={20} height={20} />}
            editable={!isLoading}
          />
          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
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
          <Button
            onPress={handleCompleteRegistration}
            disabled={isLoading || !nickname.trim() || !password.trim() || !confirmPassword.trim()}
            loading={isLoading}
            size="lg"
            variant="primary"
            label="Create Account"
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

export default RegisterCompleteScreen;
