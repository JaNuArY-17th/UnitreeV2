/**
 * Tests for authSlice login functionality
 */

import { configureStore } from '@reduxjs/toolkit';
import authSlice, { loginAsync } from '../authSlice';
import { authService } from '../../services/authService';
import type { LoginRequest } from '../../types/auth';

// Mock the authService
jest.mock('../../services/authService', () => ({
  authService: {
    login: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('authSlice - loginAsync', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    });
    jest.clearAllMocks();
  });

  const mockLoginRequest: LoginRequest = {
    phone_number: '84987654321',
    password: 'password123',
  };

  describe('successful login without OTP', () => {
    it('should set isAuthenticated to true when login successful with tokens', async () => {
      const mockResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: '1',
            phone_number: '84987654321',
            email: null,
            full_name: null,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'refresh_token_123',
          expires_in: 3600,
          message: 'Login successful',
        },
        code: 200,
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await store.dispatch(loginAsync(mockLoginRequest));

      expect(result.type).toBe('auth/login/fulfilled');
      expect(result.payload).toEqual(mockResponse.data);

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.accessToken).toBe(mockResponse.data.access_token);
      expect(state.refreshToken).toBe(mockResponse.data.refresh_token);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('successful login with OTP required', () => {
    it('should NOT set isAuthenticated when OTP is required', async () => {
      const mockResponse = {
        success: true,
        message: 'Login successful',
        data: {
          message: 'Please verify with OTP',
          is_new_device: true,
          is_verified: false,
          phone_number: '84987654321',
        },
        code: 200,
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await store.dispatch(loginAsync(mockLoginRequest));

      expect(result.type).toBe('auth/login/fulfilled');
      expect(result.payload).toEqual({
        ...mockResponse.data,
        code: mockResponse.code,
        message: mockResponse.message,
        is_new_device: true,
        is_verified: false,
      });

      const state = store.getState().auth;
      // Should NOT be authenticated when OTP is required
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should NOT set isAuthenticated when is_verified is false', async () => {
      const mockResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: '1',
            phone_number: '84987654321',
            is_verified: false, // This should trigger OTP requirement
          },
          access_token: 'some_token',
          is_verified: false,
        },
        code: 200,
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await store.dispatch(loginAsync(mockLoginRequest));

      expect(result.type).toBe('auth/login/fulfilled');

      const state = store.getState().auth;
      // Should NOT be authenticated when is_verified is false
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
    });

    it('should NOT set isAuthenticated when is_new_device is true', async () => {
      const mockResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: '1',
            phone_number: '84987654321',
          },
          access_token: 'some_token',
          is_new_device: true, // This should trigger OTP requirement
        },
        code: 200,
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await store.dispatch(loginAsync(mockLoginRequest));

      expect(result.type).toBe('auth/login/fulfilled');

      const state = store.getState().auth;
      // Should NOT be authenticated when is_new_device is true
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
    });
  });

  describe('login failure', () => {
    it('should handle login failure', async () => {
      const mockError = {
        message: 'Invalid credentials',
        errors: {
          phone_number: ['Invalid phone number'],
        },
      };

      mockAuthService.login.mockRejectedValue(mockError);

      const result = await store.dispatch(loginAsync(mockLoginRequest));

      expect(result.type).toBe('auth/login/rejected');

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('should handle API response with success: false', async () => {
      const mockResponse = {
        success: false,
        message: 'Login failed',
        data: null,
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await store.dispatch(loginAsync(mockLoginRequest));

      expect(result.type).toBe('auth/login/rejected');

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Login failed');
    });
  });

  describe('loading states', () => {
    it('should set loading to true when login is pending', () => {
      const promise = store.dispatch(loginAsync(mockLoginRequest));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      // Clean up
      promise.catch(() => {}); // Prevent unhandled promise rejection
    });
  });
});
