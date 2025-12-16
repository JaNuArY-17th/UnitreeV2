import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, dimensions, typographyStyles } from '@/shared/themes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

import LogoHeader from '../components/LoginScreen/LogoHeader';
import FormContainer from '../components/LoginScreen/FormContainer';
import LoginButton from '../components/LoginScreen/LoginButton';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';

const ForgotPasswordSuccessScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.safeContainer, { paddingTop: insets.top }]}>
      <LogoHeader mascotVisible={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <FormContainer
            title="Password Reset"
            onSignUp={handleBackToLogin}>
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>Password Reset</Text>
              <Text style={styles.successMessage}>
                Your password has been successfully reset. You can now log in with your new password.
              </Text>
              <LoginButton
                onPress={handleBackToLogin}
                disabled={false}
                title="Back to Login"
              />
            </View>
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
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.xxl,
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
    marginBottom: dimensions.spacing.xxl,
  },
});

export default ForgotPasswordSuccessScreen;
