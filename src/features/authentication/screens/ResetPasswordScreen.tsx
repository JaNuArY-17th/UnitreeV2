import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import ScreenHeader from '@/shared/components/ScreenHeader';
import Button from '@/shared/components/base/Button';
import Text from '@/shared/components/base/Text';
import { PasswordInput } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, FONT_WEIGHTS, getFontFamily } from '@/shared/themes';
import { KeyboardDismissWrapper } from '@/shared/components/base';
import HapticFeedback from 'react-native-haptic-feedback';

type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { phone } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation
  const isPasswordValid = newPassword.length >= 8;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = isPasswordValid && doPasswordsMatch;

  const handleResetPassword = async () => {
    if (!isFormValid) return;

    // Haptic feedback
    HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 2000));

      // Success haptic feedback
      HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });

      // Show success message
      Alert.alert(
        t('resetPassword:success.title', 'Password Reset Successful'),
        t('resetPassword:success.message', 'Your password has been successfully reset. You can now login with your new password.'),
        [
          {
            text: t('resetPassword:success.button', 'Login Now'),
            onPress: () => {
              // Navigate back to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      // Error haptic feedback
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });

      Alert.alert(
        t('resetPassword:error.title', 'Reset Failed'),
        error.message || t('resetPassword:error.message', 'Failed to reset password. Please try again.'),
        [{ text: t('shared:button.ok', 'OK') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.navigate('ForgotPassword');
  };

  const getPasswordStrengthText = () => {
    if (newPassword.length === 0) return '';
    if (newPassword.length < 8) {
      return t('resetPassword:validation.weak', 'Password must be at least 8 characters');
    }
    return t('resetPassword:validation.strong', 'Strong password');
  };

  const getPasswordStrengthColor = () => {
    if (newPassword.length === 0) return colors.text.secondary;
    if (newPassword.length < 8) return colors.danger;
    return colors.success;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />

      <KeyboardDismissWrapper style={styles.container}>
        <ScreenHeader
          title={t('resetPassword:title')}
          showBack={true}
          onBackPress={handleBackPress}
          centerTitle={false}
        />

        <View style={styles.content}>
          <View style={styles.inputSection}>
            <View style={styles.headerSection}>
              <Text style={styles.instruction}>
                {t('resetPassword:instruction', 'Create a new password for your account')}
              </Text>
              {/* <Text style={styles.phoneText}>
                  {t('resetPassword:phoneLabel', 'Phone: ')} {phone}
                </Text> */}
            </View>

            <View style={styles.formGroup}>
              <PasswordInput
                label={t('resetPassword:newPassword.label', 'New Password')}
                placeholder={t('resetPassword:newPassword.placeholder', 'Enter new password')}
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                style={styles.textInput}
              />

              {newPassword.length > 0 && (
                <Text style={[styles.passwordStrength, { color: getPasswordStrengthColor() }]}>
                  {getPasswordStrengthText()}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <PasswordInput
                label={t('resetPassword:confirmPassword.label', 'Confirm Password')}
                placeholder={t('resetPassword:confirmPassword.placeholder', 'Confirm new password')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                style={styles.textInput}
              />

              {confirmPassword.length > 0 && !doPasswordsMatch && (
                <Text style={[styles.passwordStrength, { color: colors.danger }]}>
                  {t('resetPassword:validation.mismatch', 'Passwords do not match')}
                </Text>
              )}

              {confirmPassword.length > 0 && doPasswordsMatch && (
                <Text style={[styles.passwordStrength, { color: colors.success }]}>
                  {t('resetPassword:validation.match', 'Passwords match')}
                </Text>
              )}
            </View>

            <View style={styles.requirementsSection}>
              <Text style={styles.requirementsTitle}>
                {t('resetPassword:requirements.title', 'Password Requirements:')}
              </Text>
              <Text style={styles.requirement}>
                • {t('resetPassword:requirements.length', 'At least 8 characters long')}
              </Text>
              <Text style={styles.requirement}>
                • {t('resetPassword:requirements.strength', 'Mix of letters, numbers, and symbols recommended')}
              </Text>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Button
              label={t('resetPassword:button.submit', 'Reset Password')}
              onPress={handleResetPassword}
              disabled={!isFormValid || isLoading}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>
        </View>
      </KeyboardDismissWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  inputSection: {
    // paddingTop: spacing.xl,
  },
  headerSection: {
    // marginBottom: spacing.xl,
    alignItems: 'center',
  },
  instruction: {
    color: colors.text.primary,
    fontSize: dimensions.fontSize.lg,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  phoneText: {
    color: colors.text.secondary,
    fontSize: dimensions.fontSize.lg,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  textInput: {
    marginBottom: spacing.xs,
  },
  passwordStrength: {
    fontSize: dimensions.fontSize.md,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  requirementsSection: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: 'rgba(4, 105, 33, 0.15)',
    borderRadius: 8,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  requirementsTitle: {
    fontSize: dimensions.fontSize.lg,

    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  requirement: {
    fontSize: dimensions.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
  },
  buttonSection: {
    paddingBottom: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.primaryDark,
  },
});

export default ResetPasswordScreen;
