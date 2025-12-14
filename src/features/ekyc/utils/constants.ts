/**
 * eKYC Constants
 * Centralized constants for eKYC feature
 */

// Thresholds and Limits
export const EKYC_CONSTANTS = {
  // Face matching threshold (90%)
  FACE_MATCH_THRESHOLD: 90.0,

  // Timeout settings
  EKYC_TIMEOUT: 300000, // 2 minutes timeout

  // Retry settings
  MAX_RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 second

  // Image quality thresholds
  MIN_IMAGE_QUALITY: 70,
  MIN_FACE_QUALITY: 60,
  MIN_LIVENESS_SCORE: 80,

  // File size limits
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_BASE64_LENGTH: 500, // For logging purposes

  // Date validation
  MIN_AGE: 16,
  MAX_AGE: 150,

  // OCR confidence thresholds
  MIN_OCR_CONFIDENCE: 50,
  HIGH_OCR_CONFIDENCE: 80,
} as const;

// Error Codes
export const EKYC_ERROR_CODES = {
  // SDK Errors
  SDK_NOT_AVAILABLE: 'SDK_NOT_AVAILABLE',
  SDK_INITIALIZATION_FAILED: 'SDK_INITIALIZATION_FAILED',

  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TOKEN_ERROR: 'TOKEN_ERROR',
  API_ERROR: 'API_ERROR',

  // Timeout Errors
  EKYC_TIMEOUT: 'EKYC_TIMEOUT',
  CAPTURE_TIMEOUT: 'CAPTURE_TIMEOUT',

  // Validation Errors
  INVALID_DOCUMENT: 'INVALID_DOCUMENT',
  FACE_MATCH_FAILED: 'FACE_MATCH_FAILED',
  LIVENESS_FAILED: 'LIVENESS_FAILED',
  OCR_FAILED: 'OCR_FAILED',

  // Image Errors
  IMAGE_TOO_LARGE: 'IMAGE_TOO_LARGE',
  IMAGE_QUALITY_LOW: 'IMAGE_QUALITY_LOW',
  IMAGE_NOT_FOUND: 'IMAGE_NOT_FOUND',

  // User Errors
  USER_CANCELLED: 'USER_CANCELLED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // Auth Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Server Errors
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SAVE_ERROR: 'SAVE_ERROR',
} as const;

// Messages
export const EKYC_MESSAGES = {
  // Processing messages
  INITIALIZING: 'Đang khởi tạo eKYC...',
  PROCESSING: 'Đang xử lý...',
  CAPTURING: 'Đang chụp ảnh...',
  VALIDATING: 'Đang xác thực...',

  // Success messages
  SUCCESS: 'Xác minh thành công',
  CAPTURE_SUCCESS: 'Chụp ảnh thành công',
  VALIDATION_SUCCESS: 'Xác thực thành công',

  // Error messages
  GENERAL_ERROR: 'Có lỗi xảy ra, vui lòng thử lại',
  SDK_ERROR: 'eKYC SDK không khả dụng trên thiết bị này hoặc chưa được khởi tạo đúng cách',
  NETWORK_ERROR: 'Lỗi kết nối mạng, vui lòng kiểm tra và thử lại',
  TIMEOUT_ERROR: 'Quá trình xác minh bị quá thời gian. Vui lòng kiểm tra kết nối mạng và thử lại',
  FACE_MATCH_ERROR: 'Khuôn mặt không khớp với ảnh trong giấy tờ',
  LIVENESS_ERROR: 'Không thể xác nhận tính sống của khuôn mặt',
  OCR_ERROR: 'Không thể đọc thông tin từ giấy tờ',
  IMAGE_ERROR: 'Lỗi xử lý hình ảnh',
  PERMISSION_ERROR: 'Không có quyền truy cập camera',

  // Validation messages
  INVALID_ID_NUMBER: 'Số CCCD/CMND không hợp lệ',
  INVALID_NAME: 'Họ tên không hợp lệ',
  INVALID_DATE: 'Ngày tháng không hợp lệ',
  INVALID_ADDRESS: 'Địa chỉ không hợp lệ',

  // Retry messages
  RETRY_SUGGESTION: 'Vui lòng thử lại',
  RETAKE_SUGGESTION: 'Vui lòng chụp lại',
  CHECK_LIGHTING: 'Vui lòng kiểm tra ánh sáng và chụp lại',
  CHECK_DOCUMENT: 'Vui lòng kiểm tra giấy tờ và chụp lại',
} as const;

