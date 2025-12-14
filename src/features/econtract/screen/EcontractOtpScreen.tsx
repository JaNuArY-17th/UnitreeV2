import React, { useMemo, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import OtpVerificationScreen from '@/shared/screens/OtpVerificationScreen';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAlert } from '@/shared/providers/AlertProvider';
import { useAppDispatch } from '@/shared/hooks/useRedux';
import { otpServiceRegistry } from '@/features/otp/services/otpService';
import { initializeOTPServices as setupOtpServices } from '@/features/otp/setup';

// Types for route params expected from EcontractSigning navigation
interface EcontractOtpParams {
  phone: string;
  otpType?: 'econtract-signing';
  context?: {
    signatureBase64: string;
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
  };
}

type EcontractOtpRouteProp = RouteProp<{ EcontractOtp: EcontractOtpParams }, 'EcontractOtp'>;

type Nav = NativeStackNavigationProp<any>;

const EcontractOtpScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<EcontractOtpRouteProp>();
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const dispatch = useAppDispatch();

  // Ensure OTP services (including econtract) are registered
  useMemo(() => {
    try {
      setupOtpServices(dispatch);
    } catch (_) {
      // no-op: setup may already be called by parent (EcontractSigning)
    }
    // Only run once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const params = (route.params || {}) as EcontractOtpParams;
  const phone = params.phone;
  const otpType: 'econtract-signing' = (params.otpType as any) || 'econtract-signing';
  const context = params.context || {} as EcontractOtpParams['context'];

  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const lastOtpRef = useRef<string | null>(null);

  const handleVerify = async (otp: string) => {
    try {
      if (isSubmittingRef.current) return;
      if (lastOtpRef.current === otp) return;
      isSubmittingRef.current = true;
      setSubmitting(true);
      lastOtpRef.current = otp;

      const result = await otpServiceRegistry.verify(otpType, {
        phone_number: phone,
        otp,
      } as any, {
        signatureBase64: context?.signatureBase64,
      });

      if (result?.success) {
        // Forward to consumer callback if provided
        context?.onSuccess?.(result);
      } else {
        throw new Error(result?.message || t('login:errors.otpVerificationFailed'));
      }
    } catch (error: any) {
      // Forward to consumer error callback first
      if (context?.onError) {
        context.onError(error);
      } else {
        showAlert({
          title: t('login:errors.otpVerificationFailed'),
          message: error?.message || t('login:errors.unexpectedError'),
          buttons: [{ text: t('signup:button.ok'), style: 'default' }],
        });
      }
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);
      await otpServiceRegistry.resend(otpType, {
        phone_number: phone,
      } as any, {
        signatureBase64: context?.signatureBase64,
      });
    } catch (error) {
      // Best-effort: errors are handled via alerts in verify step usually
    } finally {
      setIsLoading(false);
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
      resendText={t('forgotPassword:otp.resendText')}
      resendButtonText={t('forgotPassword:otp.resendButton')}
      resendButtonDisabledText={t('forgotPassword:otp.resendDisabled')}
    />
  );
};

export default EcontractOtpScreen;
