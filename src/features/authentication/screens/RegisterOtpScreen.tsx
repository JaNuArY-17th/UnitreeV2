import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import OtpVerificationScreen from '@/shared/screens/OtpVerificationScreen';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useOTP } from '../hooks/useOTP';
import { useAppDispatch } from '@/shared/hooks/useRedux';
import { formatPhoneNumber } from '../utils/authUtils';
import { verifyOTPRegisterAsync } from '../store/authSlice';

type RegisterOtpRouteProp = RouteProp<RootStackParamList, 'RegisterOtp'>;

const RegisterOtpScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RegisterOtpRouteProp>();
  const { t } = useTranslation();

  const phone = route.params.phone;

  const {
    isLoading,
    handleResend,
  } = useOTP(phone, 'register');

  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const lastOtpRef = useRef<string | null>(null);

  const handleVerify: (otp: string) => Promise<void> = async (otp: string) => {
    try {
      // Guard against duplicate submissions (auto-submit + button press)
      if (isSubmittingRef.current) return;
      if (lastOtpRef.current === otp) return;
      isSubmittingRef.current = true;
      setSubmitting(true);
      lastOtpRef.current = otp;
      const formattedPhoneNumber = formatPhoneNumber(phone);
      const result: any = await dispatch(
        verifyOTPRegisterAsync({ phone_number: formattedPhoneNumber, otp })
      ).unwrap();

      // Show server message then redirect on user confirm
      Alert.alert(
        t('signup:success'),
        result?.message || t('authentication.otp.verificationSuccess'),
        [
          {
            text: t('signup:button.ok'),
            style: 'default',
            onPress: () => {
              navigation.navigate('Login');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        t('login:errors.otpVerificationFailed'),
        error?.message || t('login:errors.unexpectedError'),
        [{ text: t('signup:button.ok'), style: 'default' }]
      );
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };


  const onResend = async (): Promise<void> => {
    await handleResend();
  };

  return (
    <OtpVerificationScreen
      title={t('login:otpVerification.title')}
      subtitle={t('login:otpVerification.subtitle', { phone })}
      onVerify={handleVerify}
      onResend={onResend}
      onBackPress={handleGoBack}
      loading={isLoading || submitting}
      resendText={t('forgotPassword:otp.resendText')}
      resendButtonText={t('forgotPassword:otp.resendButton')}
      resendButtonDisabledText={t('forgotPassword:otp.resendDisabled')}
    />
  );
};

export default RegisterOtpScreen;