// File Mapping for Android
export const STANDARD_FILE_MAPPING = {
  front_card: ['ImageCropedFront.png', 'ImageFront.png'],
  back_card: ['ImageCropedBack.png', 'ImageBack.png'],
  face_image: ['ImageFace.png', 'FaceImage.png'],
  face_near: ['ImageFaceNear.png', 'FaceNearImage.png'],
  face_far: ['ImageFaceFar.png', 'FaceFarImage.png'],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DD_MM_YYYY: 'DD/MM/YYYY',
  YYYY_MM_DD: 'YYYY-MM-DD',
  DD_MM_YYYY_REGEX: /^\d{2}\/\d{2}\/\d{4}$/,
  YYYY_MM_DD_REGEX: /^\d{4}-\d{2}-\d{2}$/,
  FLEXIBLE_DATE_REGEX: /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/,
} as const;

// Document Types
export const DOCUMENT_TYPES = {
  ID_CARD: 'id_card',
  PASSPORT: 'passport',
  DRIVER_LICENSE: 'driver_license',
} as const;

// Gender Mapping
export const GENDER_MAPPING = {
  M: 'Nam',
  F: 'Nữ',
  MALE: 'Nam',
  FEMALE: 'Nữ',
  '1': 'Nam',
  '0': 'Nữ',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  ID_NUMBER: {
    MIN_LENGTH: 9,
    MAX_LENGTH: 12,
    PATTERN: /^[0-9]{9,12}$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZÀ-ỹ\s]+$/,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 11,
    PATTERN: /^[0-9]{10,11}$/,
  },
  ADDRESS: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200,
  },
} as const;

// Image Quality Settings
export const IMAGE_QUALITY = {
  COMPRESSION: 0.8,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  JPEG_QUALITY: 85,
} as const;

// Debug Settings
export const DEBUG_SETTINGS = {
  ENABLE_LOGGING: __DEV__,
  LOG_LEVEL: 'info',
  MAX_LOG_LENGTH: 1000,
  ENABLE_DEVICE_INFO: __DEV__,
} as const;

// API Endpoints (relative to base URL)
export const EKYC_ENDPOINTS = {
  GET_TOKEN: '/ekyc/token',
  UPLOAD_RESULT: '/ekyc/upload',
  VERIFY_RESULT: '/ekyc/verify',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  EKYC_RESULTS: 'ekyc_results',
  EKYC_SESSION: 'ekyc_session',
  EKYC_SETTINGS: 'ekyc_settings',
} as const;

// Query Keys for React Query
export const EKYC_QUERY_KEYS = {
  all: ['ekyc'] as const,
  token: () => [...EKYC_QUERY_KEYS.all, 'token'] as const,
  results: () => [...EKYC_QUERY_KEYS.all, 'results'] as const,
  session: (sessionId: string) => [...EKYC_QUERY_KEYS.all, 'session', sessionId] as const,
} as const;

// Step Configurations
export const EKYC_STEPS = {
  IDLE: {
    title: 'Chuẩn bị',
    description: 'Chuẩn bị xác minh danh tính',
    icon: 'document-text-outline',
  },
  INITIALIZING: {
    title: 'Khởi tạo',
    description: 'Đang khởi tạo SDK eKYC',
    icon: 'settings-outline',
  },
  CAPTURING: {
    title: 'Chụp ảnh',
    description: 'Chụp ảnh giấy tờ và khuôn mặt',
    icon: 'camera-outline',
  },
  PROCESSING: {
    title: 'Xử lý',
    description: 'Đang xử lý và xác thực thông tin',
    icon: 'sync-outline',
  },
  COMPLETED: {
    title: 'Hoàn thành',
    description: 'Xác minh thành công',
    icon: 'checkmark-circle-outline',
  },
  ERROR: {
    title: 'Lỗi',
    description: 'Có lỗi xảy ra',
    icon: 'alert-circle-outline',
  },
} as const;

// Platform-specific settings
export const PLATFORM_SETTINGS = {
  IOS: {
    SUPPORTS_EKYC: true,
    DEFAULT_TIMEOUT: 120000,
  },
  ANDROID: {
    SUPPORTS_EKYC: true,
    DEFAULT_TIMEOUT: 150000,
    REQUIRES_BRIDGE: true,
  },
} as const;

// Export types for constants
export type EkycConstant = typeof EKYC_CONSTANTS;
export type EkycErrorCode = keyof typeof EKYC_ERROR_CODES;
export type EkycMessage = keyof typeof EKYC_MESSAGES;
export type DocumentType = keyof typeof DOCUMENT_TYPES;
export type GenderKey = keyof typeof GENDER_MAPPING;
