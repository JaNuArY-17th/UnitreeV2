import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { OTPType, OTPFormData, OTPFormErrors, OTPConfig, OTPContextData } from '../types';
import { DEFAULT_OTP_CONFIG } from '../types';
import { validateOTPForm, formatPhoneNumber } from '../utils';
import { otpServiceRegistry } from '../services';

interface UseOTPOptions {
  initialPhone?: string;
  type: OTPType;
  config?: Partial<OTPConfig>;
  context?: OTPContextData;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

/**
 * Shared OTP hook that can handle all OTP types
 */
export const useOTP = ({
  initialPhone = '',
  type,
  config = {},
  context = {},
  onSuccess,
  onError,
}: UseOTPOptions) => {
  const { t } = useTranslation('otp');
  
  // Merge default config with provided config
  const otpConfig = { ...DEFAULT_OTP_CONFIG[type], ...config };

  // Form state
  const [formData, setFormData] = useState<OTPFormData>({
    phone: initialPhone,
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
      const validationErrors = validateOTPForm(data, t, otpConfig.codeLength);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        throw new Error('Validation failed');
      }

      // Clear errors
      setErrors({});

      // Format phone number if required
      const phoneNumber = otpConfig.requirePhoneVerification 
        ? formatPhoneNumber(data.phone) 
        : data.phone;

      // Use OTP service registry to handle verification
      if (type === 'withdraw') {
        console.log('[DEBUG] useOTP: Verifying withdrawal with accountId:', context?.accountId);
      }
      
      return otpServiceRegistry.verify(
        type,
        {
          phone_number: phoneNumber,
          otp: data.otp,
        },
        context
      );
    },
    onError: (error: any) => {
      // Handle API errors
      if (error.message !== 'Validation failed') {
        setErrors({
          general: error.message || t('error.verificationFailed'),
        });
      }
      onError?.(error);
    },
    onSuccess: (result) => {
      // Reset form on success
      setFormData({ phone: initialPhone, otp: '' });
      setErrors({});
      setTouched({ phone: false, otp: false });
      onSuccess?.(result);
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
    const fieldErrors = validateOTPForm(formData, t, otpConfig.codeLength);
    if (fieldErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }, [formData, t, otpConfig.codeLength]);

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
    setFormData({ phone: initialPhone, otp: '' });
    setErrors({});
    setTouched({ phone: false, otp: false });
  }, [initialPhone]);

  // Resend OTP mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      const phoneNumber = otpConfig.requirePhoneVerification 
        ? formatPhoneNumber(formData.phone) 
        : formData.phone;

      return otpServiceRegistry.resend(
        type,
        {
          phone_number: phoneNumber,
        },
        context
      );
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
  const isValid = Object.keys(validateOTPForm(formData, t, otpConfig.codeLength)).length === 0;
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
    // Configuration
    config: otpConfig,
    type,
    
    // Form state
    formData,
    errors,
    touched,
    isValid,
    hasErrors,
    isSubmitting,
    isResending,

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
