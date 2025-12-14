import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../shared/types/store';
import type { EkycState } from '../types/ekyc';
import { EkycStep } from '../types/ekyc';
import { EKYC_CONSTANTS } from '../utils/constants';

// Base selector
const selectEkycState = (state: RootState): EkycState => state.ekyc;

// Basic selectors
export const selectCurrentStep = createSelector(
  [selectEkycState],
  (ekyc) => ekyc.currentStep
);

export const selectIsProcessing = createSelector(
  [selectEkycState],
  (ekyc) => ekyc.isProcessing
);

export const selectIsInitialized = createSelector(
  [selectEkycState],
  (ekyc) => ekyc.isInitialized
);

export const selectEkycResults = createSelector(
  [selectEkycState],
  (ekyc) => ekyc.results
);

export const selectEkycError = createSelector(
  [selectEkycState],
  (ekyc) => ekyc.error
);

export const selectRetryCount = createSelector(
  [selectEkycState],
  (ekyc) => ekyc.retryCount
);

export const selectSessionId = createSelector(
  [selectEkycState],
  (ekyc) => ekyc.sessionId
);

export const selectStartTime = createSelector(
  [selectEkycState],
  (ekyc) => ekyc.startTime
);

export const selectEndTime = createSelector(
  [selectEkycState],
  (ekyc) => ekyc.endTime
);

// Computed selectors
export const selectHasError = createSelector(
  [selectEkycError],
  (error) => !!error
);

export const selectCanRetry = createSelector(
  [selectRetryCount, selectHasError],
  (retryCount, hasError) => hasError && retryCount < EKYC_CONSTANTS.MAX_RETRY_COUNT
);

export const selectIsSuccess = createSelector(
  [selectCurrentStep, selectEkycResults],
  (currentStep, results) => currentStep === EkycStep.COMPLETED && !!results
);

export const selectIsError = createSelector(
  [selectCurrentStep],
  (currentStep) => currentStep === EkycStep.ERROR
);

export const selectIsIdle = createSelector(
  [selectCurrentStep],
  (currentStep) => currentStep === EkycStep.IDLE
);

export const selectIsCapturing = createSelector(
  [selectCurrentStep],
  (currentStep) => currentStep === EkycStep.CAPTURING
);

export const selectIsCompleted = createSelector(
  [selectCurrentStep],
  (currentStep) => currentStep === EkycStep.COMPLETED
);

// Duration selectors
export const selectProcessingDuration = createSelector(
  [selectStartTime, selectEndTime],
  (startTime, endTime) => {
    if (!startTime) return null;
    const end = endTime || Date.now();
    return Math.round((end - startTime) / 1000); // in seconds
  }
);

// OCR data selectors
export const selectOcrData = createSelector(
  [selectEkycResults],
  (results) => results?.ocrData || null
);

export const selectOcrErrors = createSelector(
  [selectEkycResults],
  (results) => results?.ocrErrors || []
);

export const selectHasOcrData = createSelector(
  [selectOcrData],
  (ocrData) => !!(ocrData && (ocrData.id || ocrData.name || ocrData.dob))
);

export const selectHasOcrErrors = createSelector(
  [selectOcrErrors],
  (ocrErrors) => ocrErrors.length > 0
);

// Document data selectors
export const selectDocumentData = createSelector(
  [selectOcrData],
  (ocrData) => {
    if (!ocrData) return null;
    
    return {
      idNumber: ocrData.id,
      fullName: ocrData.name,
      dateOfBirth: ocrData.dob,
      gender: ocrData.sex,
      nationality: ocrData.nationality,
      address: ocrData.address || ocrData.home,
      placeOfOrigin: ocrData.home,
      dateOfExpiry: ocrData.doe,
    };
  }
);

// Face data selectors
export const selectFaceLiveness = createSelector(
  [selectEkycResults],
  (results) => results?.faceLiveness || null
);

export const selectCompareResult = createSelector(
  [selectEkycResults],
  (results) => results?.compareResult || null
);

export const selectVerifyResult = createSelector(
  [selectEkycResults],
  (results) => results?.verifyResult || null
);

