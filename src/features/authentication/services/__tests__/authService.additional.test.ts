/**
 * Tests for additional authService functionality
 * Tests for register OTP, login new device OTP, forgot password APIs
 */

import { authService } from '../authService';
import { apiClient } from '@/shared/utils/axios';

// Mock the apiClient
jest.mock('@/shared/utils/axios', () => ({
  apiClient: {
    post: jest.fn(),
    setAuthTokens: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AuthService - Additional APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Register OTP APIs', () => {
    describe('verifyOTPRegister', () => {
      it('should verify register OTP successfully', async () => {
        const mockRequest = {
          phone_number: '84987654321',
          otp: '123456',
        };

        const mockResponse = {
          success: true,
          data: {
            user: {
              id: '1',
              phone_number: '84987654321',
              is_verified: true,
            },
            access_token: 'access_token_123',
            refresh_token: 'refresh_token_123',
            expires_in: 3600,
            message: 'Register OTP verified successfully',
          },
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.verifyOTPRegister(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/iam/v1/auth/verify-otp-register',
          mockRequest
        );
        // Note: OTP verification no longer sets tokens
        expect(mockApiClient.setAuthTokens).not.toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
      });

      it('should handle register OTP verification failure', async () => {
        const mockRequest = {
          phone_number: '84987654321',
          otp: '123456',
        };

        const mockError = {
          message: 'Invalid OTP',
          errors: { otp: ['Invalid OTP code'] },
        };

        mockApiClient.post.mockRejectedValue(mockError);

        await expect(authService.verifyOTPRegister(mockRequest)).rejects.toEqual({
          success: false,
          message: 'Invalid OTP',
          errors: { otp: ['Invalid OTP code'] },
        });

        expect(mockApiClient.setAuthTokens).not.toHaveBeenCalled();
      });
    });

    describe('resendOTPRegister', () => {
      it('should resend register OTP successfully', async () => {
        const mockRequest = {
          phone_number: '84987654321',
        };

        const mockResponse = {
          success: true,
          data: {
            message: 'OTP sent successfully',
            otp_sent: true,
            phone_number: '84987654321',
          },
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.resendOTPRegister(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/iam/v1/auth/resend-otp-register',
          mockRequest
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Login New Device OTP APIs', () => {
    describe('verifyLoginNewDevice', () => {
      it('should verify login new device OTP successfully', async () => {
        const mockRequest = {
          phone_number: '84987654321',
          otp: '123456',
        };

        const mockResponse = {
          success: true,
          data: {
            user: {
              id: '1',
              phone_number: '84987654321',
              is_verified: true,
            },
            access_token: 'access_token_123',
            refresh_token: 'refresh_token_123',
            expires_in: 3600,
            message: 'Login new device OTP verified successfully',
          },
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.verifyLoginNewDevice(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/iam/v1/auth/verify-login-new-device',
          mockRequest
        );
        // Note: OTP verification no longer sets tokens
        expect(mockApiClient.setAuthTokens).not.toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
      });
    });

    describe('resendOTPLoginNewDevice', () => {
      it('should resend login new device OTP successfully', async () => {
        const mockRequest = {
          phone_number: '84987654321',
        };

        const mockResponse = {
          success: true,
          data: {
            message: 'OTP sent successfully',
            otp_sent: true,
            phone_number: '84987654321',
          },
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.resendOTPLoginNewDevice(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/iam/v1/auth/resend-otp-login-new-device',
          mockRequest
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Forgot Password APIs', () => {
    describe('forgotPassword', () => {
      it('should send forgot password OTP successfully', async () => {
        const mockRequest = {
          phone_number: '84987654321',
        };

        const mockResponse = {
          success: true,
          data: {
            message: 'OTP sent successfully',
            otp_sent: true,
            phone_number: '84987654321',
          },
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.forgotPassword(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/iam/v1/auth/forgot-password',
          mockRequest
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('verifyOTPForgotPassword', () => {
      it('should verify forgot password OTP successfully', async () => {
        const mockRequest = {
          phone_number: '84987654321',
          otp: '123456',
        };

        const mockResponse = {
          success: true,
          data: {
            message: 'OTP verified successfully',
            reset_token: 'reset_token_123',
            phone_number: '84987654321',
          },
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.verifyOTPForgotPassword(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/iam/v1/auth/verify-otp-forgot-password',
          mockRequest
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('resetPassword', () => {
      it('should reset password successfully', async () => {
        const mockRequest = {
          phone_number: '84987654321',
          reset_token: 'reset_token_123',
          new_password: 'newpassword123',
          confirm_password: 'newpassword123',
        };

        const mockResponse = {
          success: true,
          data: {
            message: 'Password reset successfully',
            user: {
              id: '1',
              phone_number: '84987654321',
              is_verified: true,
            },
          },
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.resetPassword(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/iam/v1/auth/reset-password',
          mockRequest
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('resendOTPForgotPassword', () => {
      it('should resend forgot password OTP successfully', async () => {
        const mockRequest = {
          phone_number: '84987654321',
        };

        const mockResponse = {
          success: true,
          data: {
            message: 'OTP sent successfully',
            otp_sent: true,
            phone_number: '84987654321',
          },
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.resendOTPForgotPassword(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/iam/v1/auth/resend-otp-forgot-password',
          mockRequest
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });
});
