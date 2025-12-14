// Export all OTP functionality
export * from './types';
export * from './utils';
export * from './services';
export * from './hooks';
export * from './screens';

// Export locales
export { otpLocales } from './locales';

// Re-export main components for convenience
export { useOTP } from './hooks';
export { OTPVerificationScreen } from './screens';
export { otpServiceRegistry } from './services';
export type { OTPType, OTPSessionConfig, OTPContextData } from './types';

// Export setup functions
export { initializeOTPServices, useInitializeAuthOTPServices } from './setup';
