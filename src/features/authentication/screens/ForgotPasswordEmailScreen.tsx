import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, dimensions, typography } from '@/shared/themes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

import LogoHeader from '../components/LoginScreen/LogoHeader';
import FormContainer from '../components/LoginScreen/FormContainer';
import AuthInput from '../components/LoginScreen/AuthInput';
import LoadingOverlay from '@/shared/components/LoadingOverlay';
import Mail from '@/shared/assets/icons/Mail';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { Button } from '@/shared/components';

const ForgotPasswordEmailScreen: React.FC = () => {
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
      navigation.navigate('ForgotPasswordCode', { email });
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
      <LogoHeader mascotVisible={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <FormContainer
            title={t('login:forgotPassword')}
            onSignUp={() => navigation.navigate('Login')}>
            <AuthInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              icon={<Mail width={20} height={20} />}
              editable={!isLoading}
            />
            <Button
              onPress={handleSendEmail}
              disabled={isLoading || !email.trim()}
              loading={isLoading}
              label="Send Code"
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
});

export default ForgotPasswordEmailScreen;