export const selectFaceMatchScore = createSelector(
  [selectCompareResult],
  (compareResult) => compareResult?.object?.similarity || null
);

export const selectIsFaceMatched = createSelector(
  [selectFaceMatchScore],
  (matchScore) => {
    if (typeof matchScore !== 'number') return null;
    return matchScore >= EKYC_CONSTANTS.FACE_MATCH_THRESHOLD;
  }
);

// Image path selectors
export const selectImagePaths = createSelector(
  [selectEkycResults],
  (results) => results?.imagePaths || null
);

export const selectFrontImagePath = createSelector(
  [selectImagePaths],
  (imagePaths) => imagePaths?.frontPath || null
);

export const selectBackImagePath = createSelector(
  [selectImagePaths],
  (imagePaths) => imagePaths?.backPath || null
);

export const selectFaceImagePath = createSelector(
  [selectImagePaths],
  (imagePaths) => imagePaths?.facePath || null
);

// Status selectors
export const selectEkycStatus = createSelector(
  [selectCurrentStep, selectIsProcessing, selectHasError, selectIsSuccess],
  (currentStep, isProcessing, hasError, isSuccess) => ({
    currentStep,
    isProcessing,
    hasError,
    isSuccess,
    isIdle: currentStep === EkycStep.IDLE,
    isCapturing: currentStep === EkycStep.CAPTURING,
    isCompleted: currentStep === EkycStep.COMPLETED,
    isError: currentStep === EkycStep.ERROR,
  })
);

// Validation selectors
export const selectValidationStatus = createSelector(
  [selectEkycResults, selectOcrErrors, selectIsFaceMatched],
  (results, ocrErrors, isFaceMatched) => {
    if (!results) {
      return {
        isValid: false,
        hasOcrData: false,
        hasOcrErrors: false,
        hasFaceData: false,
        isFaceMatched: null,
        errors: ['Không có dữ liệu eKYC'],
      };
    }

    const hasOcrData = !!(results.ocrData && (
      results.ocrData.id || 
      results.ocrData.name || 
      results.ocrData.dob
    ));
    
    const hasOcrErrors = ocrErrors.length > 0;
    const hasFaceData = !!(results.faceLiveness || results.compareResult);
    
    const errors: string[] = [];
    
    if (!hasOcrData && !hasOcrErrors) {
      errors.push('Không có dữ liệu OCR');
    }
    
    if (!hasFaceData) {
      errors.push('Không có dữ liệu khuôn mặt');
    }
    
    if (isFaceMatched === false) {
      errors.push('Khuôn mặt không khớp');
    }

    return {
      isValid: hasOcrData && hasFaceData && isFaceMatched !== false,
      hasOcrData,
      hasOcrErrors,
      hasFaceData,
      isFaceMatched,
      errors,
    };
  }
);

// Combined selectors
export const selectEkycSummary = createSelector(
  [
    selectEkycState,
    selectDocumentData,
    selectValidationStatus,
    selectProcessingDuration,
    selectFaceMatchScore,
  ],
  (state, documentData, validationStatus, duration, faceMatchScore) => ({
    // State info
    currentStep: state.currentStep,
    isProcessing: state.isProcessing,
    isInitialized: state.isInitialized,
    sessionId: state.sessionId,
    
    // Results
    documentData,
    validationStatus,
    
    // Metrics
    processingDuration: duration,
    faceMatchScore,
    retryCount: state.retryCount,
    
    // Status flags
    canRetry: state.retryCount < EKYC_CONSTANTS.MAX_RETRY_COUNT && !!state.error,
    isSuccess: state.currentStep === EkycStep.COMPLETED && validationStatus.isValid,
    hasError: !!state.error,
    error: state.error,
  })
);

// Navigation selectors
export const selectNavigationData = createSelector(
  [selectDocumentData, selectEkycResults],
  (documentData, results) => {
    if (!documentData || !results) return null;
    
    return {
      idNumber: documentData.idNumber,
      fullName: documentData.fullName,
      gender: documentData.gender,
      dateOfBirth: documentData.dateOfBirth,
      nationality: documentData.nationality,
      address: documentData.address,
      ekycResult: results,
    };
  }
);
