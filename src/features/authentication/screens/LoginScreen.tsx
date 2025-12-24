import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useTranslation } from '@/shared/hooks/useTranslation';
import LoadingOverlay from '@/shared/components/LoadingOverlay';
import { useTabLogin } from '../hooks/useTabLogin';
import { formatPhoneNumber } from '../utils/authUtils';
import { AutoLoginUtils } from '@/features/authentication/utils/autoLoginUtils';
import { colors } from '@/shared/themes/colors';
import { dimensions } from '@/shared/themes/dimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokenManager } from '@/shared/utils/tokenManager';
import { authGuard } from '@/shared/services/authGuard';

// New components
import LogoHeader from '../components/LoginScreen/LogoHeader';
import FormContainer from '../components/LoginScreen/FormContainer';
import AuthInput from '../components/LoginScreen/AuthInput';
import RememberForgotRow from '../components/LoginScreen/RememberForgotRow';
import { Mail, Lock, Login } from '@/shared/assets/icons';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { KeyboardDismissWrapper, Button } from '../../../shared/components';
import typography from '@/shared/themes/typography';


const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { login, isLoading } = useTabLogin();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered phone on mount
  useEffect(() => {
    loadRememberedPhone();
  }, []);

  const loadRememberedPhone = async () => {
    try {
      const savedPhone = await AutoLoginUtils.getRememberedPhone();
      if (savedPhone) {
        setPhone(savedPhone);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading remembered phone:', error);
    }
  };

  const validateForm = (): boolean => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert(
        t('login:error_title'),
        t('login:validation_required')
      );
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    // 🟡 DEV MODE: Skip credential validation but follow real auth flow
    try {
      console.log('🟡 DEV MODE: Creating mock authentication tokens...');
      
      // Create realistic JWT tokens (development only)
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 24 * 60 * 60; // 24 hours
      
      // Mock JWT payload structure
      const mockAccessPayload = {
        sub: 'dev_user_' + Date.now(),
        phone: phone || 'dev_phone',
        roles: ['user'],
        iat: now,
        exp: now + expiresIn,
        iss: 'unitree-dev',
      };
      
      const mockRefreshPayload = {
        sub: 'dev_user_' + Date.now(),
        type: 'refresh',
        iat: now,
        exp: now + (7 * 24 * 60 * 60), // 7 days
        iss: 'unitree-dev',
      };
      
      // Create base64 encoded JWT-like tokens (for development)
      const createMockJWT = (payload: any): string => {
        // Simple base64 encoding for React Native using native methods
        const toBase64 = (obj: any): string => {
          const jsonStr = JSON.stringify(obj);
          // Use btoa if available, otherwise fallback to simple encoding
          try {
            return btoa(jsonStr);
          } catch {
            // Fallback: create a simple base64-like string
            return Buffer.from(jsonStr, 'utf8').toString('base64');
          }
        };
        
        const header = toBase64({ alg: 'HS256', typ: 'JWT' });
        const encodedPayload = toBase64(payload);
        const signature = toBase64('dev_signature');
        return `${header}.${encodedPayload}.${signature}`;
      };
      
      const accessToken = createMockJWT(mockAccessPayload);
      const refreshToken = createMockJWT(mockRefreshPayload);
      
      console.log('🟡 DEV MODE: Mock tokens created');
      console.log('  Access Token:', accessToken.substring(0, 40) + '...');
      console.log('  Refresh Token:', refreshToken.substring(0, 40) + '...');
      
      // Save tokens using proper tokenManager method (same as production)
      await tokenManager.setTokens(accessToken, refreshToken);
      console.log('✅ Tokens saved to storage');
      
      // Trigger auth state update to notify the app that user is authenticated
      authGuard.triggerAuthUpdate();
      console.log('✅ Auth state updated');
      
      // Optional: Save login preferences
      try {
        await AutoLoginUtils.handleAutoLogin(phone || 'dev_user', rememberMe);
        await AutoLoginUtils.handleLoginSuccess('user');
        console.log('✅ Auto login preferences saved');
      } catch (error) {
        console.warn('⚠️ Could not save auto login preferences:', error);
        // Don't fail if auto login save fails
      }
      
      console.log('✅ Development authentication completed, navigating to MainTabs');
      // Navigation will happen automatically when AuthContext detects isAuthenticated change
      
    } catch (error) {
      console.error('❌ Error during development authentication:', error);
      Alert.alert('Error', 'Failed to create authentication tokens');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPasswordEmail');
  };

  const handleSignUp = () => {
    navigation.navigate('RegisterEmail');
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.safeContainer]}>
      <LoadingOverlay visible={isLoading} />

      <View style={styles.container}>
        {/* Logo Header */}
        <LogoHeader
          primaryLogo={<View style={styles.placeholder} />}
          secondaryLogo={<View style={styles.placeholder} />}
        />

        {/* Mascot - positioned absolutely above form */}
        <View style={styles.mascotContainer}>
          <Image
            source={require('@/shared/assets/mascots/Unitree - Mascot-1.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>

        {/* Form Container */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <KeyboardDismissWrapper>
            <FormContainer
              title={t('login:title')}
              onSignUp={handleSignUp}
            >
              {/* Phone Input */}
              <AuthInput
                label={t('login:phone_label')}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('login:phone_placeholder')}
                keyboardType="phone-pad"
                icon={<Mail width={20} height={20} color="#666" />}
                autoFocus={false}
              />

              {/* Password Input */}
              <AuthInput
                label={t('login:password_label')}
                value={password}
                onChangeText={setPassword}
                placeholder={t('login:password_placeholder')}
                secureTextEntry={true}
                icon={<Lock width={20} height={20} color="#666" />}
                autoFocus={false}
              />

              {/* Remember Me & Forgot Password */}
              <RememberForgotRow
                rememberMe={rememberMe}
                onRememberMeChange={setRememberMe}
                onForgotPassword={handleForgotPassword}
              />

              {/* Login Button */}
              <Button
                label={isLoading ? t('login:login_loading') : t('login:login_button')}
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.button}
                textStyle={styles.buttonText}
                size='lg'
                variant='primary'
                leftIcon={Login({ width: 24, height: 24, color: colors.text.light })}
              />
            </FormContainer>
          </KeyboardDismissWrapper>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  mascotContainer: {
    position: 'absolute',
    right: dimensions.spacing.lg,
    top: 140,
    zIndex: 999,
    width: 150,
    height: 150,
    pointerEvents: 'none',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  placeholder: {
    width: 100,
    height: 60,
    backgroundColor: colors.secondary,
    borderRadius: dimensions.radius.md,
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

export default LoginScreen;
