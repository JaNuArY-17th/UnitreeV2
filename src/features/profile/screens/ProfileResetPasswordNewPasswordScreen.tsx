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

type ProfileResetPasswordNewPasswordRouteProp = RouteProp<RootStackParamList, 'ProfileResetPasswordNewPassword'>;

const ProfileResetPasswordNewPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProfileResetPasswordNewPasswordRouteProp>();
  const { t } = useTranslation();
  const { t: profileT } = useTranslation('profile');
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
      // TODO: Implement reset password API call for profile
      console.log('Resetting password for phone:', phone);
      console.log('New password:', newPassword);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success haptic feedback
      HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });

      // Show success message
      Alert.alert(
        profileT('resetPassword.success.title'),
        profileT('resetPassword.success.profileMessage'),
        [
          {
            text: profileT('resetPassword.success.profileButton'),
            onPress: () => {
              // Navigate back to security settings (OTP screen is no longer in stack)
              navigation.goBack();
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      // Error haptic feedback
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });

      Alert.alert(
        profileT('resetPassword.error.title'),
        error.message || profileT('resetPassword.error.message'),
        [{ text: t('common:ok', 'OK') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />

      <KeyboardDismissWrapper style={styles.container}>
        <ScreenHeader
          title={profileT('resetPassword.title')}
          showBack={true}
          centerTitle={false}
          onBackPress={handleBackPress}
        />

        <View style={styles.content}>
          <View style={styles.instructionSection}>
            <Text style={styles.instructionText}>
              {profileT('resetPassword.newPassword.instruction')}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {profileT('resetPassword.newPassword.label')}
              </Text>
              <PasswordInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={profileT('resetPassword.newPassword.placeholder')}
              />
              {newPassword.length > 0 && !isPasswordValid && (
                <Text style={styles.errorText}>
                  {profileT('resetPassword.validation.minLength')}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {profileT('resetPassword.confirmPassword.label')}
              </Text>
              <PasswordInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={profileT('resetPassword.confirmPassword.placeholder')}
              />
              {confirmPassword.length > 0 && !doPasswordsMatch && (
                <Text style={styles.errorText}>
                  {profileT('resetPassword.validation.noMatch')}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Button
              label={profileT('resetPassword.button.resetPassword')}
              onPress={handleResetPassword}
              disabled={!isFormValid}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              style={styles.resetButton}
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
  instructionSection: {
    paddingTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  instructionTitle: {
    fontSize: dimensions.fontSize.xl,

    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: dimensions.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: dimensions.fontSize.md * 1.4,
  },
  inputSection: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: dimensions.fontSize.md,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: dimensions.fontSize.sm,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  buttonSection: {
    paddingBottom: spacing.xl,
  },
  resetButton: {
    marginTop: spacing.lg,
  },
});

export default ProfileResetPasswordNewPasswordScreen;
