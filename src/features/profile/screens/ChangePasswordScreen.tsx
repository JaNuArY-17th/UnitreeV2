import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import ScreenHeader from '@/shared/components/ScreenHeader';
import Button from '@/shared/components/base/Button';
import Text from '@/shared/components/base/Text';
import { PasswordInput } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, FONT_WEIGHTS, getFontFamily } from '@/shared/themes';
import { KeyboardDismissWrapper } from '@/shared/components/base';
import HapticFeedback from 'react-native-haptic-feedback';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { t: profileT } = useTranslation('profile');
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation
  const isCurrentPasswordValid = currentPassword.length > 0;
  const isNewPasswordValid = newPassword.length >= 8;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isNewPasswordDifferent = currentPassword !== newPassword;
  const isFormValid = isCurrentPasswordValid && isNewPasswordValid && doPasswordsMatch && isNewPasswordDifferent;

  const handleChangePassword = async () => {
    if (!isFormValid) return;

    // Haptic feedback
    HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });

    setIsLoading(true);
    try {
      // TODO: Implement change password API call
      console.log('Changing password...');
      console.log('Current password:', currentPassword);
      console.log('New password:', newPassword);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success haptic feedback
      HapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });

      // Show success message
      Alert.alert(
        profileT('changePassword.success.title'),
        profileT('changePassword.success.message'),
        [
          {
            text: profileT('changePassword.success.button'),
            onPress: () => {
              // Navigate back to security settings
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
        profileT('changePassword.error.title'),
        error.message || profileT('changePassword.error.message'),
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
          title={profileT('changePassword.title')}
          showBack={true}
          centerTitle={false}
          onBackPress={handleBackPress}
        />

        <View style={styles.content}>
          <View style={styles.instructionSection}>
            <Text style={styles.instructionText}>
              {profileT('changePassword.instruction')}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {profileT('changePassword.currentPassword.label')}
              </Text>
              <PasswordInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder={profileT('changePassword.currentPassword.placeholder')}
              />
              {currentPassword.length > 0 && !isCurrentPasswordValid && (
                <Text style={styles.errorText}>
                  {profileT('changePassword.validation.currentRequired')}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {profileT('changePassword.newPassword.label')}
              </Text>
              <PasswordInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={profileT('changePassword.newPassword.placeholder')}
              />
              {newPassword.length > 0 && !isNewPasswordValid && (
                <Text style={styles.errorText}>
                  {profileT('changePassword.validation.minLength')}
                </Text>
              )}
              {newPassword.length > 0 && currentPassword.length > 0 && !isNewPasswordDifferent && (
                <Text style={styles.errorText}>
                  {profileT('changePassword.validation.mustBeDifferent')}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {profileT('changePassword.confirmPassword.label')}
              </Text>
              <PasswordInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={profileT('changePassword.confirmPassword.placeholder')}
              />
              {confirmPassword.length > 0 && !doPasswordsMatch && (
                <Text style={styles.errorText}>
                  {profileT('changePassword.validation.noMatch')}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Button
              label={profileT('changePassword.button.changePassword')}
              onPress={handleChangePassword}
              disabled={!isFormValid}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              style={styles.changeButton}
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
  changeButton: {
    marginTop: spacing.lg,
  },
});

export default ChangePasswordScreen;