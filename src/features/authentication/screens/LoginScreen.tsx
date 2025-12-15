import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Animated, Keyboard, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { EnsogoLogo } from '@/shared/assets/images/EnsogoLogo';
import Text from '@/shared/components/base/Text';
import Button from '@/shared/components/base/Button';
import LoginForm from '../components/LoginScreen/LoginForm';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { spacing, colors, typography } from '@/shared/themes';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
import { BackgroundPattern, KeyboardDismissWrapper } from '@/shared/components/base';
import LoadingOverlay from '@/shared/components/LoadingOverlay';
import { useTabLogin } from '../hooks/useTabLogin';
import { formatPhoneNumber } from '../utils/authUtils';
import { useStatusBarEffect } from '@/shared/utils/StatusBarManager';
import { getColors, updateColorsForAccountType } from '@/shared/themes/colors';
import { AutoLoginUtils } from '@/features/authentication/utils/autoLoginUtils';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { UserAdd01Icon } from '@hugeicons/core-free-icons';

// Dynamic colors for different user types
const getUserTypeColor = (userType: 'store' | 'user') => {
  const accountType = userType === 'store' ? 'STORE' : 'USER';
  return getColors(accountType).primary;
};

interface LoginScreenProps {
  // Props can be added here in the future
}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { login, isLoading } = useTabLogin();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [rememberedPhone, setRememberedPhone] = useState<string>('');
  const [keyboardOffset] = useState(new Animated.Value(0));

  const currentColor = getUserTypeColor('user');

  const handleLogin = async (phone: string, password: string, autoLogin: boolean) => {
    const userType: 'user' = 'user';
    try {
      // Format phone number and create login request
      const loginRequest = {
        phone_number: formatPhoneNumber(phone),
        password: password,
      };

      // Attempt login with the specified user type
      const result = await login(loginRequest, userType);

      // Defensive: log the full result for debugging
      console.log('🔍 Tab login result:', {
        hasAccessToken: !!result.accessToken,
        isNewDevice: result.isNewDevice,
        userType: userType,
        isVerified: result.isVerified,
        rawResult: result,
      });

      // If login API returns is_verified: false, redirect to RegisterOtpScreen (treat as a valid flow, not error)
      if (result.isVerified === false) {
        console.log('🟡 User not verified, redirecting to RegisterOtpScreen');
        navigation.navigate('RegisterOtp', {
          phone: phone,
        });
        return;
      }

      // Check for successful login with access token
      if (result.accessToken) {
        // Successful login with access token - user is fully authenticated
        // Navigation will be handled by AuthProvider
        console.log(`✅ ${userType} login successful with access token`);

        // Handle auto login (save/clear phone based on checkbox)
        try {
          console.log('💾 [LoginScreen] Handling auto login...');
          await AutoLoginUtils.handleAutoLogin(
            formatPhoneNumber(phone),
            autoLogin
          );
          console.log('✅ [LoginScreen] Auto login handled successfully');
        } catch (autoLoginError) {
          console.error('❌ [LoginScreen] Error handling auto login:', autoLoginError);
        }

        // Handle login success (always save user type for tab memory)
        try {
          console.log('📝 [LoginScreen] Saving user type for tab memory...');
          await AutoLoginUtils.handleLoginSuccess('user');
          console.log('✅ [LoginScreen] User type saved successfully');

          // Update app colors based on user type
          updateColorsForAccountType('USER');
          console.log(`🎨 [LoginScreen] Updated app colors for USER`);
        } catch (userTypeError) {
          console.error('❌ [LoginScreen] Error saving user type:', userTypeError);
        }
        return; // Exit early, no need to show any modal
      }

      if (result.isNewDevice === true) {
        // New device detected - navigate to OTP verification screen
        console.log('📱 New device detected, navigating to OTP');
        navigation.navigate('LoginOtp', {
          phone: phone,
          userType: 'user',
        });
        return; // Exit early, no need to show any modal
      }

      // If we reach here, only then treat as error
      console.log('❌ Unexpected login response for', userType, result);
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

  const handleBiometricLogin = async (phone: string) => {
    const userType: 'user' = 'user';
    try {
      console.log('🔐 Starting biometric login for:', phone);

      // The biometric login is handled by the biometric service
      // which stores tokens and triggers auth updates
      // Navigation will be handled by AuthProvider

      console.log(`✅ User biometric login successful`);

      // Save user type for tab memory (biometric login counts as successful login)
      try {
        console.log('📝 [LoginScreen] Saving user type for tab memory (biometric)...');
        await AutoLoginUtils.handleLoginSuccess(userType);
        console.log('✅ [LoginScreen] User type saved successfully');

        // Update app colors based on user type
        const accountType = userType === 'store' ? 'STORE' : 'USER';
        updateColorsForAccountType(accountType);
        console.log(`🎨 [LoginScreen] Updated app colors for ${accountType}`);
      } catch (userTypeError) {
        console.error('❌ [LoginScreen] Error saving user type:', userTypeError);
      }

    } catch (error: any) {
      // Show error alert to user
      Alert.alert(
        t('login:errors.loginFailed'),
        error.message || t('login:errors.unexpectedError'),
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

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
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <EnsogoLogo color={currentColor} />
              </View>
            </View>

            {/* Content - Vertically Centered */}
            <View style={styles.content}>
              <LoginForm
                onLogin={handleLogin}
                onBiometricLogin={handleBiometricLogin}
                isLoading={isLoading}
                initialPhone={rememberedPhone}
              />
            </View>
          </ScrollView>
        </KeyboardDismissWrapper>
      </Animated.View>

      {/* Sign Up Button - Fixed at Bottom */}
      <View style={[styles.signUpSection, { paddingBottom: insets.bottom || spacing.lg }]}>
        <Button
          label={t('login:signUp.button')}
          onPress={() => navigation.navigate('Register')}
          variant="outline"
          size="lg"
          fullWidth
          style={[styles.signUpButton, { borderColor: currentColor }]}
          textStyle={{ color: currentColor }}
          leftIcon={<HugeiconsIcon icon={UserAdd01Icon} size={20} color={currentColor} />}
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
  logoText: {
    alignItems: 'flex-start',
    marginLeft: spacing.lg,
  },
  helpButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    lineHeight: 40,
  },
  signUpSection: {
    paddingHorizontal: spacing.lg,
  },
  signUpButton: {
    // borderColor is set dynamically
  },
});

export default LoginScreen;
