import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import Button from '@/shared/components/base/Button';
import { Text } from '@/shared/components';
import { UserTypeSelector } from '../LoginScreen/UserTypeSelector';
import PhoneInput from '../LoginScreen/PhoneInput';
import PasswordInput from '../LoginScreen/PasswordInput';
import { ConfirmPasswordInput } from './ConfirmPasswordInput';
import { TermsCheckbox } from './TermsCheckbox';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing } from '@/shared/themes';
import { getColors } from '@/shared/themes/colors';
import type { RegisterFormData } from '../../hooks/useRegister';

interface RegisterFormProps {
  onRegister: (data: RegisterFormData) => void;
  isLoading?: boolean;
  onUserTypeChange?: (type: 'store' | 'user') => void;
  initialUserType?: 'store' | 'user';
}

// RegisterFormData is now imported from hooks/useRegister

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, isLoading = false, onUserTypeChange, initialUserType = 'store' }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [userType, setUserType] = useState<'store' | 'user'>(initialUserType);

  const handleUserTypeChange = (type: 'store' | 'user') => {
    setUserType(type);
    onUserTypeChange?.(type);
  };

  const currentColor = getColors(userType === 'store' ? 'STORE' : 'USER').primary;

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    email: '',
    userType: initialUserType,
    storeName: '',
    storeAddress: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormData, boolean>>>({});

  const updateField = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateField = (field: keyof RegisterFormData): string | undefined => {
    const value = formData[field];

    switch (field) {
      case 'phone':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return 'Vui lòng nhập số điện thoại';
        }
        // Remove non-digits to validate
        const phoneDigits = typeof value === 'string' ? value.replace(/\D/g, '') : '';
        if (phoneDigits.length < 10) {
          return 'Số điện thoại không hợp lệ';
        }
        break;

      case 'password':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return 'Vui lòng nhập mật khẩu';
        }
        if (typeof value === 'string') {
          // Password must be 8-16 characters and include lowercase, uppercase, number, and special character
          if (value.length < 8 || value.length > 16) {
            return 'Mật khẩu phải có độ dài 8-16 ký tự';
          }

          const hasLowercase = /[a-z]/.test(value);
          const hasUppercase = /[A-Z]/.test(value);
          const hasNumber = /[0-9]/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

          if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
            return 'Mật khẩu phải bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt';
          }
        }
        break;

      case 'confirmPassword':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return 'Vui lòng nhập lại mật khẩu';
        }
        if (value !== formData.password) {
          return 'Mật khẩu không khớp';
        }
        break;
    }

    return undefined;
  };

  const handleBlur = (field: keyof RegisterFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Comprehensive form validation
  const validateForm = (): boolean => {
    // Check all required fields
    const phoneError = validateField('phone');
    const passwordError = validateField('password');
    const confirmPasswordError = validateField('confirmPassword');

    // All fields must be valid and terms must be accepted
    return (
      !phoneError &&
      !passwordError &&
      !confirmPasswordError &&
      formData.agreeToTerms
    );
  };

  const handleRegister = () => {
    // Mark all fields as touched to show validation errors
    setTouched({
      phone: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true,
    });

    // Validate all fields
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {
      phone: validateField('phone'),
      password: validateField('password'),
      confirmPassword: validateField('confirmPassword'),
    };
    setErrors(newErrors);

    // Only proceed if form is valid
    if (!isLoading && validateForm()) {
      onRegister(formData);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'space-between',
      paddingBottom: spacing.lg,
    },
    topSection: {
      gap: spacing.md,
    },
    bottomSection: {
      gap: spacing.lg,
      paddingTop: spacing.lg,
    },
    button: {
      backgroundColor: currentColor,
    },
    disabledButton: {
      backgroundColor: colors.gray,
    },
    inlineSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.md,
    },
    loginContainer: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <UserTypeSelector
            selectedType={userType}
            onTypeChange={(type) => {
              updateField('userType', type);
              handleUserTypeChange(type);
            }}
          />

          <PhoneInput
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            onBlur={() => handleBlur('phone')}
            placeholder={t('signup:phoneInput.placeholder')}
            error={touched.phone ? errors.phone : undefined}
          />

          <PasswordInput
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            onBlur={() => handleBlur('password')}
            placeholder={t('signup:passwordInput.placeholder')}
            error={touched.password ? errors.password : undefined}
            helperText="Mật khẩu phải có độ dài 8-16 ký tự và bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt."
          />

          <ConfirmPasswordInput
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            onBlur={() => handleBlur('confirmPassword')}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
          />
        </View>

        <View style={styles.bottomSection}>
          <TermsCheckbox
            checked={formData.agreeToTerms}
            onToggle={(checked) => updateField('agreeToTerms', checked)}
            checkmarkColor={currentColor}
            linkColor={currentColor}
          />

          <Button
            label={t('signup:button.register')}
            onPress={handleRegister}
            variant="primary"
            size="lg"
            fullWidth
            disabled={isLoading || !validateForm()}
            loading={isLoading}
            style={[
              styles.button,
              (!validateForm() || isLoading) && styles.disabledButton
            ]}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterForm;
