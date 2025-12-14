import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import OtpVerificationScreen from '@/shared/screens/OtpVerificationScreen';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatPhoneNumber } from '../utils/authUtils';
import { useAppDispatch } from '@/shared/hooks/useRedux';
import { verifyLoginNewDeviceAsync, resendOTPLoginNewDeviceAsync } from '../store/authSlice';
import { AutoLoginUtils } from '../utils/autoLoginUtils';
import { updateColorsForAccountType } from '@/shared/themes/colors';

type LoginOtpRouteProp = RouteProp<RootStackParamList, 'LoginOtp'>;

const LoginOtpScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<LoginOtpRouteProp>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const { phone, userType } = route.params;

  const handleVerify = async (otp: string) => {
    setIsLoading(true);
    try {
      // Format phone number and call the OTP verification API
      const formattedPhoneNumber = formatPhoneNumber(phone);
      await dispatch(verifyLoginNewDeviceAsync({
        phone_number: formattedPhoneNumber,
        otp
      })).unwrap();

      // Save user type to remember the login tab for next time
      await AutoLoginUtils.handleLoginSuccess(userType);

      // Update app colors based on user type
      const accountType = userType === 'store' ? 'STORE' : 'USER';
      updateColorsForAccountType(accountType);
      console.log(`🎨 [LoginOtpScreen] Updated app colors for ${accountType}`);

      // Success! Navigation will be handled automatically by the authentication state change
      // No need to show success modal - user will be redirected to the main app

    } catch (error: any) {
      Alert.alert(
        t('login:errors.otpVerificationFailed'),
        error?.message || t('login:errors.unexpectedError'),
        [{ text: t('common:ok'), style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      // Format phone number and call the resend OTP API
      const formattedPhoneNumber = formatPhoneNumber(phone);
      await dispatch(resendOTPLoginNewDeviceAsync({
        phone_number: formattedPhoneNumber
      })).unwrap();

      Alert.alert(
        t('common:success'),
        t('login:otpResentSuccess'),
        [{ text: t('common:ok'), style: 'default' }]
      );
    } catch (error: any) {
      Alert.alert(
        t('common:error'),
        error?.message || t('login:errors.unexpectedError'),
        [{ text: t('common:ok'), style: 'default' }]
      );
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };


  return (
    <OtpVerificationScreen
      title={t('login:otpVerification.title')}
      subtitle={t('login:otpVerification.subtitle', { phone })}
      onVerify={handleVerify}
      onResend={handleResend}
      onBackPress={handleGoBack}
      loading={isLoading}
      resendText={t('forgotPassword:otp.resendText')}
      resendButtonText={t('forgotPassword:otp.resendButton')}
      resendButtonDisabledText={t('forgotPassword:otp.resendDisabled')}
    />
  );
};

export default LoginOtpScreen;
