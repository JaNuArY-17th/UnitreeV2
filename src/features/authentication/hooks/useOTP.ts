import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/shared/hooks/useRedux';
import {
  verifyOTPAsync,
  verifyOTPRegisterAsync,
  verifyLoginNewDeviceAsync,
  verifyOTPForgotPasswordAsync,
  resendOTPRegisterAsync,
  resendOTPLoginNewDeviceAsync,
  resendOTPForgotPasswordAsync,
} from '../store/authSlice';
import {
  isValidOTPCode,
  formatPhoneNumber,
} from '../utils/authUtils';

// OTP types
export type OTPType = 'register' | 'login-new-device' | 'forgot-password' | 'general' | 'withdraw' | 'trading';

// OTP form validation
interface OTPFormData {
  phone: string;
  otp: string;
}

interface OTPFormErrors {
  phone?: string;
  otp?: string;
  general?: string;
}

const validateOTPForm = (data: OTPFormData, t: (key: string, options?: any) => string): OTPFormErrors => {
  const errors: OTPFormErrors = {};

  // Phone validation
  if (!data.phone.trim()) {
    errors.phone = t('error.phoneRequired');
  }

  // OTP validation
  if (!data.otp.trim()) {
    errors.otp = t('error.otpRequired');
  } else if (!isValidOTPCode(data.otp)) {
    errors.otp = t('error.otpInvalid');
  }

  return errors;
};



/**
 * Enhanced OTP verification hook with support for different OTP types
 */
export const useOTP = (initialPhone?: string, otpType: OTPType = 'general') => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('otp');

  // Form state
  const [formData, setFormData] = useState<OTPFormData>({
    phone: initialPhone || '',
    otp: '',
  });

  const [errors, setErrors] = useState<OTPFormErrors>({});
  const [touched, setTouched] = useState<Record<keyof OTPFormData, boolean>>({
    phone: false,
    otp: false,
  });

  // OTP verification mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: OTPFormData) => {
      // Validate form
      const validationErrors = validateOTPForm(data, t);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        throw new Error('Validation failed');
      }

      // Clear errors
      setErrors({});

      // Format request based on OTP type
      const phoneNumber = formatPhoneNumber(data.phone);

      // Dispatch appropriate verify function based on OTP type
      // Note: All OTP verification APIs return success without tokens
      // User needs to login again to get access/refresh tokens
      switch (otpType) {
        case 'register':
          return dispatch(verifyOTPRegisterAsync({
            phone_number: phoneNumber,
            otp: data.otp,
          })).unwrap();

        case 'login-new-device':
          return dispatch(verifyLoginNewDeviceAsync({
            phone_number: phoneNumber,
            otp: data.otp,
          })).unwrap();

        case 'forgot-password':
          return dispatch(verifyOTPForgotPasswordAsync({
            phone_number: phoneNumber,
            otp: data.otp,
          })).unwrap();

        case 'withdraw':
          // Mock withdraw OTP verification since no API is available yet
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                success: true,
                message: 'Withdraw OTP verified successfully',
                data: {
                  verified: true,
                  timestamp: new Date().toISOString(),
                }
              });
            }, 1500); // Simulate API delay
          });

        case 'trading':
          // Mock trading OTP verification since no API is available yet
          console.log('🔄 useOTP: Processing trading OTP verification...', data.otp);
          return new Promise((resolve) => {
            setTimeout(() => {
              console.log('✅ useOTP: Trading OTP verification successful');
              resolve({
                success: true,
                message: 'Trading OTP verified successfully',
                data: {
                  verified: true,
                  timestamp: new Date().toISOString(),
                }
              });
            }, 1500); // Simulate API delay
          });

        default:
          return dispatch(verifyOTPAsync({
            phone_number: phoneNumber,
            otp_code: data.otp,
          })).unwrap();
      }
    },
    onError: (error: any) => {
      // Handle API errors
      if (error.message !== 'Validation failed') {
        setErrors({
          general: error.message || t('error.verificationFailed'),
        });
      }
    },
    onSuccess: () => {
      // Reset form on success
      setFormData({ phone: initialPhone || '', otp: '' });
      setErrors({});
      setTouched({ phone: false, otp: false });
    },
  });

  // Form handlers
  const updateField = useCallback((field: keyof OTPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const markFieldTouched = useCallback((field: keyof OTPFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback((field: keyof OTPFormData) => {
    const fieldErrors = validateOTPForm(formData, t);
    if (fieldErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }, [formData, t]);

  const handleSubmit = useCallback(() => {
    // Mark all fields as touched
    setTouched({ phone: true, otp: true });

    // Submit form
    return verifyMutation.mutateAsync(formData);
  }, [formData, verifyMutation]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ phone: initialPhone || '', otp: '' });
    setErrors({});
    setTouched({ phone: false, otp: false });
  }, [initialPhone]);

  // Resend OTP mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      const phoneNumber = formatPhoneNumber(formData.phone);

      // Dispatch appropriate resend function based on OTP type
      switch (otpType) {
        case 'register':
          return dispatch(resendOTPRegisterAsync({
            phone_number: phoneNumber,
          })).unwrap();

        case 'login-new-device':
          return dispatch(resendOTPLoginNewDeviceAsync({
            phone_number: phoneNumber,
          })).unwrap();

        case 'forgot-password':
          return dispatch(resendOTPForgotPasswordAsync({
            phone_number: phoneNumber,
          })).unwrap();

        case 'withdraw':
          // Mock withdraw OTP resend since no API is available yet
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                success: true,
                message: 'Withdraw OTP resent successfully',
              });
            }, 1000); // Simulate API delay
          });

        case 'trading':
          // Mock trading OTP resend since no API is available yet
          console.log('📤 useOTP: Resending trading OTP...');
          return new Promise((resolve) => {
            setTimeout(() => {
              console.log('✅ useOTP: Trading OTP resent successfully');
              resolve({
                success: true,
                message: 'Trading OTP resent successfully',
              });
            }, 1000); // Simulate API delay
          });

        default:
          throw new Error('Resend not supported for general OTP');
      }
    },
    onError: (error: any) => {
      setErrors({
        general: error.message || t('error.resendFailed'),
      });
    },
  });

  const handleResend = useCallback(() => {
    return resendMutation.mutateAsync();
  }, [resendMutation]);

  // Computed values
  const isValid = Object.keys(validateOTPForm(formData, t)).length === 0;
  const hasErrors = Object.keys(errors).length > 0;
  const isSubmitting = verifyMutation.isPending;
  const isResending = resendMutation.isPending;

  // Field helpers
  const getFieldError = useCallback((field: keyof OTPFormData) => {
    return touched[field] ? errors[field] : undefined;
  }, [touched, errors]);

  const isFieldValid = useCallback((field: keyof OTPFormData) => {
    return touched[field] && !errors[field];
  }, [touched, errors]);

  return {
    // Form state
    formData,
    errors,
    touched,
    isValid,
    hasErrors,
    isSubmitting,
    isResending,
    otpType,

    // Form actions
    updateField,
    markFieldTouched,
    validateField,
    handleSubmit,
    handleResend,
    clearErrors,
    resetForm,

    // Field helpers
    getFieldError,
    isFieldValid,

    // Mutation state
    isLoading: isSubmitting,
    error: errors.general,
    isSuccess: verifyMutation.isSuccess,
    resendSuccess: resendMutation.isSuccess,
  };
};