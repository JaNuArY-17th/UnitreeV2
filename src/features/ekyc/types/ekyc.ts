/**
 * eKYC Types
 * TypeScript definitions for eKYC feature
 */

// Enums
export enum EkycStep {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  CAPTURING = 'capturing',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum EkycType {
  OCR = 'ocr',
  FACE = 'face',
  FULL = 'full',
}

export enum EkycStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

// Core eKYC Data Types
export interface EkycOcrData {
  id?: string;
  name?: string;
  dob?: string;
  doi?: string; // date of issue
  sex?: string;
  nationality?: string;
  home?: string;
  address?: string;
  doe?: string;
  type_new?: string;
  type?: string;
  address_entities?: {
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
  };
  home_entities?: any; // Additional home entities
  mrz_verified?: boolean;
  id_verified?: boolean;
  name_verified?: boolean;
  dob_verified?: boolean;
  sex_verified?: boolean;
  // Probability scores
  id_prob?: any;
  name_prob?: any;
  dob_prob?: any;
  sex_prob?: string;
  nationality_prob?: any;
  home_prob?: any;
  address_prob?: any;
  doe_prob?: any;
  type_new_prob?: string;
  nationality_verified?: boolean;
  doe_verified?: boolean;
  address_verified?: boolean;
  home_verified?: boolean;
  type_verified?: boolean;
}

export interface EkycLivenessData {
  imgs?: {
    img?: string;
    near_img?: string;
    far_img?: string;
  };
  object?: {
    liveness?: string;
    fake_liveness_prob?: number;
    face_swapping_prob?: number;
    liveness_prob?: number;
    liveness_msg?: string;
    age?: number;
    gender?: string;
    blur_face_score?: number;
    is_eye_open?: string;
    masked?: string;
  };
  challengeCode?: string;
  server_version?: string;
}

export interface EkycCompareData {
  object?: {
    matching?: string;
    similarity?: number;
    face1_quality?: number;
    face2_quality?: number;
    face1_liveness?: number;
    face2_liveness?: number;
    prob?: number; // probability score
    result?: string; // match result
    msg?: string; // message
  };
}

export interface EkycVerifyData {
  object?: {
    verified?: string;
    similarity?: number;
    face_quality?: number;
    liveness_score?: number;
  };
}

// Parsed eKYC Result
export interface ParsedEkycResult {
  ocrData?: EkycOcrData;
  ocrErrors?: string[];
  frontCardLiveness?: EkycLivenessData;
  backCardLiveness?: EkycLivenessData;
  faceLiveness?: EkycLivenessData;
  maskCheck?: {
    object?: {
      masked?: string;
    };
  };
  compareResult?: EkycCompareData;
  verifyResult?: EkycVerifyData;
  verifyFaceResult?: any; // Additional face verification result
  imagePaths?: {
    frontPath?: string;
    backPath?: string;
    facePath?: string;
    faceNearPath?: string;
    faceFarPath?: string;
  };
  status?: EkycStatus;
  message?: string;
  timestamp?: string;
  // Attached comprehensive validation result when available
  validationResult?: import('../services/types').ValidationResult;
}

// API Request/Response Types
export interface EkycRequest {
  token: string;
  type: EkycType;
  timeout?: number;
}

export interface EkycApiResponse<T = ParsedEkycResult> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  code?: string;
}

// State Management Types
export interface EkycState {
  currentStep: EkycStep;
  isProcessing: boolean;
  isInitialized: boolean;
  results: ParsedEkycResult | null;
  error: string | null;
  retryCount: number;
  sessionId: string | null;
  startTime: number | null;
  endTime: number | null;
}

// Form Types
export interface EkycFormData {
  type: EkycType;
  isRetake?: boolean;
  previousResults?: ParsedEkycResult;
}

export interface EkycFormErrors {
  type?: string;
  general?: string;
}

// Error Types
export interface EkycError {
  message: string;
  code?: string;
  type?: 'NETWORK' | 'SDK' | 'VALIDATION' | 'TIMEOUT' | 'UNKNOWN';
  details?: any;
  timestamp?: string;
}

