// Authentication related types
import type { User } from './user';

// Re-export User for convenience
export type { User };

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface RegisterRequest {
  phone_number: string;
  password: string;
  confirm_password: string;
  referral_code?: string;
}

export interface LoginResponse {
  user?: User;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  // OTP verification fields
  is_new_device?: boolean;
  is_verified?: boolean;
  message?: string;
  code?: number;
}

export interface RegisterResponse {
  user?: User;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  // OTP verification fields - registration typically requires OTP
  is_new_device?: boolean;
  is_verified?: boolean;
  message?: string;
  code?: number;
  // Registration specific fields
  otp_sent?: boolean;
  phone_number?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string; // server expects snake_case
}

// Refresh token API returns wrapper { success,message,data:{access_token},code }
// We model the inner data as RefreshTokenResponse for AuthApiResponse<RefreshTokenResponse>
export interface RefreshTokenResponse {
  access_token: string;
}

export interface LogoutRequest {
  refresh_token?: string;
  logout_all?: boolean;
}

export interface OTPVerificationRequest {
  phone_number: string;
  otp_code: string;
}

export interface OTPVerificationResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

// Register OTP verification
export interface RegisterOTPVerificationRequest {
  phone_number: string;
  otp: string;
}

export interface RegisterOTPVerificationResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  message?: string;
}

// Resend OTP requests (same format for all resend APIs)
export interface ResendOTPRequest {
  phone_number: string;
}

export interface ResendOTPResponse {
  message: string;
  otp_sent: boolean;
  phone_number: string;
}

// Login new device OTP verification
export interface LoginNewDeviceOTPVerificationRequest {
  phone_number: string;
  otp: string;
}

export interface LoginNewDeviceOTPVerificationResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  message?: string;
}

// Forgot password
export interface ForgotPasswordRequest {
  phone_number: string;
}

export interface ForgotPasswordResponse {
  message: string;
  otp_sent: boolean;
  phone_number: string;
}

// Forgot password OTP verification
export interface ForgotPasswordOTPVerificationRequest {
  phone_number: string;
  otp: string;
}

export interface ForgotPasswordOTPVerificationResponse {
  message: string;
  reset_token: string;
  phone_number: string;
}

// Reset password
export interface ResetPasswordRequest {
  // phone_number: string;
  reset_token: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  message: string;
  user: User;
}

// Auth state types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

// Form validation types
export interface LoginFormData {
  phone: string;
  password: string;
}

export interface LoginFormErrors {
  phone?: string;
  password?: string;
  general?: string;
}

export interface RegisterFormData {
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
}

export interface RegisterFormErrors {
  phone?: string;
  password?: string;
  confirmPassword?: string;
  referralCode?: string;
  general?: string;
}

// API response wrapper
export interface AuthApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
  errors?: Record<string, string[]>;
}