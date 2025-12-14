import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import OtpVerificationScreen from '@/shared/screens/OtpVerificationScreen';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { getLoadingAnimation } from '@/shared/assets/animations';

type ForgotPasswordOtpRouteProp = RouteProp<RootStackParamList, 'ForgotPasswordOtp'>;

const ForgotPasswordOtpScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ForgotPasswordOtpRouteProp>();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const { phone } = route.params;

  const handleVerify = async (otp: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement OTP verification API call
      console.log('Verifying OTP:', otp, 'for phone:', phone);

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 2000));

      // For demo purposes, accept any 6-digit OTP
      if (otp.length === 6) {
        // Navigate to reset password screen
        console.log('OTP verified successfully');
        navigation.navigate('ResetPassword', { phone, token: otp });
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      // TODO: Implement resend OTP API call
      console.log('Resending OTP to phone:', phone);

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      console.log('OTP resent successfully');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Get custom animation for forgot password flow
  const forgotPasswordAnimation = getLoadingAnimation('hub');

  return (
    <OtpVerificationScreen
      title={t('forgotPassword:otp.title')}
      subtitle={t('forgotPassword:otp.subtitle', { phone })}
      onVerify={handleVerify}
      onResend={handleResend}
      onBackPress={handleBackPress}
      resendText={t('forgotPassword:otp.resendText')}
      resendButtonText={t('forgotPassword:otp.resendButton')}
      resendButtonDisabledText={t('forgotPassword:otp.resendDisabled')}
      codeLength={6}
      resendSeconds={30}
    />
  );
};

export default ForgotPasswordOtpScreen;
