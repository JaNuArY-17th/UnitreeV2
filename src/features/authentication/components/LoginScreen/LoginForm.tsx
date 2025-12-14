import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import Button from '@/shared/components/base/Button';
import { Text } from '@/shared/components';
import { UserTypeSelector } from './UserTypeSelector';
import PhoneInput from './PhoneInput';
import PasswordInput from './PasswordInput';
import { AutoLoginCheckbox } from './AutoLoginCheckbox';
import BiometricLoginButton from './BiometricLoginButton';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing } from '@/shared/themes';
import { getColors } from '@/shared/themes/colors';
import { AutoLoginUtils } from '@/features/authentication/utils/autoLoginUtils';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Login01Icon } from '@hugeicons/core-free-icons';

// Dynamic colors for different user types
const getUserTypeColor = (userType: 'store' | 'user') => {
  const accountType = userType === 'store' ? 'STORE' : 'USER';
  return getColors(accountType).primary;
};

interface LoginFormProps {
  onLogin: (phone: string, password: string, userType: 'store' | 'user', autoLogin: boolean) => void;
  onBiometricLogin?: (phone: string, userType: 'store' | 'user') => void;
  isLoading?: boolean;
  onUserTypeChange?: (userType: 'store' | 'user') => void;
  initialPhone?: string; // Phone number to auto-fill
  initialUserType?: 'store' | 'user'; // User type to auto-select
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onBiometricLogin, isLoading = false, onUserTypeChange, initialPhone, initialUserType }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [phone, setPhone] = useState(initialPhone || '');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'store' | 'user'>(initialUserType || 'store');
  const [autoLogin, setAutoLogin] = useState(true);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { t } = useTranslation();

  const currentColor = getUserTypeColor(userType);

  // Load remembered phone number when initialPhone changes
  useEffect(() => {
    console.log('🔄 [LoginForm] useEffect triggered - initialPhone:', initialPhone);
    console.log('🔄 [LoginForm] Current phone state:', phone);
    if (initialPhone) {
      setPhone(initialPhone);
      console.log('✅ [LoginForm] Set phone from initialPhone:', initialPhone);
    } else {
      console.log('⚠️ [LoginForm] initialPhone is empty or undefined');
    }
  }, [initialPhone]);

  // Sync userType when initialUserType changes from parent
  useEffect(() => {
    if (initialUserType) {
      console.log('🔄 [LoginForm] Syncing userType from initialUserType:', initialUserType);
      setUserType(initialUserType);
    }
  }, [initialUserType]);

  const handleLogin = async () => {
    if (isLoading) return;

    // Reset errors
    setPhoneError('');
    setPasswordError('');

    // Validate phone
    if (!phone.trim()) {
      setPhoneError(t('login:errors.phoneRequired'));
      return;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError(t('login:errors.passwordRequired'));
      return;
    }

    // Pass autoLogin state to parent component to handle after successful login
    onLogin(phone, password, userType, autoLogin);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <UserTypeSelector
          selectedType={userType}
          onTypeChange={(type) => {
            setUserType(type);
            onUserTypeChange?.(type);
          }}
        />

        <PhoneInput
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (phoneError) setPhoneError(''); // Clear error on change
          }}
          error={phoneError}
        />
        <PasswordInput
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError(''); // Clear error on change
          }}
          error={passwordError}
        />

        <Button
          label={t('login:title')}
          onPress={handleLogin}
          variant="primary"
          size="lg"
          fullWidth
          disabled={isLoading}
          loading={isLoading}
          style={[styles.loginButton, { backgroundColor: currentColor }]}
          leftIcon={<HugeiconsIcon icon={Login01Icon} size={24} color={colors.light} />}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPasswordContainer}
        >
          <Text variant="body" style={[styles.forgotPasswordText, { color: currentColor }]}>
            {t('login:forgotPassword')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  topSection: {
    gap: spacing.lg,
  },
  loginButton: {
    // marginTop: spacing.sm,
    // backgroundColor is now set dynamically
  },
  forgotPasswordContainer: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  forgotPasswordText: {
    fontSize: 16,
  },
});

export default LoginForm;
