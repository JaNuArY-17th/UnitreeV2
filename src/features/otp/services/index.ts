export * from './otpService';
export * from './authOTPService';

// Re-export base types from ../types for convenience
export type {
  BaseOTPVerificationRequest,
  BaseOTPVerificationResponse, 
  BaseOTPResendRequest,
  BaseOTPResendResponse
} from '../types';
