/**
 * Tests for authService register functionality
 */

import { authService } from '../authService';
import { apiClient } from '@/shared/utils/axios';
import type { RegisterRequest, RegisterResponse } from '../../types/auth';

// Mock the apiClient
jest.mock('@/shared/utils/axios', () => ({
  apiClient: {
    post: jest.fn(),
    setAuthTokens: jest.fn(),
    clearAuthTokens: jest.fn(),
    hasAuthToken: jest.fn(),
    getAuthToken: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AuthService - Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockRegisterRequest: RegisterRequest = {
      phone_number: '84987654321',
      password: 'password123',
      confirm_password: 'password123',
      referral_code: 'ABC123',
    };

    it('should register user successfully with OTP required', async () => {
      const mockResponse: RegisterResponse = {
        message: 'Please verify with OTP',
        is_new_device: true,
        is_verified: false,
        otp_sent: true,
        phone_number: '84987654321',
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await authService.register(mockRegisterRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/iam/v1/auth/register',
        mockRegisterRequest
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      // Should not store tokens when OTP is required
      expect(mockApiClient.setAuthTokens).not.toHaveBeenCalled();
    });

    it('should register user successfully and store tokens when verified', async () => {
      const mockResponse: RegisterResponse = {
        user: {
          id: '1',
          phone_number: '84987654321',
          email: null,
          full_name: null,
          is_verified: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_123',
        expires_in: 3600,
        is_verified: true,
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await authService.register(mockRegisterRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/iam/v1/auth/register',
        mockRegisterRequest
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      // Should store tokens when user is verified
      expect(mockApiClient.setAuthTokens).toHaveBeenCalledWith(
        'access_token_123',
        'refresh_token_123'
      );
    });

    it('should register user without referral code', async () => {
      const requestWithoutReferral: RegisterRequest = {
        phone_number: '84987654321',
        password: 'password123',
        confirm_password: 'password123',
      };

      const mockResponse: RegisterResponse = {
        message: 'Please verify with OTP',
        is_new_device: true,
        is_verified: false,
        otp_sent: true,
        phone_number: '84987654321',
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await authService.register(requestWithoutReferral);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/iam/v1/auth/register',
        requestWithoutReferral
      );
      expect(result.success).toBe(true);
    });

    it('should handle registration failure', async () => {
      const mockError = {
        message: 'Phone number already exists',
        errors: {
          phone_number: ['This phone number is already registered'],
        },
      };

      mockApiClient.post.mockRejectedValue(mockError);

      await expect(authService.register(mockRegisterRequest)).rejects.toEqual({
        success: false,
        message: 'Phone number already exists',
        errors: {
          phone_number: ['This phone number is already registered'],
        },
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/iam/v1/auth/register',
        mockRegisterRequest
      );
      expect(mockApiClient.setAuthTokens).not.toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network Error');

      mockApiClient.post.mockRejectedValue(networkError);

      await expect(authService.register(mockRegisterRequest)).rejects.toEqual({
        success: false,
        message: 'Network Error',
        errors: undefined,
      });
    });

    it('should handle registration with partial response', async () => {
      const mockResponse: RegisterResponse = {
        access_token: 'access_token_123',
        // Missing refresh_token and is_verified
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await authService.register(mockRegisterRequest);

      expect(result.success).toBe(true);
      // Should not store tokens when response is incomplete
      expect(mockApiClient.setAuthTokens).not.toHaveBeenCalled();
    });

    it('should handle empty response', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await authService.register(mockRegisterRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(mockApiClient.setAuthTokens).not.toHaveBeenCalled();
    });
  });
});
