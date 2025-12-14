import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { applyNetworkLoggingInterceptors } from './axiosLogger';
import { tokenManager, TokenManager } from './tokenManager';
import { authGuard } from '@/shared/services/authGuard';
import { API_CONFIG } from '@/shared/config';
import type { ApiResponse, ApiError } from '@/shared/types';
import { DeviceInfoManager } from './deviceInfo';
import i18n from '../config/i18n';


// Axios instance
class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;

  private constructor() {
    this.tokenManager = tokenManager;
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
    this.setupLogging();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupLogging(): void {
    // Apply network logging interceptors
    applyNetworkLoggingInterceptors(this.axiosInstance);
  }

  private setupInterceptors(): void {
    // Request interceptor - Ensure valid token before requests
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const deviceId = await DeviceInfoManager.getDeviceId();
          config.headers['x-device-id'] = deviceId;
          config.headers['Accept-Language'] = i18n.language || 'vi';
        } catch (error) {
          console.log('Failed to add device ID', error);
        }

        // Skip token validation for auth endpoints
        const isAuthEndpoint = config.url?.includes('/auth/') ||
          config.url?.includes('/login') ||
          config.url?.includes('/register') ||
          config.url?.includes('/refresh-token');

        if (__DEV__ && config.url?.includes('refresh-token')) {
          console.log('🔄 Refresh token request detected:', {
            url: config.url,
            isAuthEndpoint,
            method: config.method
          });
        }

        if (!isAuthEndpoint) {
          // Skip token validation if this is a retry request (to prevent infinite loops)
          if (!(config as any)._isRetry) {
            // Ensure token is valid before making request
            const hasValidToken = await authGuard.ensureValidToken();
            if (!hasValidToken) {
              // Don't throw error immediately - let the response interceptor handle 401s
              // This prevents premature logout before attempting token refresh
              console.log('⚠️ No valid token available, proceeding without auth header');
            }
          }

          // Add authorization header for non-auth endpoints
          const token = await this.tokenManager.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else if (!isAuthEndpoint) {
            // If no token but not auth endpoint, this will likely result in 401
            // which will be handled by response interceptor for token refresh
            console.log('⚠️ No token available for protected endpoint, may trigger 401');
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle 401 errors with auth guard
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't retry 401 errors for refresh token endpoint to prevent infinite loops
        const isRefreshTokenRequest = originalRequest.url?.includes('/refresh-token');

        if (__DEV__ && error.response?.status === 401) {
          console.log('🔄 401 error analysis:', {
            url: originalRequest.url,
            isRefreshTokenRequest,
            hasRetryFlag: !!originalRequest._retry
          });
        }

        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshTokenRequest) {
          console.log('🔄 401 error detected, attempting token refresh...');
          originalRequest._retry = true;

          try {
            // For 401 errors, force token refresh even if token appears valid
            // This handles cases where server rejects valid tokens (e.g., user not found)
            console.log('🔄 Forcing token refresh due to 401 error...');
            const hasValidToken = await authGuard.forceTokenRefresh();

            if (hasValidToken) {
              console.log('✅ Token refresh successful, retrying original request');
              // Get the new token and retry request
              const token = await this.tokenManager.getToken();
              console.log('🔄 Token for retry:', {
                hasToken: !!token,
                tokenStart: token?.substring(0, 20) + '...',
                url: originalRequest.url
              });
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                // Mark as retry to prevent infinite loops
                (originalRequest as any)._isRetry = true;
                console.log('🔄 Retrying request with new token');
                return this.axiosInstance(originalRequest);
              }
            }

            console.log('❌ Token refresh failed - request will fail with 401');
            // Don't throw additional error here, let the original 401 response be returned
            // AuthGuard will handle login redirect if refresh token is actually expired
            return Promise.reject(error);
          } catch (refreshError) {
            console.error('❌ Token refresh error:', refreshError);
            // Return original error to maintain proper error context
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }



  // Public methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get(url, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete(url, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
      message: response.data?.message,
    };
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.',
        status: error.response.status,
        errors: error.response.data?.errors,
      };
    } else if (error.request) {
      return {
        message: 'Đã xảy ra lỗi kết nối. Vui lòng kiểm tra kết nối mạng của bạn và thử lại.',
      };
    } else {
      return {
        message: error.message || 'Đã xảy ra lỗi không mong muốn.',
      };
    }
  }

  // Token management methods
  async setAuthTokens(token: string, refreshToken?: string): Promise<void> {
    await this.tokenManager.setTokens(token, refreshToken);
  }

  async clearAuthTokens(): Promise<void> {
    await this.tokenManager.clearTokens();
  }

  async getAuthToken(): Promise<string | null> {
    return this.tokenManager.getToken();
  }

  hasAuthToken(): boolean {
    return this.tokenManager.hasToken();
  }

  // Logging control methods
  enableLogging(): void {
    // Re-apply logging interceptors if they were removed
    this.setupLogging();
  }

  disableLogging(): void {
    // Note: This doesn't remove existing interceptors, just prevents new ones
    // To fully disable, you'd need to eject and re-add non-logging interceptors
    console.log('Logging is controlled by ENABLE_NETWORK_LOGGING in axiosLogger.ts');
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Re-export tokenManager for convenience
export { tokenManager } from './tokenManager';

// Re-export types for backward compatibility
export type { ApiResponse, ApiError } from '@/shared/types';
export type { AxiosRequestConfig, AxiosResponse };
