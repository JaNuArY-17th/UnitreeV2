import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useEkyc } from './useEkyc';
import { ekycService } from '../services/ekycService';
import type {
  EkycType,
  EkycFormData,
  EkycFormErrors,
  UseEkycCaptureReturn,
  ParsedEkycResult
} from '../types/ekyc';
import { EKYC_MESSAGES } from '../utils/constants';
import { validateEkycResult } from '../utils/validation';

/**
 * eKYC capture form validation
 */
const validateEkycForm = (data: EkycFormData): EkycFormErrors => {
  const errors: EkycFormErrors = {};

  // Type validation
  if (!data.type) {
    errors.type = 'Vui lòng chọn loại xác minh';
  }

  return errors;
};

/**
 * Hook for eKYC capture flow with form handling and navigation
 * Similar to useLogin pattern but for eKYC capture process
 */
export const useEkycCapture = (): UseEkycCaptureReturn => {
  const navigation = useNavigation<NavigationProp<any>>();
  const {
    startCapture,
    retryCapture,
    isProcessing,
    error: ekycError,
    canRetry,
    clearError,
    checkAvailability
  } = useEkyc();

  // Form state
  const [formData, setFormData] = useState<EkycFormData>({
    type: 'full' as EkycType,
    isRetake: false,
  });

  const [errors, setErrors] = useState<EkycFormErrors>({});
  // Track touched state for all form fields
  const [touched, setTouched] = useState<Record<keyof EkycFormData, boolean>>({
    type: false,
    isRetake: false,
    previousResults: false,
  });

  // Helper types/guards for validation errors that can be strings or objects
  type ValidationErrorObject = {
    message?: string;
    code?: string;
    severity?: 'critical' | 'warning' | string;
  };
  const isValidationErrorObject = (e: unknown): e is ValidationErrorObject =>
    !!e && typeof e === 'object';

  // Capture state
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const [lastResult, setLastResult] = useState<ParsedEkycResult | null>(null);
  const hasAttemptedCapture = useRef(false);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Capture mutation
  const captureMutation = useMutation({
    mutationFn: async (data: EkycFormData) => {
      // Validate form
      const validationErrors = validateEkycForm(data);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        throw new Error('Validation failed');
      }

      // Clear errors
      setErrors({});
      clearError();

      // Check SDK availability
      if (!checkAvailability()) {
        throw new Error(EKYC_MESSAGES.SDK_ERROR);
      }

      console.log('🔍 [useEkycCapture] Starting capture with type:', data.type);

      // Start capture
      const result = await startCapture(data.type);

      // Run comprehensive validation
      try {
        const comprehensiveValidation = await ekycService.validateEkycResultComprehensive(result);

        if (!comprehensiveValidation.isValid) {
          console.warn('🔍 [useEkycCapture] Comprehensive validation failed:', comprehensiveValidation.errors);

          // Check for critical errors that should prevent proceeding
          const criticalErrors = ((comprehensiveValidation.errors as unknown[]) || []).filter((error) => {
            // Check for string errors
            if (typeof error === 'string') {
              const errorLower = error.toLowerCase();

              // Face match errors should be critical
              if (error.includes('độ tương đồng khuôn mặt thấp') ||
                errorLower.includes('face match') ||
                errorLower.includes('faces do not match') ||
                errorLower.includes('khuôn mặt không khớp')) {
                return true;
              }

              // Fake document detection should be critical
              if (errorLower.includes('detected as fake') ||
                errorLower.includes('fake liveness') ||
                errorLower.includes('high fake') ||
                errorLower.includes('front card detected as fake') ||
                errorLower.includes('back card detected as fake') ||
                errorLower.includes('fake document') ||
                errorLower.includes('forged document') ||
                errorLower.includes('giấy tờ giả mạo') ||
                errorLower.includes('tài liệu giả')) {
                return true;
              }

              // Liveness / mask issues should be critical
              if (errorLower.includes('wearing a mask') ||
                errorLower.includes('mask detected') ||
                errorLower.includes('mask on face') ||
                errorLower.includes('liveness check failed') ||
                errorLower.includes('not a real person') ||
                errorLower.includes('spoof') ||
                errorLower.includes('presentation attack')) {
                return true;
              }

              // OCR and format errors
              if (error.includes('không thể đọc') ||
                error.includes('không hợp lệ') ||
                error.includes('thiếu')) {
                return true;
              }

              // Document expiry should be critical
              if (errorLower.includes('document has expired') ||
                errorLower.includes('expired') ||
                error.includes('hết hạn') ||
                error.includes('đã hết hiệu lực')) {
                return true;
              }

              return false;
            }
            // Check for object errors with severity or code
            if (isValidationErrorObject(error)) {
              return (
                error.severity === 'critical' ||
                (error.code?.includes('MISSING_REQUIRED') ?? false) ||
                (error.code?.includes('INVALID_FORMAT') ?? false) ||
                (error.code?.includes('FACE_MATCH') ?? false) ||
                (error.code?.includes('FAKE_DOCUMENT') ?? false) ||
                (error.code?.includes('EXPIRED_DOCUMENT') ?? false)
              );
            }
            return false;
          });

          if (criticalErrors.length > 0) {
            const errorMessage = criticalErrors.length === 1
              ? (typeof criticalErrors[0] === 'string' ? criticalErrors[0] : (isValidationErrorObject(criticalErrors[0]) ? criticalErrors[0].message || 'Dữ liệu không hợp lệ' : 'Dữ liệu không hợp lệ'))
              : `Dữ liệu không hợp lệ: ${criticalErrors
                .map((e) => (typeof e === 'string' ? e : (isValidationErrorObject(e) ? e.message || '' : '')))
                .filter(Boolean)
                .join(', ')}`;
            console.error('🚨 [useEkycCapture] CRITICAL ERROR DETECTED - Throwing error:', {
              criticalErrorsCount: criticalErrors.length,
              criticalErrors: criticalErrors,
              errorMessage: errorMessage
            });
            throw new Error(errorMessage);
          }

          // For non-critical errors, just log warnings
          console.warn('🔍 [useEkycCapture] Non-critical validation issues:', comprehensiveValidation.errors);
        } else {
          console.log('🔍 [useEkycCapture] Comprehensive validation passed');
        }

        console.log('🔍 [useEkycCapture] Validation complete - proceeding to return result');


        // Attach validation result to the parsed result for later use
        result.validationResult = comprehensiveValidation;

      } catch (validationError: unknown) {
        console.error('🔍 [useEkycCapture] Validation process failed:', validationError);
        // If the validation error is already about face match, re-throw it
        if (
          validationError instanceof Error &&
          (validationError.message.includes('độ tương đồng khuôn mặt thấp') ||
            validationError.message.includes('Khuôn mặt không khớp') ||
            validationError.message.includes('face match') ||
            validationError.message.includes('Face matching'))) {
          throw validationError;
        }

        // Fall back to simple validation if comprehensive validation fails
        const fallbackValidation = validateEkycResult(result);
        if (!fallbackValidation.isValid && fallbackValidation.errors.length > 0) {
          console.warn('🔍 [useEkycCapture] Fallback validation errors:', fallbackValidation.errors);

          // Check if any errors are critical (especially face match)
          const criticalFallbackErrors = fallbackValidation.errors.filter(error =>
            error.includes('độ tương đồng khuôn mặt thấp') ||
            error.includes('Khuôn mặt không khớp') ||
            error.includes('không thể đọc') ||
            error.includes('không tìm thấy')
          );

          if (criticalFallbackErrors.length > 0) {
            throw new Error(criticalFallbackErrors[0]);
          }
        }
      }

      return result;
    },
    retry: false, // Disable automatic retry
    onSuccess: (result) => {
      console.log('🔍 [useEkycCapture] Capture successful');
      setLastResult(result);
      setCaptureAttempts(prev => prev + 1);

      // Navigate to results screen if component is still mounted
      if (isMounted.current) {
        handleNavigateToResults(result);
      }
    },
    onError: (error: any) => {
      console.error('🔍 [useEkycCapture] Capture failed:', error);
      setCaptureAttempts(prev => prev + 1);

      // Handle specific error types
      if (error.message !== 'Validation failed') {
        setErrors({
          general: error.message || EKYC_MESSAGES.GENERAL_ERROR,
        });
      }
    },
  });

  // Retry mutation
  const retryMutation = useMutation({
    mutationFn: async () => {
      if (!canRetry) {
        throw new Error('Đã vượt quá số lần thử lại cho phép');
      }

      console.log('🔍 [useEkycCapture] Retrying capture');
      clearError();

      const result = await retryCapture();

      // Run comprehensive validation on retry result as well
      try {
        const comprehensiveValidation = await ekycService.validateEkycResultComprehensive(result);

        if (!comprehensiveValidation.isValid) {
          console.warn('🔍 [useEkycCapture] Retry comprehensive validation failed:', comprehensiveValidation.errors);

          // Check for critical errors that should prevent proceeding
          const criticalErrors = ((comprehensiveValidation.errors as unknown[]) || []).filter((error) => {
            // Check for string errors
            if (typeof error === 'string') {
              const errorLower = error.toLowerCase();

              // Face match errors should be critical
              if (error.includes('độ tương đồng khuôn mặt thấp') ||
                errorLower.includes('face match') ||
                errorLower.includes('faces do not match') ||
                errorLower.includes('khuôn mặt không khớp')) {
                return true;
              }

              // Fake document detection should be critical
              if (errorLower.includes('detected as fake') ||
                errorLower.includes('fake liveness') ||
                errorLower.includes('high fake') ||
                errorLower.includes('front card detected as fake') ||
                errorLower.includes('back card detected as fake') ||
                errorLower.includes('fake document') ||
                errorLower.includes('forged document') ||
                errorLower.includes('giấy tờ giả mạo') ||
                errorLower.includes('tài liệu giả')) {
                return true;
              }

              // Liveness / mask issues should be critical
              if (errorLower.includes('wearing a mask') ||
                errorLower.includes('mask detected') ||
                errorLower.includes('mask on face') ||
                errorLower.includes('liveness check failed') ||
                errorLower.includes('not a real person') ||
                errorLower.includes('spoof') ||
                errorLower.includes('presentation attack')) {
                return true;
              }

              // OCR and format errors
              if (error.includes('không thể đọc') ||
                error.includes('không hợp lệ') ||
                error.includes('thiếu')) {
                return true;
              }

              // Document expiry should be critical
              if (errorLower.includes('document has expired') ||
                errorLower.includes('expired') ||
                error.includes('hết hạn') ||
                error.includes('đã hết hiệu lực')) {
                return true;
              }

              return false;
            }
            // Check for object errors with severity or code
            if (isValidationErrorObject(error)) {
              return (
                error.severity === 'critical' ||
                (error.code?.includes('MISSING_REQUIRED') ?? false) ||
                (error.code?.includes('INVALID_FORMAT') ?? false) ||
                (error.code?.includes('FACE_MATCH') ?? false) ||
                (error.code?.includes('FAKE_DOCUMENT') ?? false) ||
                (error.code?.includes('EXPIRED_DOCUMENT') ?? false)
              );
            }
            return false;
          });

          if (criticalErrors.length > 0) {
            const errorMessage = criticalErrors.length === 1
              ? (typeof criticalErrors[0] === 'string' ? criticalErrors[0] : (isValidationErrorObject(criticalErrors[0]) ? criticalErrors[0].message || 'Dữ liệu không hợp lệ' : 'Dữ liệu không hợp lệ'))
              : `Dữ liệu không hợp lệ sau khi thử lại: ${criticalErrors
                .map((e) => (typeof e === 'string' ? e : (isValidationErrorObject(e) ? e.message || '' : '')))
                .filter(Boolean)
                .join(', ')}`;
            throw new Error(errorMessage);
          }
        } else {
          console.log('🔍 [useEkycCapture] Retry comprehensive validation passed');
        }

        // Attach validation result
        result.validationResult = comprehensiveValidation;

      } catch (validationError: unknown) {
        console.error('🔍 [useEkycCapture] Retry validation process failed:', validationError);
        // If the validation error is already about face match, re-throw it
        if (validationError instanceof Error &&
          (validationError.message.includes('độ tương đồng khuôn mặt thấp') ||
            validationError.message.includes('Khuôn mặt không khớp') ||
            validationError.message.includes('face match') ||
            validationError.message.includes('Face matching'))) {
          throw validationError;
        }

        // Fall back to simple validation
        const fallbackValidation = validateEkycResult(result);
        if (!fallbackValidation.isValid && fallbackValidation.errors.length > 0) {
          console.warn('🔍 [useEkycCapture] Retry fallback validation errors:', fallbackValidation.errors);

          // Check if any errors are critical (especially face match)
          const criticalFallbackErrors = fallbackValidation.errors.filter(error =>
            error.includes('độ tương đồng khuôn mặt thấp') ||
            error.includes('Khuôn mặt không khớp') ||
            error.includes('không thể đọc') ||
            error.includes('không tìm thấy')
          );

          if (criticalFallbackErrors.length > 0) {
            throw new Error(criticalFallbackErrors[0]);
          }
        }
      }

      return result;
    },
    retry: false,
    onSuccess: (result) => {
      console.log('🔍 [useEkycCapture] Retry successful');
      setLastResult(result);

      if (isMounted.current) {
        handleNavigateToResults(result);
      }
    },
    onError: (error: any) => {
      console.error('🔍 [useEkycCapture] Retry failed:', error);
      setErrors({
        general: error.message || 'Thử lại thất bại',
      });
    },
  });

  // Handle navigation to results
  const handleNavigateToResults = useCallback((result: ParsedEkycResult) => {
    try {
      const ocrData = result.ocrData;

      if (!ocrData) {
        console.warn('🔍 [useEkycCapture] No OCR data in result');
        setErrors({
          general: 'Không thể đọc thông tin từ giấy tờ. Vui lòng thử lại.',
        });
        return;
      }

      // Check validation result before allowing navigation
      if (result.validationResult) {
        console.log('🔍 [useEkycCapture] Checking validation result before navigation:', {
          isValid: result.validationResult.isValid,
          errorCount: result.validationResult.errors?.length || 0
        });

        // If comprehensive validation failed, block navigation
        if (!result.validationResult.isValid && result.validationResult.errors?.length > 0) {
          const criticalErrors = (result.validationResult.errors as unknown[]).filter((error) => {
            // Check for string errors
            if (typeof error === 'string') {
              const errorLower = error.toLowerCase();

              // Critical validation issues that should block navigation
              return errorLower.includes('face match') ||
                errorLower.includes('faces do not match') ||
                errorLower.includes('khuôn mặt không khớp') ||
                errorLower.includes('độ tương đồng khuôn mặt thấp') ||
                errorLower.includes('detected as fake') ||
                errorLower.includes('fake document') ||
                errorLower.includes('giấy tờ giả mạo') ||
                errorLower.includes('wearing a mask') ||
                errorLower.includes('mask detected') ||
                errorLower.includes('liveness check failed') ||
                errorLower.includes('document has expired') ||
                errorLower.includes('hết hạn') ||
                error.includes('không thể đọc') ||
                error.includes('không hợp lệ');
            }

            // Check for object errors with severity or specific codes
            if (isValidationErrorObject(error)) {
              return (
                error.severity === 'critical' ||
                !!error.code?.includes('FACE_MATCH') ||
                !!error.code?.includes('FAKE_DOCUMENT') ||
                !!error.code?.includes('EXPIRED_DOCUMENT') ||
                !!error.code?.includes('MISSING_REQUIRED') ||
                !!error.code?.includes('INVALID_FORMAT')
              );
            }
            return false;
          });

          if (criticalErrors.length > 0) {
            const errorMessage = criticalErrors.length === 1
              ? (typeof criticalErrors[0] === 'string' ? criticalErrors[0] : (isValidationErrorObject(criticalErrors[0]) ? criticalErrors[0].message || 'Dữ liệu không hợp lệ' : 'Dữ liệu không hợp lệ'))
              : `Dữ liệu không hợp lệ: ${criticalErrors
                .map((e) => (typeof e === 'string' ? e : (isValidationErrorObject(e) ? e.message || '' : '')))
                .filter(Boolean)
                .join(', ')}`;

            console.error('🚨 [useEkycCapture] Critical validation errors prevent navigation:', {
              criticalErrorsCount: criticalErrors.length,
              criticalErrors: criticalErrors,
              errorMessage: errorMessage
            });

            setErrors({
              general: errorMessage,
            });

            // Throw error to trigger the parent error handler which should show an alert
            throw new Error(errorMessage);
          }
        }
      }

      console.log('🔍 [useEkycCapture] Validation passed, proceeding with navigation');

      // Navigate to UserInfo screen with extracted data
      navigation.navigate('UserInfo' as any, {
        idNumber: ocrData.id,
        fullName: ocrData.name,
        gender: ocrData.sex,
        dateOfBirth: ocrData.dob,
        nationality: ocrData.nationality,
        address: ocrData.address || ocrData.home,
        ekycResult: result,
      });
    } catch (error: any) {
      console.error('🔍 [useEkycCapture] Navigation failed:', error);
      setErrors({
        general: error.message || 'Có lỗi xảy ra khi chuyển trang. Vui lòng thử lại.',
      });

      // Re-throw the error so it can be caught by the parent error handler
      throw error;
    }
  }, [navigation]);

  // Handle capture
  const handleCapture = useCallback(async (type: EkycType) => {
    if (isProcessing || hasAttemptedCapture.current) {
      console.log('🔍 [useEkycCapture] Ignoring capture call - already processing');
      return;
    }

    if (!isMounted.current) {
      console.log('🔍 [useEkycCapture] Component not mounted, aborting capture');
      return;
    }

    console.log('🔍 [useEkycCapture] Starting capture process');
    hasAttemptedCapture.current = true;

    // Update form data
    const updatedFormData = {
      ...formData,
      type,
      isRetake: captureAttempts > 0,
    };
    setFormData(updatedFormData);

    // Mark fields as touched
    setTouched({ type: true, isRetake: true, previousResults: !!updatedFormData.previousResults });

    try {
      await captureMutation.mutateAsync(updatedFormData);
    } catch (error: any) {
      // Error is handled in onError callback and also needs to be re-thrown
      console.error('🔍 [useEkycCapture] Capture mutation failed:', {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack?.substring(0, 300)
      });

      // Log the exact error message for debugging face match issues
      if (error.message && (error.message.includes('tương đồng khuôn mặt') || error.message.includes('Face matching'))) {
        console.error('🔍 [useEkycCapture] Face match error detected:', error.message);
      }

      throw error;
    } finally {
      hasAttemptedCapture.current = false;
    }
  }, [formData, isProcessing, captureAttempts, captureMutation]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    if (!canRetry) {
      setErrors({
        general: 'Đã vượt quá số lần thử lại cho phép',
      });
      return;
    }

    try {
      await retryMutation.mutateAsync();
    } catch (error) {
      // Error is handled in onError callback
      console.error('🔍 [useEkycCapture] Retry mutation failed:', error);
    }
  }, [canRetry, retryMutation]);

  // Update form data
  const updateFormData = useCallback((data: Partial<EkycFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // Clear errors
  const clearFormErrors = useCallback(() => {
    setErrors({});
    clearError();
  }, [clearError]);

  // Mark field as touched
  const markFieldTouched = useCallback((field: keyof EkycFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Get field error
  const getFieldError = useCallback((field: keyof EkycFormData) => {
    // Only fields present in EkycFormErrors are indexable
    if (!touched[field]) return undefined;
    if (field === 'type') return errors.type;
    // No specific error messages tracked for isRetake/previousResults
    return undefined;
  }, [touched, errors]);

  // Check if form can be submitted
  const canSubmit = useCallback(() => {
    const validationErrors = validateEkycForm(formData);
    return Object.keys(validationErrors).length === 0 &&
      !isProcessing &&
      checkAvailability();
  }, [formData, isProcessing, checkAvailability]);

  return {
    // Form state
    formData,
    errors,
    touched,

    // Actions
    handleCapture,
    handleRetry,
    updateFormData,
    clearErrors: clearFormErrors,
    markFieldTouched,

    // Status
    isProcessing: isProcessing || captureMutation.isPending || retryMutation.isPending,
    canSubmit: canSubmit(),
    canRetry,
    captureAttempts,

    // Results
    lastResult,

    // Utils
    getFieldError,

    // Combined error state
    error: errors.general ?? (ekycError ?? undefined),
  };
};
