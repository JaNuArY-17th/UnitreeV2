/**
 * Document Types
 * TypeScript definitions for document-related functionality in eKYC
 */

// Document Types
export enum DocumentType {
  ID_CARD = 'id_card',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
  UNKNOWN = 'unknown',
}

export enum DocumentSide {
  FRONT = 'front',
  BACK = 'back',
}

export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  BASE64 = 'base64',
}

// Document Data Interfaces
export interface DocumentData {
  // Basic Information
  idNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  
  // Additional Information
  placeOfOrigin?: string;
  dateOfExpiry?: string;
  issueDate?: string;
  issuingAuthority?: string;
  
  // Document Metadata
  documentType?: DocumentType;
  isVerified?: boolean;
  confidence?: number;
  
  // Address Components
  addressComponents?: {
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
    houseNumber?: string;
  };
  
  // Verification Status
  verificationStatus?: {
    idVerified?: boolean;
    nameVerified?: boolean;
    dobVerified?: boolean;
    genderVerified?: boolean;
    nationalityVerified?: boolean;
    addressVerified?: boolean;
    expiryVerified?: boolean;
    mrzVerified?: boolean;
  };
}

// Image Data Interfaces
export interface DocumentImage {
  uri: string;
  type: ImageFormat;
  name: string;
  size?: number;
  width?: number;
  height?: number;
  quality?: number;
}

export interface DocumentImages {
  frontImage?: DocumentImage;
  backImage?: DocumentImage;
  faceImage?: DocumentImage;
  faceNearImage?: DocumentImage;
  faceFarImage?: DocumentImage;
  
  // Raw paths from SDK
  frontPath?: string;
  backPath?: string;
  facePath?: string;
  faceNearPath?: string;
  faceFarPath?: string;
}

// Face Recognition Types
export interface FaceData {
  // Face Detection
  faceDetected?: boolean;
  faceQuality?: number;
  faceBlurScore?: number;
  eyesOpen?: boolean;
  
  // Liveness Detection
  isLive?: boolean;
  livenessScore?: number;
  livenessMessage?: string;
  
  // Face Analysis
  age?: number;
  gender?: string;
  emotion?: string;
  
  // Mask Detection
  hasMask?: boolean;
  maskConfidence?: number;
  
  // Face Comparison
  similarity?: number;
  matchThreshold?: number;
  isMatch?: boolean;
}

// Validation Types
export interface DocumentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number;
  
  // Field-specific validation
  fieldValidation: {
    [key: string]: {
      isValid: boolean;
      confidence: number;
      error?: string;
    };
  };
}

// Processing Status
export interface DocumentProcessingStatus {
  stage: 'capturing' | 'processing' | 'validating' | 'completed' | 'failed';
  progress: number; // 0-100
  message?: string;
  estimatedTimeRemaining?: number; // seconds
}

// File Upload Types
export interface DocumentUpload {
  file: DocumentImage;
  side: DocumentSide;
  documentType: DocumentType;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'failed';
  uploadError?: string;
}

// OCR Result Types
export interface OcrResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DocumentOcrResults {
  [fieldName: string]: OcrResult;
}

// Quality Assessment
export interface ImageQuality {
  overall: number; // 0-100
  sharpness: number;
  brightness: number;
  contrast: number;
  resolution: number;
  
  // Issues
  isBlurry: boolean;
  isTooDark: boolean;
  isTooLight: boolean;
  hasGlare: boolean;
  isSkewed: boolean;
  
  // Recommendations
  recommendations: string[];
}

// Document Template
export interface DocumentTemplate {
  type: DocumentType;
  country: string;
  requiredFields: string[];
  optionalFields: string[];
  validationRules: {
    [fieldName: string]: {
      required: boolean;
      pattern?: string;
      minLength?: number;
      maxLength?: number;
      format?: string;
    };
  };
}

// Export/Import Types
export interface DocumentExport {
  documentData: DocumentData;
  images: DocumentImages;
  faceData?: FaceData;
  validation: DocumentValidation;
  metadata: {
    exportDate: string;
    version: string;
    source: string;
  };
}

// Utility Types
export type DocumentField = keyof DocumentData;
export type RequiredDocumentFields = 'idNumber' | 'fullName' | 'dateOfBirth';
export type OptionalDocumentFields = Exclude<DocumentField, RequiredDocumentFields>;

// Form Types
export interface DocumentFormData {
  documentData: Partial<DocumentData>;
  images: Partial<DocumentImages>;
  isManualEntry?: boolean;
  skipValidation?: boolean;
}

export interface DocumentFormErrors {
  [key: string]: string;
}

// Hook Return Types
export interface UseDocumentReturn {
  documentData: DocumentData | null;
  images: DocumentImages | null;
  isProcessing: boolean;
  error: string | null;
  
  updateDocumentData: (data: Partial<DocumentData>) => void;
  updateImages: (images: Partial<DocumentImages>) => void;
  validateDocument: () => DocumentValidation;
  clearDocument: () => void;
  exportDocument: () => DocumentExport;
}

// Component Props
export interface DocumentDisplayProps {
  documentData: DocumentData;
  images?: DocumentImages;
  showImages?: boolean;
  editable?: boolean;
  onEdit?: (field: string, value: string) => void;
}

export interface DocumentImageViewerProps {
  images: DocumentImages;
  currentImage?: keyof DocumentImages;
  onImageChange?: (imageKey: keyof DocumentImages) => void;
  showControls?: boolean;
}

export interface DocumentValidationDisplayProps {
  validation: DocumentValidation;
  showDetails?: boolean;
  onRetry?: () => void;
}
