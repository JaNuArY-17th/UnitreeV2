/**
 * Environment configuration for API endpoints and app settings
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://open-api.ensogo.vn',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-app-id': 2,
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REFRESH_TOKEN: '/iam/v1/auth/refresh-token',
    LOGIN: '/iam/v1/auth/login',
    LOGIN_STORE: '/iam/v1/auth/login/store',
    LOGOUT: '/iam/v1/auth/logout',
    REGISTER: '/iam/v1/auth/register',
    REGISTER_STORE: '/iam/v1/auth/register/store',
    CURRENT_USER: '/iam/v1/users/my-data',
    VERIFY_OTP: '/iam/v1/auth/verify-otp',
    RESEND_OTP: '/iam/v1/auth/resend-otp',
    FORGOT_PASSWORD: '/iam/v1/auth/forgot-password',
    RESET_PASSWORD: '/iam/v1/auth/reset-password',
    // Register OTP endpoints
    VERIFY_OTP_REGISTER: '/iam/v1/auth/verify-otp-register',
    RESEND_OTP_REGISTER: '/iam/v1/auth/resend-otp-register',
    // Login new device OTP endpoints
    VERIFY_LOGIN_NEW_DEVICE: '/iam/v1/auth/verify-login-new-device',
    RESEND_OTP_LOGIN_NEW_DEVICE: '/iam/v1/auth/resend-otp-login-new-device',
    // Forgot password OTP endpoints
    VERIFY_OTP_FORGOT_PASSWORD: '/iam/v1/auth/verify-otp-forgot-password',
    RESEND_OTP_FORGOT_PASSWORD: '/iam/v1/auth/resend-otp-forgot-password',
  },
  USER: {
    UPDATE_AVATAR: '/iam/v1/users/update-avatar',
    DELETE_ACCOUNT: '/iam/v1/users/delete-account',
    UPDATE_PHONE_NUMBER: '/iam/v1/users/update-phone-number',
    VERIFY_UPDATE_PHONE_NUMBER: '/iam/v1/users/verify-update-phone-number',
    RESEND_UPDATE_PHONE_NUMBER: '/iam/v1/users/resend-update-phone-number',
    UPDATE_EMAIL: '/iam/v1/users/update-email',
    VERIFY_UPDATE_EMAIL: '/iam/v1/users/verify-email',
    RESEND_UPDATE_EMAIL: '/iam/v1/users/resend-verify-email'
  },
  FILES: {
    GENERATE_UPLOAD_URL: '/iam/v1/files/generate-upload-url',
    GENERATE_UPLOAD_URL_STORE: '/pay/v1/files/generate-upload-url',
    GET_STORE_FILES: '/pay/v1/files/store', // GET /:storeId
    REMOVE_STORE_FILE: '/pay/v1/files', // PUT /:fileId/remove-store
    CONFIRM_UPLOAD: '/pay/v1/files', // PUT /:fileId/confirm-upload
  },
  BANK: {
    MY_BANK: '/wallet/v1/banks/my',
    GET_QR_INFORMATION: '/wallet/v1/banks/get-qr-information',
    GENERATE_QR_TOPUP: '/wallet/v1/banks/generate-qr-topup',
    GET_LIST_BANK: '/wallet/v1/linkedbanks/get-list-bank',
    LINKED_BANKS: '/wallet/v1/linkedbanks/my',
    LINK_BANK: '/wallet/v1/linkedbanks',
    DELETE_LINKED_BANK: '/wallet/v1/linkedbanks',
    CHOOSE_NUMBER: '/wallet/v1/banks/choose-number',
    CHECK_BANK: '/wallet/v1/banks/check',
    SET_BANK_DEFAULT: '/wallet/v1/linkedbanks',
    TRANSACTIONS: '/wallet/v1/banktransactions/my',
    TRANSACTIONS_DETAIL: '/wallet/v1/banktransactions',
    WITHDRAW_INITIATE: '/wallet/v1/banktransactions/withdrawals/initiate',
    WITHDRAW_RESEND: '/wallet/v1/banktransactions/withdrawals/resend-otp',
    WITHDRAW_VERIFY: '/wallet/v1/banktransactions/withdrawals/verify',
    GENERATE_QR: '/wallet/v1/banks/generate-qr',
    TRANSFER_INITIATE: '/wallet/v1/banktransactions/transfer/initiate',
    TRANSFER_RESEND: '/wallet/v1/banktransactions/transfer/resend-otp',
    TRANSFER_VERIFY: '/wallet/v1/banktransactions/transfer/verify',
    SEARCH_ACCOUNT_BY_NUMBER: '/wallet/v1/banks/search-by-account-number',
    USER_DASHBOARD: '/pay/v1/users/dashboard',
    MY_POSTPAID: '/wallet/v1/my-postpaid',
    REQUEST_POSTPAID: '/wallet/v1/request-postpaid',
    POSTPAID_PAY_INITIATE: '/wallet/v1/postpaid/pay/initiate',
    POSTPAID_PAY_RESEND: '/wallet/v1/postpaid/pay/resend-otp',
    POSTPAID_PAY_VERIFY: '/wallet/v1/postpaid/pay/verify',
    GET_RECIPIENTS: '/wallet/v1/recent-recipients', // GET
    ADD_RECIPIENT: '/wallet/v1/recent-recipients', // POST
    DELETE_RECIPIENTS: '/wallet/v1/recent-recipients', // DELETE
  },
  NOTIFICATION: {
    NOTIFICATIONS: '/iam/v1/notifications',
    READ_NOTIFICATION: '/iam/v1/notifications/read',
    READ_ALL_NOTIFICATIONS: '/iam/v1/notifications/read-all'
  },
  BIOMETRIC: {
    CHECK: '/iam/v1/devices/biometric/status',
    ENROLL: '/iam/v1/devices/biometric/enroll',
    REMOVE: '/iam/v1/devices/biometric/remove',
    LOGIN: '/iam/v1/auth/login-biometric',
    LOGIN_STORE: '/iam/v1/auth/login-biometric/store',
  },
  STOCKS: {
    LISTED_T3: '/otc/v1/stocks/list-stock-t3', // T+3 stocks
    STOCK_DETAIL: '/otc/v1/stocks/stock-t3-detail', // Stock T3 detail
  },
  STORE: {
    MY_STORE: 'pay/v1/stores/my',
    DASHBOARD: 'pay/v1/stores/dashboard',
    CREATE: 'pay/v1/stores',
    POSTPAID_INITIATE: 'pay/v1/stores/postpaid/pay/initiate',
    POSTPAID_RESEND: 'pay/v1/stores/postpaid/pay/resend-otp',
    POSTPAID_VERIFY: 'pay/v1/stores/postpaid/pay/verify',
    INACTIVE: 'pay/v1/stores/my/inactive',
    ACTIVE: 'pay/v1/stores/my/active',
    QR_STORE: '/wallet/v1/banks/generate-qr-store',
    COMMISSIONS_PAY_INITIATE: '/pay/v1/stores/transaction-commissions/pay/initiate',
    COMMISSIONS_PAY_RESEND: '/pay/v1/stores/transaction-commissions/pay/resend-otp',
    COMMISSIONS_PAY_VERIFY: '/pay/v1/stores/transaction-commissions/pay/verify',
    GET_COMMISSION_TRANSACTIONS: '/pay/v1/stores/transaction-commissions',
    COMMISSION_PAY_PLAN: '/pay/v1/stores/transaction-commissions/payment-plan',
    GET_STORE_TYPE: 'pay/v1/vat'
  },
  INVOICE: {
    TAX_CODE: '/pay/v1/invoices/tax-code', // GET /:taxCode
    INVOICE_PDF: '/pay/v1/invoices/pdf/by-order-id', // GET /api/v1/invoices/pdf/by-order-id/{orderId}
  },
  VOUCHER: {
    LIST: '/pay/v1/stores/vouchers',
    DETAIL: '/pay/v1/stores/vouchers', // /:campaignId
    CREATE: '/pay/v1/stores/vouchers',
    UPDATE: '/pay/v1/stores/vouchers', // /:campaignId
    DELETE: '/pay/v1/stores/vouchers', // /:campaignId
    CHECK_CODE: '/pay/v1/stores/vouchers/check-code', // ?code={code}
  }
  // Add more endpoint categories as needed
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'ESPay',
  VERSION: '1.0.0',
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  REQUEST_TIMEOUT: 30000,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  LANGUAGE: 'app_language',
} as const;

// Export all configurations
export const ENV = {
  API: API_CONFIG,
  ENDPOINTS: API_ENDPOINTS,
  APP: APP_CONFIG,
  NETWORK: NETWORK_CONFIG,
  STORAGE: STORAGE_KEYS,
} as const;

// Type definitions for environment config
export type ApiConfig = typeof API_CONFIG;
export type ApiEndpoints = typeof API_ENDPOINTS;
export type AppConfig = typeof APP_CONFIG;
export type NetworkConfig = typeof NETWORK_CONFIG;
export type StorageKeys = typeof STORAGE_KEYS;
export type EnvConfig = typeof ENV;
