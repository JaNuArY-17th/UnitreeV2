/**
 * Authentication Guard Service
 * Implements token validation and automatic refresh following industry best practices
 * Inspired by Auth0, Firebase, and AWS Cognito patterns
 */

import { tokenManager } from '@/shared/utils/tokenManager';
import { authService } from '@/features/authentication/services/authService';

// Auth guard events
export type AuthGuardEvent =
  | 'token-valid'
  | 'token-expired'
  | 'token-refreshed'
  | 'refresh-failed'
  | 'login-required';

// Auth guard listener
export type AuthGuardListener = (event: AuthGuardEvent, data?: any) => void;

/**
 * AuthGuard - Centralized authentication state management
 * Following patterns from major authentication providers
 */
export class AuthGuard {
  private static instance: AuthGuard;
  private listeners: AuthGuardListener[] = [];
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  // Circuit breaker to prevent infinite refresh loops
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private circuitBreakerOpen = false;
  private readonly MAX_FAILURES = 3; // Max consecutive failures before circuit opens
  private readonly CIRCUIT_RESET_TIME = 60000; // 1 minute before circuit resets
  private readonly COOLDOWN_PERIOD = 5000; // 5 seconds cooldown between refresh attempts

  private constructor() { }

  static getInstance(): AuthGuard {
    if (!AuthGuard.instance) {
      AuthGuard.instance = new AuthGuard();
    }
    return AuthGuard.instance;
  }

