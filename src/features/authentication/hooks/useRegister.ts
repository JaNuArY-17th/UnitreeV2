import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { RegisterRequest, RegisterResponse, AuthApiResponse } from '../types/auth';

export interface RegisterFormData {
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  email?: string;
  userType: 'store' | 'user';
  storeName?: string;
  storeAddress?: string;
  agreeToTerms: boolean;
}

// No extended fields needed - using basic RegisterRequest

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = useMutation<
    AuthApiResponse<RegisterResponse>,
    Error,
    { request: RegisterRequest; userType: 'store' | 'user' }
  >({
    mutationFn: async ({ request, userType }) => {
      // Choose the correct API based on user type
      if (userType === 'store') {
        return await authService.registerStore(request);
      } else {
        return await authService.register(request);
      }
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const register = async (formData: RegisterFormData): Promise<AuthApiResponse<RegisterResponse>> => {
    // Transform form data to basic API request format
    const registerRequest: RegisterRequest = {
      phone_number: formData.phone,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      // referral_code is optional and not currently collected in form
    };

    return registerMutation.mutateAsync({
      request: registerRequest,
      userType: formData.userType,
    });
  };

  return {
    register,
    isLoading: isLoading || registerMutation.isPending,
    error: registerMutation.error,
    isSuccess: registerMutation.isSuccess,
    isError: registerMutation.isError,
    reset: registerMutation.reset,
    data: registerMutation.data,
  };
};