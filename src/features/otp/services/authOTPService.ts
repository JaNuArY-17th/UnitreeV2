import { useAppDispatch } from '@/shared/hooks/useRedux';
import {
  verifyOTPAsync,
  verifyOTPRegisterAsync,
  verifyLoginNewDeviceAsync,
  verifyOTPForgotPasswordAsync,
  resendOTPRegisterAsync,
  resendOTPLoginNewDeviceAsync,
  resendOTPForgotPasswordAsync,
} from '@/features/authentication/store/authSlice';
import { formatPhoneNumber } from '../utils';
import type { IOTPService } from './otpService';
import type { OTPType, BaseOTPVerificationRequest, BaseOTPVerificationResponse, BaseOTPResendRequest, BaseOTPResendResponse } from '../types';

/**
 * OTP service adapter for authentication-related OTP operations
 * Bridges the new OTP service interface with existing authentication Redux actions
 */
export class AuthOTPService implements IOTPService {
  constructor(private dispatch: ReturnType<typeof useAppDispatch>) { }

  async verify(type: OTPType, request: BaseOTPVerificationRequest): Promise<BaseOTPVerificationResponse> {
    const phoneNumber = formatPhoneNumber(request.phone_number || '');

    try {
      let authResponse: any;

      switch (type) {
        case 'register':
          authResponse = await this.dispatch(verifyOTPRegisterAsync({
            phone_number: phoneNumber,
            otp: request.otp,
          })).unwrap();
          break;

        case 'login-new-device':
          authResponse = await this.dispatch(verifyLoginNewDeviceAsync({
            phone_number: phoneNumber,
            otp: request.otp,
          })).unwrap();
          break;

        case 'forgot-password':
          authResponse = await this.dispatch(verifyOTPForgotPasswordAsync({
            phone_number: phoneNumber,
            otp: request.otp,
          })).unwrap();
          break;

        case 'general':
          authResponse = await this.dispatch(verifyOTPAsync({
            phone_number: phoneNumber,
            otp_code: request.otp,
          })).unwrap();
          break;

        default:
          throw new Error(`Unsupported authentication OTP type: ${type}`);
      }

      // Transform authentication response to base OTP response format
      return {
        success: true,
        message: authResponse.message || 'OTP verified successfully',
        data: authResponse,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'OTP verification failed',
        data: error,
      };
    }
  }

  async resend(type: OTPType, request: BaseOTPResendRequest): Promise<BaseOTPResendResponse> {
    const phoneNumber = formatPhoneNumber(request.phone_number || '');

    try {
      let authResponse: any;

      switch (type) {
        case 'register':
          authResponse = await this.dispatch(resendOTPRegisterAsync({
            phone_number: phoneNumber,
          })).unwrap();
          break;

        case 'login-new-device':
          authResponse = await this.dispatch(resendOTPLoginNewDeviceAsync({
            phone_number: phoneNumber,
          })).unwrap();
          break;

        case 'forgot-password':
          authResponse = await this.dispatch(resendOTPForgotPasswordAsync({
            phone_number: phoneNumber,
          })).unwrap();
          break;

        default:
          throw new Error(`Resend not supported for authentication OTP type: ${type}`);
      }

      // Transform authentication response to base OTP response format
      return {
        success: true,
        message: authResponse.message || 'OTP resent successfully',
        otp_sent: authResponse.otp_sent ?? true,
        phone_number: authResponse.phone_number || phoneNumber,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'OTP resend failed',
        otp_sent: false,
        phone_number: phoneNumber,
      };
    }
  }
}

/**
 * Hook to create and register authentication OTP service
 */
export const useAuthOTPService = () => {
  const dispatch = useAppDispatch();
  return new AuthOTPService(dispatch);
};
