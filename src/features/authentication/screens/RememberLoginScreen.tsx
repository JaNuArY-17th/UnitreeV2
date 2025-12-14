import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView, Animated, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { EnsogoLogo } from '@/shared/assets/images/EnsogoLogo';
import { Text, Button } from '@/shared/components/base';
import PasswordInput from '../components/LoginScreen/PasswordInput';
import BiometricLoginButton from '../components/LoginScreen/BiometricLoginButton';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { spacing, colors, dimensions, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
import { KeyboardDismissWrapper } from '@/shared/components/base';
import { useTabLogin } from '../hooks/useTabLogin';
import { formatPhoneNumber } from '../utils/authUtils';
import { useNotification } from '../../notifications/hooks';
import { useStatusBarEffect } from '@/shared/utils/StatusBarManager';
import { getColors, updateColorsForAccountType } from '@/shared/themes/colors';
import { AutoLoginUtils } from '@/features/authentication/utils/autoLoginUtils';
import { clearAllBiometricStatus } from '@/shared/utils/biometricStorage';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Login01Icon, UserSwitchIcon } from '@hugeicons/core-free-icons';


// Dynamic colors for different user types
const getUserTypeColor = (userType: 'store' | 'user') => {
  const accountType = userType === 'store' ? 'STORE' : 'USER';
  return getColors(accountType).primary;
};

interface RememberLoginScreenProps {
  // Props can be added here in the future
}

