// Shared OTP types for all OTP functionality

export type OTPType =
  | 'register'
  | 'login-new-device'
  | 'forgot-password'
  | 'general'
  | 'withdraw'
  | 'bank-withdraw'
  | 'trading'
  | 'term-deposit-purchase'
  | 'econtract-signing'
  | 'loan-application'
  | 'loan-payment'
  | 'bank-transfer';

// Base OTP form interfaces
export interface OTPFormData {
  phone: string;
  otp: string;
}

export interface OTPFormErrors {
  phone?: string;
  otp?: string;
  general?: string;
}

// OTP verification request/response interfaces
export interface BaseOTPVerificationRequest {
  phone_number?: string;
  otp: string;
}

export interface BaseOTPVerificationResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// OTP resend interfaces
export interface BaseOTPResendRequest {
  phone_number?: string;
}

export interface BaseOTPResendResponse {
  success: boolean;
  message?: string;
  otp_sent?: boolean;
  phone_number?: string;
}

// OTP configuration for different types
export interface OTPConfig {
  type: OTPType;
  codeLength?: number;
  resendDelay?: number; // seconds
  maxResendAttempts?: number;
  autoSubmit?: boolean;
  requirePhoneVerification?: boolean;
}

// Default OTP configurations
export const DEFAULT_OTP_CONFIG: Record<OTPType, OTPConfig> = {
  'register': {
    type: 'register',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: true,
  },
  'login-new-device': {
    type: 'login-new-device',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: true,
  },
  'forgot-password': {
    type: 'forgot-password',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: true,
  },
  'general': {
    type: 'general',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: true,
  },
  'withdraw': {
    type: 'withdraw',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: false,
  },
  'bank-withdraw': {
    type: 'bank-withdraw',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: false,
  },
  'trading': {
    type: 'trading',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: false,
  },
  'term-deposit-purchase': {
    type: 'term-deposit-purchase',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: false,
  },
  'econtract-signing': {
    type: 'econtract-signing',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: false,
  },
  'loan-application': {
    type: 'loan-application',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: false,
  },
  'loan-payment': {
    type: 'loan-payment',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: false,
  },
  'bank-transfer': {
    type: 'bank-transfer',
    codeLength: 6,
    resendDelay: 30,
    maxResendAttempts: 3,
    autoSubmit: true,
    requirePhoneVerification: false,
  },
};

// OTP context data for different types
export interface OTPContextData {
  // Common fields
  accountId?: string;
  amount?: number;

  // Transaction specific
  transactionData?: any;
  orderData?: {
    symbol: string;
    name: string;
    orderType: 'buy' | 'sell';
    quantity: string;
    price: string;
    orderMode?: 'limit' | 'market';
  };
  
  // Trading specific
  companyId?: string;
  sessionId?: string;
  otpResponseData?: any; // Store OTP response data

  // Bank withdrawal specific
  accountNumber?: string;
  transferContent?: string;
  availableBalance?: number;
  linkedBank?: {
    name: string;
    number: string;
    holderName: string;
    code?: string;
    shortname?: string;
  };

  // E-contract specific
  signatureBase64?: string;

  // Navigation specific
  onSuccess?: (result?: any) => void;
  onError?: (error: any) => void;
  successScreen?: string;
  successParams?: any;
}

// Complete OTP configuration including context
export interface OTPSessionConfig {
  type: OTPType;
  phone?: string;
  config?: Partial<OTPConfig>;
  context?: OTPContextData;
}
