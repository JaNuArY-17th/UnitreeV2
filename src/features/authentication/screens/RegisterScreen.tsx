import React, { useState } from 'react';
import { View, StyleSheet, Platform, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import RegisterForm from '../components/RegisterScreen/RegisterForm';
import type { RegisterFormData } from '../hooks/useRegister';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { spacing, colors } from '@/shared/themes';
import { getColors } from '@/shared/themes/colors';
import { KeyboardDismissWrapper } from '@/shared/components/base';
import { formatPhoneNumber } from '../utils/authUtils';
import { useRegister } from '../hooks/useRegister';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import ScreenHeader from '@/shared/components/ScreenHeader';

// Dynamic colors for different user types
const getUserTypeColor = (userType: 'store' | 'user') => {
  const accountType = userType === 'store' ? 'STORE' : 'USER';
  return getColors(accountType).primary;
};

interface RegisterScreenProps {
  // Props can be added here in the future
}

const RegisterScreen: React.FC<RegisterScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Register'>>();
  const { register, isLoading } = useRegister();

  // Get userType from navigation params or default to 'store'
  const initialUserType = route.params?.userType || 'store';
  const [userType, setUserType] = useState<'store' | 'user'>(initialUserType);

  const currentColor = getUserTypeColor(userType);

  const handleRegister = async (formData: RegisterFormData) => {
    try {
      // Format phone number
      const formattedFormData: RegisterFormData = {
        ...formData,
        phone: formatPhoneNumber(formData.phone),
      };

      console.log('🔍 Register request:', {
        userType: formattedFormData.userType,
        phone: formattedFormData.phone,
        endpoint: formattedFormData.userType === 'store' ? 'registerStore' : 'register',
      });

      // Call the appropriate API based on user type
      const result = await register(formattedFormData);

      console.log('✅ Registration successful:', result);

      // Check if registration was successful
      if (result.success) {
        // Registration requires OTP by default → navigate to RegisterOtp
        // Be tolerant of different response shapes
        const otpSent = Boolean(
          (result as any)?.data?.otp_sent ??
          (result as any)?.otp_sent ??
          (result as any)?.data?.is_verified === false
        );

        if (otpSent) {
          navigation.navigate('RegisterOtp', { phone: formattedFormData.phone });
        } else {
          navigation.navigate('Login');
        }
      } else {
        throw new Error(result.message || t('signup:errors.unexpectedError'));
      }

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      const message = error?.message || error?.data?.message || error?.response?.data?.message || t('signup:errors.unexpectedError');
      Alert.alert(
        t('signup:errors.registrationFailed'),
        message,
        [{ text: t('common:ok'), style: 'default' }]
      );
    }
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  const handleGoBack = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={'transparent'} />

      <KeyboardDismissWrapper style={StyleSheet.flatten([styles.container, { paddingTop: insets.top }])}>
        <ScreenHeader
          title={t('signup:title')}
          showBack={true}
          onBackPress={handleGoBack}
          backIconColor={currentColor}
          titleStyle={{ color: currentColor }}
        />

        {/* Content */}
        <View style={styles.content}>
          <RegisterForm onRegister={handleRegister} isLoading={isLoading} onUserTypeChange={setUserType} initialUserType={initialUserType} />
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
    gap: spacing.xl,
    height: '100%'
  },
});

export default RegisterScreen;