  /**
   * Add event listener
   */
  addListener(listener: AuthGuardListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: AuthGuardEvent, data?: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('AuthGuard listener error:', error);
      }
    });
  }

  /**
   * Trigger auth state update after login
   * Call this after successful login to update UI immediately
   */
  triggerAuthUpdate(): void {
    console.log('🔄 AuthGuard: Triggering auth state update');
    this.emit('token-valid');
  }

  /**
   * Check if user is authenticated with valid token
   * Main method used throughout the app
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const validation = await tokenManager.validateToken();

      if (validation.isValid) {
        this.emit('token-valid');
        return true;
      }

      if (validation.needsRefresh && !validation.isExpired) {
        // Token is still valid but needs refresh
        const refreshed = await this.attemptTokenRefresh();
        return refreshed;
      }

      // Token is expired
      this.emit('token-expired');
      return false;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Ensure valid token before API calls
   * Used by axios interceptors
   */
  async ensureValidToken(): Promise<boolean> {
    const validation = await tokenManager.validateToken();

    // console.log('🔄 AuthGuard: ensureValidToken validation:', {
    //   isValid: validation.isValid,
    //   isExpired: validation.isExpired,
    //   needsRefresh: validation.needsRefresh,
    //   timeUntilExpiry: validation.timeUntilExpiry
    // });

    if (validation.isValid && !validation.needsRefresh) {
      // console.log('✅ AuthGuard: Token is valid and doesn\'t need refresh');
      return true;
    }

    if (validation.needsRefresh || validation.isExpired) {
      console.log('🔄 AuthGuard: Token needs refresh or is expired, attempting refresh...');
      return await this.attemptTokenRefresh();
    }

    console.log('❌ AuthGuard: Token validation failed');
    return false;
  }

  /**
   * Force token refresh regardless of token validity
   * Used when server rejects a seemingly valid token (e.g., 401 with jwt.user.not_found)
   */
  async forceTokenRefresh(): Promise<boolean> {
    console.log('🔄 AuthGuard: Forcing token refresh...');
    return await this.attemptTokenRefresh();
  }

  /**
   * Check if circuit breaker should be opened
   */
  private shouldOpenCircuitBreaker(): boolean {
    const now = Date.now();

    // Reset circuit breaker after reset time
    if (this.circuitBreakerOpen && this.lastFailureTime) {
      if (now - this.lastFailureTime > this.CIRCUIT_RESET_TIME) {
        console.log('🔄 AuthGuard: Resetting circuit breaker after cooldown period');
        this.circuitBreakerOpen = false;
        this.failureCount = 0;
        this.lastFailureTime = null;
        return false;
      }
      return true;
    }

    // Check if we should open the circuit breaker
    if (this.failureCount >= this.MAX_FAILURES) {
      console.log('⚠️ AuthGuard: Opening circuit breaker - too many consecutive failures');
      this.circuitBreakerOpen = true;
      return true;
    }

    // Check cooldown period between refresh attempts
    if (this.lastFailureTime && now - this.lastFailureTime < this.COOLDOWN_PERIOD) {
      console.log('⏳ AuthGuard: Cooldown period active - preventing refresh attempt');
      return true;
    }

    return false;
  }

  /**
   * Record refresh success
   */
  private recordRefreshSuccess(): void {
    console.log('✅ AuthGuard: Recording refresh success - resetting failure count');
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.circuitBreakerOpen = false;
  }

  /**
   * Record refresh failure
   */
  private recordRefreshFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    console.log(`❌ AuthGuard: Recording refresh failure (${this.failureCount}/${this.MAX_FAILURES})`);
  }

  /**
   * Attempt to refresh token
   * Implements single-flight pattern to prevent multiple simultaneous refreshes
   */
  private async attemptTokenRefresh(): Promise<boolean> {
    // Check circuit breaker
    if (this.shouldOpenCircuitBreaker()) {
      console.log('🚫 AuthGuard: Circuit breaker is open - preventing refresh attempt');

      // If circuit breaker is open due to too many failures, require login
      if (this.circuitBreakerOpen) {
        console.log('🔄 AuthGuard: Too many failed refresh attempts - requiring login');
        await tokenManager.clearTokens();
        this.emit('login-required');
      }

      return false;
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      console.log('⏳ AuthGuard: Refresh already in progress - waiting for existing promise');
      return await this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh
   */
  private async performTokenRefresh(): Promise<boolean> {
    try {
      console.log('🔄 AuthGuard: Starting token refresh process...');
      const refreshToken = await tokenManager.getRefreshToken();

      if (!refreshToken) {
        console.log('❌ AuthGuard: No refresh token available - user needs to login');
        this.emit('login-required');
        return false;
      }

      console.log('🔄 AuthGuard: Calling refresh token API with refresh token:', refreshToken.substring(0, 20) + '...');
      // Call refresh token API
      const response = await authService.refreshToken({ refresh_token: refreshToken });
      console.log('🔄 AuthGuard: Refresh token API response:', {
        success: response.success,
        hasAccessToken: !!response.data?.access_token,
        message: response.message,
        fullResponse: response
      });

      if (response.success && response.data?.access_token) {
        console.log('✅ AuthGuard: Updating tokens with new access token');
        // Update tokens - only access token is returned from refresh
        await tokenManager.setTokens(response.data.access_token);

        // Verify the token was actually updated
        const newToken = await tokenManager.getToken();
        console.log('✅ AuthGuard: Token updated successfully', {
          newTokenStart: newToken?.substring(0, 20) + '...',
          tokenMatches: newToken === response.data.access_token
        });

        // Record success - reset circuit breaker
        this.recordRefreshSuccess();

        this.emit('token-refreshed', response.data);
        return true;
      }

      // If we reach here, the refresh API returned success but no valid token
      console.error('❌ AuthGuard: Refresh API succeeded but returned invalid token response');
      this.recordRefreshFailure();
      throw new Error('Refresh token response invalid - no access token provided');
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);

      // Check multiple sources for error message
      const errorMessage = (
        error.message?.toLowerCase() ||
        error.originalError?.message?.toLowerCase() ||
        ''
      );

      // For 401 status on refresh endpoint, it's ALWAYS an expired/invalid/revoked token
      // Network errors don't have status codes
      const is401Error = error.status === 401;
      const is403Error = error.status === 403;

      const hasRevokedMessage =
        errorMessage.includes('thu hồi') || // Vietnamese: revoked
        errorMessage.includes('đã bị thu hồi') || // Vietnamese: has been revoked
        errorMessage.includes('revoked');

      const hasExpiredMessage =
        errorMessage.includes('expired') ||
        errorMessage.includes('hết hạn') || // Vietnamese: expired
        errorMessage.includes('expir');

      const hasInvalidMessage =
        errorMessage.includes('invalid') ||
        errorMessage.includes('không hợp lệ') || // Vietnamese: invalid
        errorMessage.includes('token làm mới'); // Vietnamese: refresh token

      // If we got a 401/403 on refresh endpoint, the refresh token is definitely invalid
      // Network errors won't have status codes
      const isRefreshTokenExpired =
        is401Error ||
        is403Error ||
        hasRevokedMessage ||
        hasExpiredMessage ||
        hasInvalidMessage;

      console.log('🔍 AuthGuard: Error classification:', {
        errorStatus: error.status,
        errorMessage: error.message,
        originalErrorMessage: error.originalError?.message,
        is401Error,
        is403Error,
        hasRevokedMessage,
        hasExpiredMessage,
        hasInvalidMessage,
        isRefreshTokenExpired,
        errorType: isRefreshTokenExpired ? 'REFRESH_TOKEN_EXPIRED' : 'NETWORK_OR_TEMPORARY'
      });

      // Record failure for circuit breaker
      this.recordRefreshFailure();

      if (isRefreshTokenExpired) {
        console.log('🔄 AuthGuard: Refresh token expired/invalid/revoked - clearing tokens and requiring login');
        // Clear invalid tokens only when refresh token is definitely expired/invalid/revoked
        await tokenManager.clearTokens();
        console.log('📡 AuthGuard: Emitting refresh-failed event...');
        this.emit('refresh-failed', error);
        console.log('📡 AuthGuard: Emitting login-required event...');
        this.emit('login-required');
        console.log('✅ AuthGuard: Events emitted - login should be triggered');
      } else {
        console.log('🔄 AuthGuard: Refresh failed due to network/temporary error - keeping tokens');
        // For network errors, don't clear tokens immediately
        // Let the user try again or wait for network recovery
        this.emit('refresh-failed', error);
      }

      return false;
    }
  }

  /**
   * Force logout - clear all tokens and emit login required
   */
  async logout(): Promise<void> {
    try {
      // Call logout API if token is still valid
      const isValid = await tokenManager.isTokenValid();
      if (isValid) {
        await authService.logout({});
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local tokens
      await tokenManager.clearTokens();
      // Clear bankType cache (persisted)
      try {
        const { bankTypeManager } = await import('@/features/deposit/utils/bankTypeManager');
        await bankTypeManager.clearBankType();
      } catch (e) {
        // ignore if not available
      }
      this.emit('login-required');
    }
  }

  /**
   * Get token expiry information for UI
   */
  async getTokenExpiry(): Promise<{ expiresAt: number | null; timeUntilExpiry: number | null }> {
    return await tokenManager.getTokenExpiry();
  }

  /**
   * Check if token needs refresh (for UI warnings)
   */
  async needsRefresh(): Promise<boolean> {
    return await tokenManager.needsRefresh();
  }

  /**
   * Check if user has a valid token (without triggering refresh)
   * Used by AuthLoadingScreen to determine navigation
   */
  async hasValidToken(): Promise<boolean> {
    try {
      const validation = await tokenManager.validateToken();
      return validation.isValid && !validation.isExpired;
    } catch (error) {
      console.error('hasValidToken check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authGuard = AuthGuard.getInstance();
