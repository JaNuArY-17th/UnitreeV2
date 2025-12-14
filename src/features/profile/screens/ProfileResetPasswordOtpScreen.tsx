import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import OtpVerificationScreen from '@/shared/screens/OtpVerificationScreen';
import { useTranslation } from '@/shared/hooks/useTranslation';

type ProfileResetPasswordOtpRouteProp = RouteProp<RootStackParamList, 'ProfileResetPasswordOtp'>;

const ProfileResetPasswordOtpScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProfileResetPasswordOtpRouteProp>();
  const { t } = useTranslation();
  const { t: profileT } = useTranslation('profile');
  const [isLoading, setIsLoading] = useState(false);

  const { phone } = route.params;

  const handleVerify = async (otp: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement OTP verification API call for profile reset password
      console.log('Verifying OTP:', otp, 'for phone:', phone);

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 2000));

      // For demo purposes, accept any 6-digit OTP
      if (otp.length === 6) {
        // Navigate to reset password screen and replace the OTP screen in the stack
        console.log('OTP verified successfully');
        navigation.replace('ProfileResetPasswordNewPassword', { phone, token: 'temp-token' });
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
      // TODO: Implement resend OTP API call for profile reset password
      console.log('Resending OTP to phone:', phone);

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };


  return (
    <OtpVerificationScreen
      title={profileT('resetPassword.title')}
      subtitle={profileT('resetPassword.otp.subtitle', { phone })}
      onVerify={handleVerify}
      onResend={handleResend}
      onBackPress={handleBack}
      loading={isLoading}
      resendText={profileT('resetPassword.otp.resendText')}
      resendButtonText={profileT('resetPassword.otp.resendButton')}
      resendButtonDisabledText={profileT('resetPassword.otp.resendDisabled')}
      codeLength={6}
      resendSeconds={30}
    />
  );
};

export default ProfileResetPasswordOtpScreen;
