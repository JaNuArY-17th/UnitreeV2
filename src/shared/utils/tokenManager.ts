import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/shared/config';

// Constants
const TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;
const REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN;
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Token validation constants (following industry standards)
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const TOKEN_VALIDATION_INTERVAL = 60 * 1000; // Check every minute

// JWT payload interface
interface JWTPayload {
  exp?: number; // Expiration time (Unix timestamp)
  iat?: number; // Issued at time
  sub?: string; // Subject (user ID)
  [key: string]: any;
}

// Token validation result
interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  needsRefresh: boolean;
  expiresAt?: number;
  timeUntilExpiry?: number;
}

/**
 * JWT Utility Functions
 * Following Auth0 and Firebase patterns for client-side JWT handling
 */

/**
 * Safely decode JWT payload without verification (client-side only)
 * Used by Auth0, Firebase, and other major providers for client-side token inspection
 */
function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode base64url payload
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.warn('Failed to decode JWT payload:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * Industry standard: Check exp claim against current time
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJWTPayload(token);
  if (!payload?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp <= currentTime;
}



/**
 * Token management utility class
 * Handles storage, retrieval, and management of authentication tokens
 */
export class TokenManager {
  private static instance: TokenManager;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiryTime: number | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    // Start background token validation
    this.startTokenValidation();
  }

  /**
   * Get singleton instance of TokenManager
   */
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Get the current access token
   * @returns Promise<string | null> - The access token or null if not found
   */
  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  /**
   * Get the current refresh token
   * @returns Promise<string | null> - The refresh token or null if not found
   */
  async getRefreshToken(): Promise<string | null> {
    if (!this.refreshToken) {
      this.refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return this.refreshToken;
  }

  /**
   * Set authentication tokens
   * @param token - The access token
   * @param refreshToken - The refresh token (optional)
   */
  async setTokens(token: string, refreshToken?: string): Promise<void> {
    console.log('🔄 TokenManager: Setting new tokens...', {
      tokenStart: token.substring(0, 20) + '...',
      hasRefreshToken: !!refreshToken
    });

    this.token = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);

    // Extract and cache expiry time for efficient validation
    const payload = decodeJWTPayload(token);
    if (payload?.exp) {
      this.tokenExpiryTime = payload.exp * 1000; // Convert to milliseconds
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, this.tokenExpiryTime.toString());
      console.log('✅ TokenManager: Token expiry time updated:', new Date(this.tokenExpiryTime));
    }

    if (refreshToken) {
      this.refreshToken = refreshToken;
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    // Schedule proactive refresh
    this.scheduleTokenRefresh();
    console.log('✅ TokenManager: Tokens set successfully');
  }

  /**
   * Clear all authentication tokens
   */
  async clearTokens(): Promise<void> {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiryTime = null;

    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY]);
  }

  /**
   * Check if access token exists in memory
   * @returns boolean - True if token exists, false otherwise
   */
  hasToken(): boolean {
    return !!this.token;
  }

  /**
   * Check if tokens exist in storage
   * @returns Promise<boolean> - True if tokens exist in storage, false otherwise
   */
  async hasStoredTokens(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Get both tokens at once
   * @returns Promise<{token: string | null, refreshToken: string | null}>
   */
  async getTokens(): Promise<{ token: string | null; refreshToken: string | null }> {
    const [token, refreshToken] = await Promise.all([
      this.getToken(),
      this.getRefreshToken(),
    ]);
    return { token, refreshToken };
  }

  /**
   * Update only the access token (keep existing refresh token)
   * @param token - The new access token
   */
  async updateAccessToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Update only the refresh token (keep existing access token)
   * @param refreshToken - The new refresh token
   */
  async updateRefreshToken(refreshToken: string): Promise<void> {
    this.refreshToken = refreshToken;
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Validate current token (comprehensive check)
   * Following industry best practices from Auth0, Firebase, AWS Cognito
   */
  async validateToken(): Promise<TokenValidationResult> {
    const token = await this.getToken();

    if (!token) {
      return {
        isValid: false,
        isExpired: true,
        needsRefresh: true,
      };
    }

    const payload = decodeJWTPayload(token);
    if (!payload?.exp) {
      return {
        isValid: false,
        isExpired: true,
        needsRefresh: true,
      };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp <= currentTime;
    const timeUntilExpiry = (payload.exp - currentTime) * 1000;
    const needsRefresh = timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD;

    return {
      isValid: !isExpired,
      isExpired,
      needsRefresh,
      expiresAt: payload.exp * 1000,
      timeUntilExpiry: Math.max(0, timeUntilExpiry),
    };
  }

  /**
   * Check if token is valid and not expired
   * Simple method for quick authentication checks
   */
  async isTokenValid(): Promise<boolean> {
    const validation = await this.validateToken();
    return validation.isValid;
  }

  /**
   * Check if token needs refresh
   * Used by axios interceptors for proactive refresh
   */
  async needsRefresh(): Promise<boolean> {
    const validation = await this.validateToken();
    return validation.needsRefresh;
  }

  /**
   * Get token expiry information
   * Useful for UI components to show expiry warnings
   */
  async getTokenExpiry(): Promise<{ expiresAt: number | null; timeUntilExpiry: number | null }> {
    const validation = await this.validateToken();
    return {
      expiresAt: validation.expiresAt || null,
      timeUntilExpiry: validation.timeUntilExpiry || null,
    };
  }

  /**
   * Schedule proactive token refresh
   * Following AWS Cognito pattern: refresh 5 minutes before expiry
   */
  private scheduleTokenRefresh(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.tokenExpiryTime) return;

    const currentTime = Date.now();
    const timeUntilRefresh = this.tokenExpiryTime - currentTime - TOKEN_REFRESH_THRESHOLD;

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.onTokenNeedsRefresh();
      }, timeUntilRefresh);
    }
  }

  /**
   * Background token validation
   * Periodically check token status (similar to Firebase approach)
   */
  private startTokenValidation(): void {
    // Check token validity every minute
    setInterval(async () => {
      const token = await this.getToken();
      if (token && isTokenExpired(token)) {
        this.onTokenExpired();
      }
    }, TOKEN_VALIDATION_INTERVAL);
  }

  /**
   * Handle token refresh needed event
   * Override this method to implement custom refresh logic
   */
  protected onTokenNeedsRefresh(): void {
    // Emit event or call refresh service
    if (__DEV__) {
      console.log('Token needs refresh - implement refresh logic');
    }
  }

  /**
   * Handle token expired event
   * Override this method to implement custom expiry handling
   */
  protected onTokenExpired(): void {
    // Clear tokens and redirect to login
    if (__DEV__) {
      console.log('Token expired - clearing tokens');
    }
    this.clearTokens();
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();

// Export constants for external use if needed
export { TOKEN_KEY, REFRESH_TOKEN_KEY };
