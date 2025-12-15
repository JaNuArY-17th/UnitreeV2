import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config';
import * as RNFS from 'react-native-fs';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  OTPVerificationRequest,
  OTPVerificationResponse,
  AuthApiResponse,
  RegisterOTPVerificationRequest,
  RegisterOTPVerificationResponse,
  ResendOTPRequest,
  ResendOTPResponse,
  LoginNewDeviceOTPVerificationRequest,
  LoginNewDeviceOTPVerificationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ForgotPasswordOTPVerificationRequest,
  ForgotPasswordOTPVerificationResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/auth';
import type { User, CurrentUserResponse } from '../types/user';

// API endpoints - using centralized configuration
const AUTH_ENDPOINTS = {
  LOGIN: API_ENDPOINTS.AUTH.LOGIN,
  LOGIN_STORE: API_ENDPOINTS.AUTH.LOGIN_STORE,
  REGISTER: API_ENDPOINTS.AUTH.REGISTER,
  REGISTER_STORE: API_ENDPOINTS.AUTH.REGISTER_STORE,
  VERIFY_OTP: API_ENDPOINTS.AUTH.VERIFY_OTP,
  LOGOUT: API_ENDPOINTS.AUTH.LOGOUT,
  REFRESH: API_ENDPOINTS.AUTH.REFRESH_TOKEN,
  ME: API_ENDPOINTS.AUTH.CURRENT_USER,
  // Register OTP endpoints
  VERIFY_OTP_REGISTER: API_ENDPOINTS.AUTH.VERIFY_OTP_REGISTER,
  RESEND_OTP_REGISTER: API_ENDPOINTS.AUTH.RESEND_OTP_REGISTER,
  // Login new device OTP endpoints
  VERIFY_LOGIN_NEW_DEVICE: API_ENDPOINTS.AUTH.VERIFY_LOGIN_NEW_DEVICE,
  RESEND_OTP_LOGIN_NEW_DEVICE: API_ENDPOINTS.AUTH.RESEND_OTP_LOGIN_NEW_DEVICE,
  // Forgot password endpoints
  FORGOT_PASSWORD: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
  VERIFY_OTP_FORGOT_PASSWORD: API_ENDPOINTS.AUTH.VERIFY_OTP_FORGOT_PASSWORD,
  RESET_PASSWORD: API_ENDPOINTS.AUTH.RESET_PASSWORD,
  RESEND_OTP_FORGOT_PASSWORD: API_ENDPOINTS.AUTH.RESEND_OTP_FORGOT_PASSWORD,
} as const;

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  private static instance: AuthService;

  private constructor() { }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login user with phone and password
   */
  async login(credentials: LoginRequest): Promise<AuthApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials
      );

      // Store tokens after successful login (only if not OTP required)
      // response.data is the API response from server, which has nested data
      const apiResponse = response.data as any;
      if (response.success && apiResponse && apiResponse.data && apiResponse.data.access_token) {
        await apiClient.setAuthTokens(
          apiResponse.data.access_token,
          apiResponse.data.refresh_token
        );
        
        // Trigger auth state update to notify UI
        const { authGuard } = await import('@/shared/services/authGuard');
        authGuard.triggerAuthUpdate();
      }

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Login failed',
        errors: error.errors,
      };
    }
  }

    /**
   * Login store with phone and password
   */
  async loginStore(credentials: LoginRequest): Promise<AuthApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(
        AUTH_ENDPOINTS.LOGIN_STORE,
        credentials
      );

      // Store tokens after successful login (only if not OTP required)
      // response.data is the API response from server, which has nested data
      const apiResponse = response.data as any;
      if (response.success && apiResponse && apiResponse.data && apiResponse.data.access_token) {
        await apiClient.setAuthTokens(
          apiResponse.data.access_token,
          apiResponse.data.refresh_token
        );
        
        // Trigger auth state update to notify UI
        const { authGuard } = await import('@/shared/services/authGuard');
        authGuard.triggerAuthUpdate();
      }

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Login failed',
        errors: error.errors,
      };
    }
  }

  /**
   * Register new user with phone number, password and optional referral code
   */
  async register(userData: RegisterRequest): Promise<AuthApiResponse<RegisterResponse>> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        AUTH_ENDPOINTS.REGISTER,
        userData
      );

      // Note: Registration typically requires OTP verification
      // So we don't store tokens immediately unless explicitly provided
      if (response.success && response.data && response.data.access_token && response.data.is_verified) {
        await apiClient.setAuthTokens(
          response.data.access_token,
          response.data.refresh_token
        );
      }

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Registration failed',
        errors: error.errors,
      };
    }
  }

  /**
   * Register store with phone number, password and optional referral code
   */
  async registerStore(userData: RegisterRequest): Promise<AuthApiResponse<RegisterResponse>> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        AUTH_ENDPOINTS.REGISTER_STORE,
        userData
      );

      // Note: Registration typically requires OTP verification
      // So we don't store tokens immediately unless explicitly provided
      if (response.success && response.data && response.data.access_token && response.data.is_verified) {
        await apiClient.setAuthTokens(
          response.data.access_token,
          response.data.refresh_token
        );
      }

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Registration store failed',
        errors: error.errors,
      };
    }
  }

  /**
   * Logout user
   */
  async logout(request?: LogoutRequest): Promise<AuthApiResponse<void>> {
    try {
      // Call logout endpoint if refresh token is available
      if (request?.refresh_token) {
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT, request);
      }

      // Clear tokens from storage
      await apiClient.clearAuthTokens();

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error: any) {
      // Even if API call fails, clear local tokens
      await apiClient.clearAuthTokens();

      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  }

  /**
   * Verify OTP for new device
   */
  async verifyOTP(request: OTPVerificationRequest): Promise<AuthApiResponse<OTPVerificationResponse>> {
    try {
      const response = await apiClient.post<OTPVerificationResponse>(
        AUTH_ENDPOINTS.VERIFY_OTP,
        request
      );

      // Note: OTP verification does not return tokens
      // User needs to login again to get authentication tokens

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'OTP verification failed',
        errors: error.errors,
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(request: RefreshTokenRequest): Promise<AuthApiResponse<RefreshTokenResponse>> {
    try {
      const response = await apiClient.post<any>(
        AUTH_ENDPOINTS.REFRESH,
        request
      );

      console.log('🔄 Raw refresh token response:', {
        success: response.success,
        message: response.message,
        dataKeys: response.data ? Object.keys(response.data) : 'no data',
        fullData: response.data
      });

      // The response from apiClient.post is wrapped: { success, data: serverResponse, message }
      // Server response structure: { data: { access_token }, message, success, code }
      const serverData = response.data;
      const newAccessToken = serverData?.data?.access_token || serverData?.access_token;

      console.log('🔄 Token extraction:', {
        hasServerData: !!serverData,
        serverDataKeys: serverData ? Object.keys(serverData) : 'none',
        accessTokenFromData: serverData?.data?.access_token,
        accessTokenDirect: serverData?.access_token,
        finalToken: newAccessToken
      });

      if (newAccessToken) {
        console.log('✅ Updating tokens with new access token:', newAccessToken.substring(0, 20) + '...');
        // Update only access token (no new refresh token returned)
        await apiClient.setAuthTokens(newAccessToken);

        // Verify the token was actually updated
        const verifyToken = await apiClient.getAuthToken();
        console.log('✅ Token verification after update:', {
          updated: verifyToken?.substring(0, 20) + '...',
          matches: verifyToken === newAccessToken
        });
      } else {
        console.error('❌ No access token found in refresh response');
      }

      return {
        success: response.success,
        message: response.message,
        data: newAccessToken ? { access_token: newAccessToken } : undefined
      };
    } catch (error: any) {
      console.error('❌ Refresh token error details:', error);
      // Preserve all error information for proper classification in AuthGuard
      throw {
        success: false,
        message: error.message || 'Token refresh failed',
        status: error.status,
        errors: error.errors,
        originalError: error, // Preserve original error object
      };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<AuthApiResponse<User>> {
    try {
      const response = await apiClient.get<CurrentUserResponse>(
        AUTH_ENDPOINTS.ME
      );

      // Extract user data from the response
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data, // The user data is nested in response.data.data
          message: response.data.message,
        };
      }

      throw new Error('Invalid response format');
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Failed to get user profile',
        errors: error.errors,
      };
    }
  }

  /**
   * Verify OTP for register
   */
  async verifyOTPRegister(request: RegisterOTPVerificationRequest): Promise<AuthApiResponse<RegisterOTPVerificationResponse>> {
    try {
      const response = await apiClient.post<RegisterOTPVerificationResponse>(
        AUTH_ENDPOINTS.VERIFY_OTP_REGISTER,
        request
      );

      // Note: Register OTP verification does not return tokens
      // User needs to login again to get authentication tokens

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Register OTP verification failed',
        errors: error.errors,
      };
    }
  }

  /**
   * Resend OTP for register
   */
  async resendOTPRegister(request: ResendOTPRequest): Promise<AuthApiResponse<ResendOTPResponse>> {
    try {
      const response = await apiClient.post<ResendOTPResponse>(
        AUTH_ENDPOINTS.RESEND_OTP_REGISTER,
        request
      );

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Failed to resend register OTP',
        errors: error.errors,
      };
    }
  }

  /**
   * Verify OTP for login new device
   */
  async verifyLoginNewDevice(request: LoginNewDeviceOTPVerificationRequest): Promise<AuthApiResponse<LoginNewDeviceOTPVerificationResponse>> {
    try {
      const response = await apiClient.post<LoginNewDeviceOTPVerificationResponse>(
        AUTH_ENDPOINTS.VERIFY_LOGIN_NEW_DEVICE,
        request
      );

      // Store tokens after successful OTP verification
      // The response.data contains the server response which has the tokens
      const apiResponse = response.data as any;
      if (response.success && apiResponse && apiResponse.data) {
        const { access_token, refresh_token } = apiResponse.data;
        if (access_token && refresh_token) {
          await apiClient.setAuthTokens(access_token, refresh_token);
          
          // Trigger auth state update to notify UI
          const { authGuard } = await import('@/shared/services/authGuard');
          authGuard.triggerAuthUpdate();
        }
      }

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Login new device OTP verification failed',
        errors: error.errors,
      };
    }
  }

  /**
   * Resend OTP for login new device
   */
  async resendOTPLoginNewDevice(request: ResendOTPRequest): Promise<AuthApiResponse<ResendOTPResponse>> {
    try {
      const response = await apiClient.post<ResendOTPResponse>(
        AUTH_ENDPOINTS.RESEND_OTP_LOGIN_NEW_DEVICE,
        request
      );

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Failed to resend login new device OTP',
        errors: error.errors,
      };
    }
  }

  /**
   * Forgot password - send OTP
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<AuthApiResponse<ForgotPasswordResponse>> {
    try {
      const response = await apiClient.post<ForgotPasswordResponse>(
        AUTH_ENDPOINTS.FORGOT_PASSWORD,
        request
      );

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Failed to send forgot password OTP',
        errors: error.errors,
      };
    }
  }

  /**
   * Verify OTP for forgot password
   */
  async verifyOTPForgotPassword(request: ForgotPasswordOTPVerificationRequest): Promise<AuthApiResponse<ForgotPasswordOTPVerificationResponse>> {
    try {
      const response = await apiClient.post<ForgotPasswordOTPVerificationResponse>(
        AUTH_ENDPOINTS.VERIFY_OTP_FORGOT_PASSWORD,
        request
      );

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Forgot password OTP verification failed',
        errors: error.errors,
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(request: ResetPasswordRequest): Promise<AuthApiResponse<ResetPasswordResponse>> {
    try {
      // API requires reset_token as query param, password fields in body
      const { reset_token, new_password, confirm_password } = request;
      const url = `${AUTH_ENDPOINTS.RESET_PASSWORD}?token=${encodeURIComponent(reset_token)}`;
      const response = await apiClient.post<ResetPasswordResponse>(
        url,
        { new_password, confirm_password }
      );
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Password reset failed',
        errors: error.errors,
      };
    }
  }

  /**
   * Resend OTP for forgot password
   */
  async resendOTPForgotPassword(request: ResendOTPRequest): Promise<AuthApiResponse<ResendOTPResponse>> {
    try {
      const response = await apiClient.post<ResendOTPResponse>(
        AUTH_ENDPOINTS.RESEND_OTP_FORGOT_PASSWORD,
        request
      );

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Failed to resend forgot password OTP',
        errors: error.errors,
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.hasAuthToken();
  }

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    return apiClient.getAuthToken();
  }

  /**
   * Generate upload URL for file upload
   */
  async generateUploadUrl(request: { file_name: string; file_type: string; file_size: number }): Promise<any> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.FILES.GENERATE_UPLOAD_URL, request);

      if (response.success && response.data) {
        // response.data is already the API response with {success, message, data, code}
        // response.data.data contains {upload_url, file_id, etc.}
        return response.data;
      }

      return {
        success: false,
        message: response.message || 'Failed to generate upload URL',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to generate upload URL',
      };
    }
  }

  /**
   * Upload file to S3 using the generated upload URL
   */
  async uploadFile(uploadUrl: string, file: { uri: string; type: string; name: string }): Promise<boolean> {
    try {
      // Fetch the file and get it as a blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': file.type,
        },
      });

      return uploadResponse.ok;
    } catch (error) {
      console.error('File upload error:', error);
      return false;
    }
  }

  /**
   * Update user avatar
   */
  async updateAvatar(request: { avatar_id: string }): Promise<any> {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.USER.UPDATE_AVATAR, request);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to update avatar',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update avatar',
      };
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