const RememberLoginScreen: React.FC<RememberLoginScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { login, isLoading } = useTabLogin();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [cachedPhone, setCachedPhone] = useState<string>('');
  const [cachedName, setCachedName] = useState<string>('');
  const [cachedUserType, setCachedUserType] = useState<'store' | 'user'>('store');
  const [keyboardOffset] = useState(new Animated.Value(0));

  const { registerDevice } = useNotification();

  const currentColor = getUserTypeColor(cachedUserType);

  // Load cached data ONCE when component mounts (not on every focus)
  useEffect(() => {
    let isMounted = true;

    const loadCachedData = async () => {
      try {
        // Load remembered phone
        const phone = await AutoLoginUtils.getRememberedPhone();
        console.log('🔍 [RememberLoginScreen] Raw phone from storage:', phone);

        if (!isMounted) return; // Prevent state update if unmounted

        if (phone) {
          const displayPhone = phone.startsWith('84') ? '0' + phone.slice(2) : phone;
          console.log('🔄 [RememberLoginScreen] Converted for display:', displayPhone);
          setCachedPhone(displayPhone);
        } else {
          console.log('⚠️ [RememberLoginScreen] No cached phone, redirecting to Login');
          navigation.replace('Login');
          return;
        }

        // Load remembered name
        const name = await AutoLoginUtils.getRememberedName();
        if (name) {
          console.log('✅ [RememberLoginScreen] Set cached name:', name);
          setCachedName(name);
        }

        // Load last user type
        const lastUserType = await AutoLoginUtils.getLastUserType();
        if (isMounted) {
          if (lastUserType) {
            console.log('✅ [RememberLoginScreen] Set cached userType:', lastUserType);
            setCachedUserType(lastUserType);
          } else {
            console.log('⚠️ [RememberLoginScreen] No cached user type, using default: store');
          }
        }
      } catch (error) {
        console.error('❌ [RememberLoginScreen] Error loading cached data:', error);
        if (isMounted) {
          navigation.replace('Login');
        }
      }
    };

    loadCachedData();

    return () => {
      isMounted = false;
    };
  }, []); // Empty deps array - only run once on mount

  // Add smooth keyboard animations
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue: -e.endCoordinates.height * 0.25, // Move up by 25% of keyboard height
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [keyboardOffset]);

  const handleLogin = async () => {
    setPasswordError('');

    if (!cachedPhone.trim()) {
      Alert.alert(
        t('login:errors.invalidCredentials'),
        t('login:errors.pleaseEnterAllFields'),
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (!password.trim()) {
      setPasswordError(t('login:errors.passwordRequired') || t('login:errors.pleaseEnterAllFields'));
      return;
    }

    try {
      // Format phone number and create login request
      const loginRequest = {
        phone_number: formatPhoneNumber(cachedPhone),
        password: password,
      };

      // Attempt login with the cached user type
      const result = await login(loginRequest, cachedUserType);

      // Defensive: log the full result for debugging
      console.log('🔍 Remember login result:', {
        hasAccessToken: !!result.accessToken,
        isNewDevice: result.isNewDevice,
        userType: cachedUserType,
        isVerified: result.isVerified,
        rawResult: result,
      });

      // If login API returns is_verified: false, redirect to RegisterOtpScreen
      if (result.isVerified === false) {
        console.log('🟡 User not verified, redirecting to RegisterOtpScreen');
        navigation.navigate('RegisterOtp', {
          phone: cachedPhone,
        });
        return;
      }

      // Check for successful login with access token
      if (result.accessToken) {
        // Successful login with access token - user is fully authenticated
        console.log(`✅ ${cachedUserType} remember login successful with access token`);

        // Handle login success (always save user type for tab memory)
        try {
          console.log('📝 [RememberLoginScreen] Saving user type for tab memory...');
          await AutoLoginUtils.handleLoginSuccess(cachedUserType);
          console.log('✅ [RememberLoginScreen] User type saved successfully');

          // Update app colors based on user type
          const accountType = cachedUserType === 'store' ? 'STORE' : 'USER';
          updateColorsForAccountType(accountType);
          console.log(`🎨 [RememberLoginScreen] Updated app colors for ${accountType}`);
        } catch (userTypeError) {
          console.error('❌ [RememberLoginScreen] Error saving user type:', userTypeError);
        }

        try {
          console.log('Remember login successful, registering device for notifications...');
          const registrationSuccess = await registerDevice();
          if (registrationSuccess) {
            console.log('Device registration successful');
          } else {
            console.warn('Device registration failed, but continuing with login');
          }
        } catch (registrationError) {
          // Don't block login if notification registration fails
          console.error('Device registration error:', registrationError);
        }
        return; // Exit early, no need to show any modal
      }

      if (result.isNewDevice === true) {
        // New device detected - navigate to OTP verification screen
        console.log('📱 New device detected, navigating to OTP');
        navigation.navigate('LoginOtp', {
          phone: cachedPhone,
          userType: cachedUserType,
        });
        return; // Exit early, no need to show any modal
      }

      // If we reach here, only then treat as error
      console.log('❌ Unexpected remember login response for', cachedUserType, result);
      throw new Error(t('login:errors.unexpectedError'));
    } catch (error: any) {
      // Show error alert to user
      Alert.alert(
        t('login:errors.loginFailed'),
        error.message || t('login:errors.unexpectedError'),
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleBackToLogin = async () => {
    try {
      console.log('🗑️ [RememberLoginScreen] Clearing all cached login data...');
      await Promise.all([
        AutoLoginUtils.clearAllCacheData(),
        clearAllBiometricStatus(),
      ]);
      console.log('✅ [RememberLoginScreen] All cached data cleared successfully');
    } catch (error) {
      console.error('❌ [RememberLoginScreen] Error clearing cached data:', error);
    }

    navigation.replace('Login');
  };

  const handleBiometricLoginSuccess = async (phone: string, userType: 'store' | 'user') => {
    console.log(`✅ ${userType} biometric remember login successful`);

    // Handle login success (always save user type for tab memory)
    try {
      console.log('📝 [RememberLoginScreen] Saving user type for tab memory (biometric)...');
      await AutoLoginUtils.handleLoginSuccess(userType);
      console.log('✅ [RememberLoginScreen] User type saved successfully');

      // Update app colors based on user type
      const accountType = userType === 'store' ? 'STORE' : 'USER';
      updateColorsForAccountType(accountType);
      console.log(`🎨 [RememberLoginScreen] Updated app colors for ${accountType}`);
    } catch (userTypeError) {
      console.error('❌ [RememberLoginScreen] Error saving user type:', userTypeError);
    }

    try {
      console.log('Biometric remember login successful, registering device for notifications...');
      const registrationSuccess = await registerDevice();
      if (registrationSuccess) {
        console.log('Device registration successful');
      } else {
        console.warn('Device registration failed, but continuing with login');
      }
    } catch (registrationError) {
      // Don't block login if notification registration fails
      console.error('Device registration error:', registrationError);
    }
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={'transparent'} />

      {/* Main Content with Keyboard Avoiding */}
      <Animated.View style={[styles.animatedContainer, { transform: [{ translateY: keyboardOffset }] }]}>
        <KeyboardDismissWrapper style={styles.wrapper}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Content */}
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <EnsogoLogo color={currentColor} />
                </View>
              </View>

              {/* <Text style={[styles.title, { color: currentColor }]}>{t('login:title')}</Text> */}

              {/* Phone Display */}
              <View style={styles.phoneDisplay}>
                <Text style={[styles.phoneLabel, { color: colors.text.secondary }]}>
                  {t('login:welcomeBack')}
                </Text>
                {cachedName ? (
                  <Text style={[styles.nameText, { color: currentColor }]}>
                    {cachedName}
                  </Text>
                ) : null}
                <Text style={[styles.phoneText, { color: currentColor }]}>
                  {cachedPhone}
                </Text>
              </View>

              <PasswordInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (text) setPasswordError('');
                }}
                error={passwordError}
              />

              <View style={styles.buttonRow}>
                <Button
                  label={t('login:title')}
                  onPress={handleLogin}
                  variant="primary"
                  size="lg"
                  fullWidth={false}
                  disabled={isLoading}
                  loading={isLoading}
                  style={[styles.loginButton, { backgroundColor: currentColor }]}
                  leftIcon={<HugeiconsIcon icon={Login01Icon} size={20} color="#FFFFFF" />}
                />

                <BiometricLoginButton
                  phone={cachedPhone}
                  userType={cachedUserType}
                  currentColor={currentColor}
                  onBiometricLogin={handleBiometricLoginSuccess}
                />
              </View>

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text variant="body" style={[{ color: currentColor }]}>{t('login:forgotPassword')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardDismissWrapper>
      </Animated.View>

      {/* Switch Account Button - Fixed at Bottom */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom || spacing.lg }]}>
        <Button
          label={t('login:button.useDifferentAccount')}
          onPress={handleBackToLogin}
          variant="outline"
          size="lg"
          fullWidth
          style={[styles.switchButton, { borderColor: currentColor }]}
          textStyle={{ color: currentColor }}
          leftIcon={<HugeiconsIcon icon={UserSwitchIcon} size={20} color={currentColor} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  animatedContainer: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  phoneDisplay: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  phoneLabel: {
    fontSize: dimensions.fontSize.md,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    marginBottom: spacing.xs,
  },
  nameText: {
    ...typography.title,
    lineHeight: 0,
    marginBottom: spacing.xs,
  },
  phoneText: {
    ...typography.title,
    // fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  loginButton: {
    flex: 1,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  switchButton: {
    borderWidth: 1,
  },
});

export default RememberLoginScreen;
