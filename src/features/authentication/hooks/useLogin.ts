import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BIOMETRIC_QUERY_KEY } from './useBiometric';
import { bioService } from '../services/bioService';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';
import type { LoginRequest, LoginFormData, LoginFormErrors } from '../types/auth';
import {
  formatPhoneNumber,
  isValidPhoneNumber,
  isValidPassword,
  isOTPRequired,
  getErrorMessage,
  AUTH_CONSTANTS,
  credentialCache,
} from '../utils/authUtils';

/**
 * Login form validation rules
 */
const validateLoginForm = (data: LoginFormData, t: (key: string, options?: any) => string): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  // Phone validation
  if (!data.phone.trim()) {
    errors.phone = t('errors.phoneRequired');
  } else if (!isValidPhoneNumber(data.phone)) {
    errors.phone = t('errors.phoneInvalid');
  }

  // Password validation
  if (!data.password.trim()) {
    errors.password = t('errors.passwordRequired');
  } else if (!isValidPassword(data.password)) {
    errors.password = t('errors.passwordTooShort', { min: AUTH_CONSTANTS.MIN_PASSWORD_LENGTH });
  }

  return errors;
};

/**
 * Login hook with form validation and state management
 */
export const useLogin = () => {
  const { login, isLoginPending, loginError } = useAuth();
  const { t } = useTranslation('login');
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<Record<keyof LoginFormData, boolean>>({
    phone: false,
    password: false,
  });

  // Login mutation with validation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // Validate form
      const validationErrors = validateLoginForm(data, t);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        throw new Error('Validation failed');
      }

      // Clear errors
      setErrors({});

      // Format and submit
      const credentials: LoginRequest = {
        phone_number: formatPhoneNumber(data.phone),
        password: data.password,
      };

      return login(credentials);
    },
    retry: false, // Disable retry to prevent multiple API calls
    onError: (error: any) => {
      // Handle API errors
      if (error.message !== 'Validation failed') {
        setErrors({
          general: getErrorMessage(error, t('errors.loginFailed')),
        });
      }
    },
  onSuccess: async (data) => {
      // Check if OTP verification is required
      if (isOTPRequired(data)) {
        // Cache credentials for auto-login after OTP verification (new device)
        credentialCache.set({
          phone_number: formatPhoneNumber(formData.phone),
            password: formData.password,
        });
        // Don't reset form, user needs to go to OTP screen
        return;
      }

      // Reset form on successful login (when no OTP required)
      // This happens when login is successful and user is authenticated
      if (data && (data as any).access_token && !isOTPRequired(data)) {
        setFormData({ phone: '', password: '' });
        setErrors({});
        setTouched({ phone: false, password: false });
        // Prefetch biometric status to have toggle ready
        queryClient.prefetchQuery({ queryKey: BIOMETRIC_QUERY_KEY, queryFn: async () => (await bioService.checkBio()).data });
      }
    },
  });

  // Form handlers
  const updateField = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const markFieldTouched = useCallback((field: keyof LoginFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback((field: keyof LoginFormData) => {
    const fieldErrors = validateLoginForm(formData, t);
    if (fieldErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }, [formData, t]);

  const handleSubmit = useCallback(() => {
    // Mark all fields as touched
    setTouched({ phone: true, password: true });

    // Submit form
    return loginMutation.mutateAsync(formData);
  }, [formData, loginMutation]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ phone: '', password: '' });
    setErrors({});
    setTouched({ phone: false, password: false });
  }, []);

  // Computed values
  const isValid = Object.keys(validateLoginForm(formData, t)).length === 0;
  const hasErrors = Object.keys(errors).length > 0;
  const isSubmitting = loginMutation.isPending || isLoginPending;

  // Field helpers
  const getFieldError = useCallback((field: keyof LoginFormData) => {
    return touched[field] ? errors[field] : undefined;
  }, [touched, errors]);

  const isFieldValid = useCallback((field: keyof LoginFormData) => {
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

    // Form actions
    updateField,
    markFieldTouched,
    validateField,
    handleSubmit,
    clearErrors,
    resetForm,

    // Field helpers
    getFieldError,
    isFieldValid,

    // Mutation state
    isLoading: isSubmitting,
    error: loginError || errors.general,
    isSuccess: loginMutation.isSuccess,
  };
};
