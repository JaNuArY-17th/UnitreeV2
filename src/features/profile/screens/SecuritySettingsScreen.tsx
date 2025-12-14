import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { BackgroundPattern } from '@/shared/components/base';
import Text from '@/shared/components/base/Text';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { MenuSection } from '@/features/profile/components/MenuSection';
import { Fingerprint, ResetPassword, ChangePassword } from '@/shared/assets/icons';
import { useBiometric } from '@/features/biometric';
import { useAppSelector } from '@/shared/store';
import { selectUser } from '@/features/authentication/store/authSelectors';
import { getUserTypeColor } from '@/shared/themes/colors';

const SecuritySettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('profile');
  // const { t: commonT } = useTranslation('common');
  const { t: biometricT } = useTranslation('biometric');

  // Biometric functionality
  const { checkStatus, enroll, remove, login, authenticate, createSignature, enrolling, removing, loggingIn } = useBiometric();
  const user = useAppSelector(selectUser);
  const isEnrolledOnServer = useAppSelector((state) => state.biometric.isEnrolledOnServer);

  // Password input state for biometric operations
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingBiometricAction, setPendingBiometricAction] = useState<'enroll' | 'remove' | null>(null);

  // Check biometric status on mount
  useEffect(() => {
    if (user?.id) {
      checkStatus(user.id.toString());
    }
  }, [checkStatus, user?.id]);

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleResetPassword = () => {
    navigation.navigate('ProfileResetPassword');
  };

  const showPasswordPrompt = (action: 'enroll' | 'remove') => {
    setPendingBiometricAction(action);
    setPasswordInput('');
    setShowPasswordDialog(true);
  };

  const handlePasswordConfirm = async () => {
    if (!passwordInput.trim()) {
      Alert.alert(t('error.title'), biometricT('errors.passwordRequired'));
      return;
    }

    setShowPasswordDialog(false);

    try {
      if (pendingBiometricAction === 'enroll') {
        // First, authenticate with biometric before enrollment
        const biometricAuthenticated = await authenticate({
          promptMessage: biometricT('biometric.enroll.prompt') || 'Authenticate to enroll biometric',
        });

        if (!biometricAuthenticated) {
          // User cancelled biometric authentication
          return;
        }

        // For enrollment, we need a biometric key from the server
        // This would typically come from an API call to get enrollment challenge
        const biometricKey = 'server_generated_key_' + Date.now(); // Placeholder

        const enrollResult = await enroll({
          old_password: passwordInput,
          biometric_key: biometricKey,
        }, user?.id?.toString() || '');

        if (enrollResult.success === false) {
          // Show error and don't call API again
          const errorMessage = enrollResult.message || biometricT('errors.enrollmentFailed') || 'Biometric enrollment failed';
          Alert.alert(t('error.title'), errorMessage);
          return;
        }

        Alert.alert(
          t('success.title'),
          enrollResult.message || biometricT('success.enrolled')
        );
      } else if (pendingBiometricAction === 'remove') {
        const removeResult = await remove({
          old_password: passwordInput,
        }, user?.id?.toString() || '');

        if (removeResult.success === false) {
          // Show error and don't call API again
          const errorMessage = removeResult.message || biometricT('errors.removalFailed') || 'Biometric removal failed';
          Alert.alert(t('error.title'), errorMessage);
          return;
        }

        Alert.alert(
          t('success.title'),
          removeResult.message || biometricT('success.removed')
        );
      }
    } catch (error: any) {
      console.error('Biometric operation failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || biometricT('errors.operationFailed') || 'Biometric operation failed';
      Alert.alert(
        t('error.title'),
        errorMessage
      );
    } finally {
      setPendingBiometricAction(null);
      setPasswordInput('');
    }
  };

  const handleTestBiometricLogin = async () => {
    if (!user?.phone_number) {
      Alert.alert(t('error.title'), 'User phone number not available');
      return;
    }

    try {
      // Create signature for test payload (this includes biometric authentication)
      const testPayload = `test_login_${Date.now()}`;
      const signature = await createSignature(testPayload, {
        promptMessage: 'Test Biometric Login - Authenticate and sign login request',
      });

      if (!signature) {
        Alert.alert(
          biometricT('errors.signatureFailed') || 'Signature Failed',
          biometricT('errors.signatureCreationFailed') || 'Failed to create biometric signature'
        );
        return;
      }

      // Call biometric login API
      const loginResult = await login({
        phone_number: user.phone_number,
        payload: testPayload,
        signature: signature,
      });

      // Show success result
      Alert.alert(
        biometricT('success.loginTestTitle') || 'Biometric Login Test Successful',
        biometricT('success.loginTestMessage') || `Login successful!\n\nAccess Token: ${loginResult.access_token.substring(0, 20)}...\nRefresh Token: ${loginResult.refresh_token.substring(0, 20)}...\nUser: ${loginResult.user.full_name || loginResult.user.phone_number}`
      );

    } catch (error: any) {
      console.error('Biometric login test failed:', error);
      Alert.alert(
        biometricT('errors.loginTestFailed') || 'Biometric Login Test Failed',
        error?.message || error?.response?.data?.message || biometricT('errors.unknownError') || 'An unknown error occurred during biometric login test'
      );
    }
  };

  const handleBiometricToggle = (value: boolean) => {
    if (value) {
      // Enable biometric - need password confirmation first
      Alert.alert(
        t('settings.security.enableBiometric'),
        t('settings.security.enableBiometricDesc'),
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('continue'),
            onPress: () => showPasswordPrompt('enroll'),
          },
        ]
      );
    } else {
      // Disable biometric - need password confirmation first
      Alert.alert(
        t('settings.security.disableBiometric'),
        t('settings.security.disableBiometricDesc'),
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('disable'),
            onPress: () => showPasswordPrompt('remove'),
            style: 'destructive',
          },
        ]
      );
    }
  };

  // Password settings menu items
  const passwordItems = [
    {
      id: 'changePassword',
      title: t('settings.security.changePassword'),
      icon: <ChangePassword width={20} height={20} color={getUserTypeColor()} />,
      onPress: handleChangePassword,
      showArrow: true,
    },
    {
      id: 'resetPassword',
      title: t('settings.security.resetPassword'),
      icon: <ResetPassword width={20} height={20} color={getUserTypeColor()} />,
      onPress: handleResetPassword,
      showArrow: true,
    },
  ];

  // Biometric settings menu items
  const biometricItems = [
    {
      id: 'biometric',
      title: t('settings.security.biometric'),
      icon: <Fingerprint width={20} height={20} color={getUserTypeColor()} />,
      onPress: () => { }, // Empty function since toggle handles the interaction
      showArrow: false,
      showToggle: true,
      toggleValue: isEnrolledOnServer,
      onToggle: handleBiometricToggle,
    },
    // {
    //   id: 'testBiometricLogin',
    //   title: loggingIn ? 'Testing Biometric Login...' : 'Test Biometric Login API',
    //   icon: <Fingerprint width={20} height={20} color={getUserTypeColor()} />,
    //   onPress: handleTestBiometricLogin,
    //   showArrow: true,
    //   disabled: !isEnrolledOnServer || loggingIn,
    // },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />

      <ScreenHeader
        title={t('settings.security.title')}
        showBack={true}
        centerTitle={false}
      />

      <View style={styles.content}>
        {/* Password Settings */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <MenuSection items={passwordItems} title={t('settings.security.password')} />
          </View>
        </View>

        {/* Biometric Settings */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <MenuSection items={biometricItems} title={t('settings.security.biometric')} />
          </View>
        </View>
      </View>

      {/* Password Input Dialog for Biometric Operations */}
      {showPasswordDialog && (
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>
              {pendingBiometricAction === 'enroll'
                ? t('settings.security.enterPasswordToEnable')
                : t('settings.security.enterPasswordToDisable')
              }
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('settings.security.enterPassword')}
              secureTextEntry
              value={passwordInput}
              onChangeText={setPasswordInput}
              autoFocus
            />
            <View style={styles.dialogButtons}>
              <Text
                style={[styles.dialogButton, styles.cancelButton]}
                onPress={() => {
                  setShowPasswordDialog(false);
                  setPendingBiometricAction(null);
                  setPasswordInput('');
                }}
              >
                {t('cancel')}
              </Text>
              <Text
                style={[
                  styles.dialogButton,
                  styles.confirmButton,
                  { backgroundColor: getUserTypeColor() },
                  (!passwordInput.trim() || (pendingBiometricAction === 'enroll' ? enrolling : removing)) && styles.disabledButton
                ]}
                onPress={handlePasswordConfirm}
                disabled={!passwordInput.trim() || (pendingBiometricAction === 'enroll' ? enrolling : removing)}
              >
                {(pendingBiometricAction === 'enroll' ? enrolling : removing) ? t('loading') : t('confirm')}
              </Text>
            </View>
          </View>
        </View>
      )}
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
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,

    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContainer: {
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.lg,
    minWidth: 350,
  },
  dialogTitle: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    lineHeight: 22,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dialogButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,

  },
  cancelButton: {
    backgroundColor: colors.lightGray,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  confirmButton: {
    color: colors.background,
    marginLeft: spacing.sm,
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
    color: colors.gray,
  },
});

export default SecuritySettingsScreen;