// Validation Status Type
export interface EkycValidationStatus {
  isValid: boolean;
  hasOcrData: boolean;
  hasOcrErrors: boolean;
  hasFaceData: boolean;
  isFaceMatched: boolean | null;
  errors: string[];
}

// Document Data Type
export interface EkycDocumentData {
  idNumber: string | undefined;
  fullName: string | undefined;
  gender: string | undefined;
  dateOfBirth: string | undefined;
  nationality: string | undefined;
  address: string | undefined;
  placeOfOrigin: string | undefined;
  dateOfExpiry: string | undefined;
}

// Summary Type
export interface EkycSummary {
  currentStep: EkycStep;
  isProcessing: boolean;
  isInitialized: boolean;
  sessionId: string | null;
  documentData: EkycDocumentData | null;
  validationStatus: EkycValidationStatus;
  processingDuration: number | null;
  faceMatchScore: number | null;
  retryCount: number;
  canRetry: boolean;
  isSuccess: boolean;
  hasError: boolean;
  error: string | null;
}

// Navigation Data Type
export type EkycNavigationData = {
  idNumber: string | undefined;
  fullName: string | undefined;
  gender: string | undefined;
  dateOfBirth: string | undefined;
  nationality: string | undefined;
  address: string | undefined;
  ekycResult: ParsedEkycResult;
} | null;

// Hook Return Types
export interface UseEkycReturn {
  // State
  currentStep: EkycStep;
  isProcessing: boolean;
  isInitialized: boolean;
  results: ParsedEkycResult | null;
  error: string | null;
  retryCount: number;
  sessionId: string | null;

  // Computed state
  canRetry: boolean;
  isSuccess: boolean;
  isError: boolean;

  // Actions
  initializeEkyc: () => Promise<{ sessionId: string; timestamp: number }>;
  startCapture: (type: EkycType) => Promise<ParsedEkycResult>;
  retryCapture: () => Promise<ParsedEkycResult>;
  resetEkyc: () => void;
  clearError: () => void;
  setStep: (step: EkycStep) => void;

  // Utils
  checkAvailability: () => boolean;
  summary: EkycSummary;
  navigationData: EkycNavigationData;
}

export interface UseEkycCaptureReturn {
  // Form state
  formData: EkycFormData;
  errors: EkycFormErrors;
  touched: Record<keyof EkycFormData, boolean>;

  // Actions
  handleCapture: (type: EkycType) => Promise<void>;
  handleRetry: () => Promise<void>;
  updateFormData: (data: Partial<EkycFormData>) => void;
  clearErrors: () => void;
  markFieldTouched: (field: keyof EkycFormData) => void;

  // Status
  isProcessing: boolean;
  canSubmit: boolean;
  canRetry: boolean;
  captureAttempts: number;

  // Results
  lastResult: ParsedEkycResult | null;

  // Utils
  getFieldError: (field: keyof EkycFormData) => string | undefined;

  // Combined error state
  error: string | undefined;
}

export interface UseEkycValidationReturn {
  validateOcrData: (data: EkycOcrData) => string[];
  validateLivenessData: (data: EkycLivenessData) => string[];
  validateCompareResult: (data: EkycCompareData) => string[];
  isValidResult: (result: ParsedEkycResult) => boolean;
  getValidationErrors: (result: ParsedEkycResult) => string[];
}

// Navigation Types
export interface EkycNavigationParams {
  EkycCapture: {
    isRetake?: boolean;
    previousResults?: ParsedEkycResult;
  };
  UserInfo: {
    idNumber?: string;
    fullName?: string;
    gender?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    ekycResult?: ParsedEkycResult;
  };
}

// Component Props Types
export interface EkycCaptureProps {
  onCapture: (type: EkycType) => Promise<void>;
  isProcessing: boolean;
  error?: string;
  canRetry?: boolean;
  onRetry?: () => void;
}

export interface VerificationStepProps {
  step: EkycStep;
  isActive: boolean;
  isCompleted: boolean;
  hasError: boolean;
  title: string;
  description?: string;
}

export interface ResultDisplayProps {
  results: ParsedEkycResult;
  onConfirm: () => void;
  onRetake: () => void;
  isLoading?: boolean;
}
