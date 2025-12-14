/**
 * Centralized type definitions for eKYC validation
 * Re-exports all types from the validation utilities for easier imports
 */

import {
  AddressEntity,
  OcrData,
  CardLivenessObject,
  CardLiveness,
  MultipleFacesDetails,
  CompareResultObject,
  CompareResult,
  FaceLivenessObject,
  FaceLiveness,
  MaskCheckObject,
  MaskCheck,
  ImagePaths,
  ParsedResult,
  ValidationDetails,
  ValidationResult,
  ValidationCheck,
  ValidationSummary,
  validateEkycResult,
  getValidationSummary,
  VALIDATION_THRESHOLDS
} from './ekycValidationUtils';

// Re-export all types
export type {
  AddressEntity,
  OcrData,
  CardLivenessObject,
  CardLiveness,
  MultipleFacesDetails,
  CompareResultObject,
  CompareResult,
  FaceLivenessObject,
  FaceLiveness,
  MaskCheckObject,
  MaskCheck,
  ImagePaths,
  ParsedResult,
  ValidationDetails,
  ValidationResult,
  ValidationCheck,
  ValidationSummary
};

// Re-export main functions and constants
export {
  validateEkycResult,
  getValidationSummary,
  VALIDATION_THRESHOLDS
};

// Additional types for enhanced functionality
export interface ValidationReport {
  timestamp: string;
  userId: string;
  userName: string;
  validationStatus: 'PASSED' | 'FAILED';
  overallResult: {
    isValid: boolean;
    totalErrors: number;
    totalWarnings: number;
  };
  detailedChecks: Record<string, boolean>;
  issues: {
    errors: string[];
    warnings: string[];
  };
  thresholds: typeof VALIDATION_THRESHOLDS;
  recommendations: string[];
}

export interface UserEkycValidation {
  isValid: boolean;
  summary: ValidationSummary;
  fullResult: ValidationResult;
}

// Helper functions for creating validation reports
export function createValidationReport(parsedResult: ParsedResult): ValidationReport {
  const validation = validateEkycResult(parsedResult);
  const summary = getValidationSummary(validation);
  
  return {
    timestamp: new Date().toISOString(),
    userId: parsedResult.ocrData?.id || 'Unknown',
    userName: parsedResult.ocrData?.name || 'Unknown',
    validationStatus: summary.status,
    overallResult: {
      isValid: validation.isValid,
      totalErrors: summary.totalErrors,
      totalWarnings: summary.totalWarnings
    },
    detailedChecks: summary.checks,
    issues: {
      errors: summary.errors,
      warnings: summary.warnings
    },
    thresholds: VALIDATION_THRESHOLDS,
    recommendations: generateRecommendations(validation)
  };
}

// Generate recommendations based on validation results
function generateRecommendations(validationResult: ValidationResult): string[] {
  const recommendations: string[] = [];
  
  if (!validationResult.details.ocrValid) {
    recommendations.push('Retake ID card photos with better lighting and focus');
  }
  
  if (!validationResult.details.documentAuthentic) {
    recommendations.push('Ensure using original physical ID card, not photocopies');
  }
  
  if (!validationResult.details.faceMatch) {
    recommendations.push('Retake selfie ensuring clear face visibility matching ID photo');
  }
  
  if (!validationResult.details.personReal) {
    recommendations.push('Take selfie in well-lit area with natural facial expression');
  }
  
  if (!validationResult.details.noMask) {
    recommendations.push('Remove mask or face covering during verification');
  }
  
  if (!validationResult.details.dataQuality) {
    recommendations.push('Check image quality and ensure all required photos are captured');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All validations passed successfully');
  }
  
  return recommendations;
}

/**
 * Utility type for eKYC validation status
 */
export type EkycValidationStatus = 'PASSED' | 'FAILED' | 'ERROR';

/**
 * Utility type for validation error severity
 */
export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

/**
 * Enhanced validation result with additional metadata
 */
export interface EnhancedValidationResult extends ValidationResult {
  metadata: {
    processingTime: number;
    validatedAt: Date;
    version: string;
  };
}

/**
 * Validation configuration interface
 */
export interface ValidationConfig {
  thresholds: typeof VALIDATION_THRESHOLDS;
  enableDebugLogging: boolean;
  strictMode: boolean;
  customRules?: ValidationRule[];
}

/**
 * Custom validation rule interface
 */
export interface ValidationRule {
  name: string;
  description: string;
  validator: (data: ParsedResult) => boolean;
  errorMessage: string;
  severity: ValidationSeverity;
}

/**
 * Validation metrics interface for analytics
 */
export interface ValidationMetrics {
  totalValidations: number;
  successRate: number;
  commonErrors: Record<string, number>;
  averageProcessingTime: number;
  lastUpdated: Date;
}
