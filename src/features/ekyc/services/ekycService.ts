import { NativeModules, Platform } from 'react-native';
import { formatDateToYYYYMMDD } from '../utils/ekycUtils';
import { EKYC_CONSTANTS, EKYC_ERROR_CODES, EKYC_MESSAGES } from '../utils/constants';
import { validateEkycResult, createValidationReport } from './types';
import { isNativeModuleReady } from '@/shared/utils/nativeModuleSafety';
import type {
  ParsedEkycResult,

} from '../types/ekyc';
import type { ValidationResult, ValidationReport } from './types';


// Internal SDK result interface
interface EkycResult {
  LOG_OCR?: string;
  LOG_LIVENESS_CARD_FRONT?: string;
  LOG_LIVENESS_CARD_REAR?: string;
  LOG_COMPARE?: string;
  LOG_LIVENESS_FACE?: string;
  LOG_MASK_FACE?: string;
  LOG_VERIFY_FACE?: string;
  IMAGE_FRONT_PATH?: string;
  IMAGE_BACK_PATH?: string;
  IMAGE_FACE_PATH?: string;
  IMAGE_FACE_FAR_PATH?: string;
  IMAGE_FACE_NEAR_PATH?: string;
}

// Legacy interface - will be removed in favor of types/ekyc.ts
interface LegacyEkycOcrData {
  id?: string;
  name?: string;
  dob?: string;
  doi?: string;
  sex?: string;
  nationality?: string;
  home?: string;
  address?: string;
  doe?: string;
  type_new?: string;
  type?: string;
  address_entities?: any[];
  home_entities?: any[];
  id_prob?: string;
  name_prob?: string;
  dob_prob?: string;
  sex_prob?: string;
  nationality_prob?: string;
  home_prob?: string;
  address_prob?: string;
  doe_prob?: string;
  type_new_prob?: string;
  errors?: string[];
}

// Note: ParsedEkycResult is now imported from types/ekyc.ts

interface PostCodeEntry {
  type: string;
  city: [string, string, number];
  district: [string, string, number];
  ward: [string, string, number];
  detail: string;
  debug: string;
}

// Safe access to EkycBridge with null checking
const EkycBridge = NativeModules.EkycBridge || null;

// Log native module status for debugging
if (!isNativeModuleReady(EkycBridge)) {
  console.warn('EkycService: EkycBridge native module is not available or not properly initialized');
}

/**
 * eKYC Service
 * Handles all eKYC-related operations using singleton pattern
 */
export class EkycService {
  private static instance: EkycService;

  private constructor() { }

  static getInstance(): EkycService {
    if (!EkycService.instance) {
      EkycService.instance = new EkycService();
    }
    return EkycService.instance;
  }
  /**
   * Start eKYC OCR for ID card (works for both front and back)
   */
  async startEkycOcr(): Promise<ParsedEkycResult> {
    if (!this.isAvailable()) {
      throw this.createError(
        EKYC_MESSAGES.SDK_ERROR,
        EKYC_ERROR_CODES.SDK_NOT_AVAILABLE,
        'SDK'
      );
    }

    try {
      // Get fresh eKYC token from API
      const ekycToken = await this.getEkycToken();

      const resultJson = await EkycBridge.startEkycOcr(ekycToken);

      // Check if the result is empty or null
      if (!resultJson || resultJson.trim() === '') {
        throw {
          code: 'USER_CANCELLED',
          message:
            'eKYC SDK returned empty result. This may indicate the user cancelled the process or there was an error.',
          userMessage: 'Quá trình xác minh đã bị hủy.',
        };
      }

      return this.parseEkycResult(resultJson);
    } catch (error: any) {
      // Handle specific error types
      if (error.code === 'USER_CANCELLED') {
        throw this.createError(
          'Quá trình xác minh đã bị hủy',
          EKYC_ERROR_CODES.USER_CANCELLED,
          'VALIDATION',
          error
        );
      }

      if (error.message?.includes('timeout')) {
        throw this.createError(
          EKYC_MESSAGES.TIMEOUT_ERROR,
          EKYC_ERROR_CODES.EKYC_TIMEOUT,
          'TIMEOUT',
          error
        );
      }

      // Re-throw if already formatted
      if (error.code && error.type) {
        throw error;
      }

      // Default error
      throw this.createError(
        EKYC_MESSAGES.GENERAL_ERROR,
        EKYC_ERROR_CODES.EKYC_TIMEOUT,
        'UNKNOWN',
        error
      );
    }
  }

  // Removed alias functions - use startEkycOcr() directly

  /**
   * Start full eKYC flow (ID card + face verification)
   */
  async startEkycFull(): Promise<ParsedEkycResult> {
    // Kiểm tra SDK có sẵn cho nền tảng hiện tại không thay vì chỉ kiểm tra iOS
    if (!this.isAvailable()) {
      throw this.createError(
        EKYC_MESSAGES.SDK_ERROR,
        EKYC_ERROR_CODES.SDK_NOT_AVAILABLE,
        'SDK'
      );
    }

    try {
      // Get fresh eKYC token from API
      const ekycToken = await this.getEkycToken();

      try {
        // Call eKYC SDK without timeout
        const resultJson = await EkycBridge.startEkycFull(ekycToken) as string;

        // Check if the result is empty or null
        if (!resultJson || resultJson.trim() === '') {
          throw {
            code: 'USER_CANCELLED',
            message:
              'eKYC SDK returned empty result. This may indicate the user cancelled the process or there was an error.',
            userMessage: 'Quá trình xác minh đã bị hủy.',
          };
        }

        const parsedResult = this.parseEkycResult(resultJson);

        // Validate that we got meaningful data
        if (!this.validateEkycResult(parsedResult)) {
          throw new Error(
            'eKYC completed but no valid data was captured. This usually means the user cancelled the process.',
          );
        }

        return parsedResult;
      } catch (innerError: any) {
        throw innerError;  // Re-throw to be caught by outer catch
      }
    } catch (error: any) {
      // Add specific error codes for common issues
      if (error.message && error.message.includes('timeout')) {
        throw {
          ...error,
          code: 'EKYC_TIMEOUT',
          userMessage:
            'Quá trình xác minh bị quá thời gian. Vui lòng kiểm tra kết nối mạng và thử lại.',
        };
      }

      if (error.message && error.message.includes('empty result')) {
        throw {
          ...error,
          code: 'USER_CANCELLED',
          userMessage: 'Quá trình xác minh đã bị hủy.',
        };
      }

      throw error;
    }
  }

  /**
   * Start eKYC face verification only
   */
  async startEkycFace(): Promise<ParsedEkycResult> {
    if (!this.isAvailable()) {
      throw this.createError(
        EKYC_MESSAGES.SDK_ERROR,
        EKYC_ERROR_CODES.SDK_NOT_AVAILABLE,
        'SDK'
      );
    }

    try {
      // Get fresh eKYC token from API
      const ekycToken = await this.getEkycToken();

      const resultJson = await EkycBridge.startEkycFace(ekycToken);

      // Check if the result is empty or null
      if (!resultJson || resultJson.trim() === '') {
        throw {
          code: 'USER_CANCELLED',
          message:
            'eKYC SDK returned empty result. This may indicate the user cancelled the process or there was an error.',
          userMessage: 'Quá trình xác minh đã bị hủy.',
        };
      }

      console.log('resultJson', resultJson);

      return this.parseEkycResult(resultJson);
    } catch (error: any) {
      // Handle specific error types
      if (error.code === 'USER_CANCELLED') {
        throw this.createError(
          'Quá trình xác minh khuôn mặt đã bị hủy',
          EKYC_ERROR_CODES.USER_CANCELLED,
          'VALIDATION',
          error
        );
      }

      // Re-throw if already formatted
      if (error.code && error.type) {
        throw error;
      }

      // Default error
      throw this.createError(
        EKYC_MESSAGES.GENERAL_ERROR,
        EKYC_ERROR_CODES.EKYC_TIMEOUT,
        'UNKNOWN',
        error
      );
    }
  }

  /**
   * Parse the JSON result from the native eKYC SDK
   */
  private parseEkycResult(resultJson: string): ParsedEkycResult {
    try {
      const result: EkycResult = JSON.parse(resultJson);

      const parsedResult: ParsedEkycResult = {};

      // Parse OCR data if available
      if (
        result.LOG_OCR &&
        result.LOG_OCR !== 'undefined' &&
        result.LOG_OCR.trim() !== ''
      ) {
        try {
          const ocrResult = JSON.parse(result.LOG_OCR);

          console.log('ocrResult', ocrResult);

          // Extract OCR errors if any
          if (ocrResult.errors && Array.isArray(ocrResult.errors)) {
            parsedResult.ocrErrors = ocrResult.errors;
          }

          // Extract date of birth from MRZ
          const mrzDob = ocrResult.object?.mrz?.[1]?.substring(0, 6); // YYMMDD format
          const dobYear = mrzDob ? `20${mrzDob.substring(0, 2)}` : undefined; // Assuming 21st century
          const dobMonth = mrzDob ? mrzDob.substring(2, 4) : undefined;
          const dobDay = mrzDob ? mrzDob.substring(4, 6) : undefined;
          const formattedDob =
            dobYear && dobMonth && dobDay
              ? `${dobDay}/${dobMonth}/${dobYear}`
              : undefined;

          parsedResult.ocrData = {
            id: ocrResult.object?.id,
            name: ocrResult.object?.name,
            dob: formattedDob,
            doi: ocrResult.object?.issue_date,
            sex: ocrResult.object?.gender,
            nationality: ocrResult.object?.nationality,
            home: ocrResult.object?.origin_location,
            address: ocrResult.object?.recent_location,
            doe: ocrResult.object?.valid_date,
            type_new: ocrResult.object?.card_type,
            type: ocrResult.object?.card_type,
            address_entities: ocrResult.object?.post_code?.filter(
              (pc: PostCodeEntry) => pc.type === 'address',
            ),
            home_entities: ocrResult.object?.post_code?.filter(
              (pc: PostCodeEntry) => pc.type === 'hometown',
            ),
            id_prob: ocrResult.object?.id_probs,
            name_prob: ocrResult.object?.name_prob,
            dob_prob: ocrResult.object?.birth_day_prob,
            sex_prob: '1.0',
            nationality_prob: '1.0',
            home_prob: ocrResult.object?.origin_location_prob,
            address_prob: '1.0',
            doe_prob: ocrResult.object?.valid_date_prob,
            type_new_prob: '1.0',
          };

        } catch (error) {
          console.warn('🔍 [eKYC-PARSER] Failed to parse OCR data:', error);
        }
      } else {
        console.log('🔍 [eKYC-PARSER] No OCR data to parse');
      }

      // Parse front card liveness data if available
      if (
        result.LOG_LIVENESS_CARD_FRONT &&
        result.LOG_LIVENESS_CARD_FRONT !== 'undefined' &&
        result.LOG_LIVENESS_CARD_FRONT.trim() !== ''
      ) {
        try {
          parsedResult.frontCardLiveness = JSON.parse(
            result.LOG_LIVENESS_CARD_FRONT,
          );

          console.log("Log Liveness card front",)

        } catch (error) {
          console.warn(
            '🔍 [eKYC-PARSER] Failed to parse front card liveness data:',
            error,
          );
        }
      } else {
        console.log('🔍 [eKYC-PARSER] No front card liveness data to parse');
      }

      // Parse back card liveness data if available
      if (
        result.LOG_LIVENESS_CARD_REAR &&
        result.LOG_LIVENESS_CARD_REAR !== 'undefined' &&
        result.LOG_LIVENESS_CARD_REAR.trim() !== ''
      ) {
        try {
          console.log("Log Liveness card rear", result.LOG_LIVENESS_CARD_REAR)

          parsedResult.backCardLiveness = JSON.parse(
            result.LOG_LIVENESS_CARD_REAR,
          );
        } catch (error) {
          console.warn(
            '🔍 [eKYC-PARSER] Failed to parse back card liveness data:',
            error,
          );
        }
      } else {
        console.log('🔍 [eKYC-PARSER] No back card liveness data to parse');
      }

      // Parse compare result if available
      if (
        result.LOG_COMPARE &&
        result.LOG_COMPARE !== 'undefined' &&
        result.LOG_COMPARE.trim() !== ''
      ) {
        try {
          const compareResult = JSON.parse(result.LOG_COMPARE);

          console.log('compareResult', compareResult);

          parsedResult.compareResult = compareResult;
        } catch (error) {
          console.warn(
            '🔍 [eKYC-PARSER] Failed to parse compare result:',
            error,
          );
        }
      } else {
        console.log('🔍 [eKYC-PARSER] No compare result to parse');
      }

      // Parse face liveness result if available
      if (
        result.LOG_LIVENESS_FACE &&
        result.LOG_LIVENESS_FACE !== 'undefined' &&
        result.LOG_LIVENESS_FACE.trim() !== ''
      ) {
        try {
          console.log("Log Liveness face", result.LOG_LIVENESS_FACE)

          parsedResult.faceLiveness = JSON.parse(result.LOG_LIVENESS_FACE);
        } catch (error) {
          console.warn(
            '🔍 [eKYC-PARSER] Failed to parse face liveness result:',
            error,
          );
        }
      } else {
        console.log('🔍 [eKYC-PARSER] No face liveness result to parse');
      }

      // Parse mask check result if available
      if (
        result.LOG_MASK_FACE &&
        result.LOG_MASK_FACE !== 'undefined' &&
        result.LOG_MASK_FACE.trim() !== ''
      ) {
        try {
          console.log("Log Mask Face", result.LOG_MASK_FACE)

          parsedResult.maskCheck = JSON.parse(result.LOG_MASK_FACE);
        } catch (error) {
          console.warn(
            '🔍 [eKYC-PARSER] Failed to parse mask check result:',
            error,
          );
        }
      } else {
        console.log('🔍 [eKYC-PARSER] No mask check result to parse');
      }

      // Parse verify face result if available (SDK 3.5.6 feature)
      if (
        result.LOG_VERIFY_FACE &&
        result.LOG_VERIFY_FACE !== 'undefined' &&
        result.LOG_VERIFY_FACE.trim() !== ''
      ) {
        try {
          console.log("Log verify face")
          parsedResult.verifyFaceResult = JSON.parse(result.LOG_VERIFY_FACE);
        } catch (error) {
          console.warn(
            '🔍 [eKYC-PARSER] Failed to parse verify face result:',
            error,
          );
        }
      } else {
        console.log('🔍 [eKYC-PARSER] No verify face result to parse');
      }

      // Extract image paths if available
      if (result.IMAGE_FRONT_PATH) {
        parsedResult.imagePaths = {
          frontPath: result.IMAGE_FRONT_PATH,
        };
      }
      if (result.IMAGE_BACK_PATH) {
        parsedResult.imagePaths = {
          ...parsedResult.imagePaths,
          backPath: result.IMAGE_BACK_PATH,
        };
      }
      if (result.IMAGE_FACE_PATH) {
        parsedResult.imagePaths = {
          ...parsedResult.imagePaths,
          facePath: result.IMAGE_FACE_PATH,
        };
      }
      if (result.IMAGE_FACE_FAR_PATH) {
        parsedResult.imagePaths = {
          ...parsedResult.imagePaths,
          faceFarPath: result.IMAGE_FACE_FAR_PATH,
        };
      }
      if (result.IMAGE_FACE_NEAR_PATH) {
        parsedResult.imagePaths = {
          ...parsedResult.imagePaths,
          faceNearPath: result.IMAGE_FACE_NEAR_PATH,
        };
      }

      console.log(parsedResult);

      return parsedResult;
    } catch (error) {
      throw new Error('Failed to parse eKYC result');
    }
  }

  /**
   * Kiểm tra kết quả so sánh khuôn mặt từ eKYC
   * @param result Kết quả từ eKYC đã được phân tích
   * @returns {boolean} true nếu khuôn mặt khớp với ngưỡng cho phép, false nếu không
   */
  validateFaceMatchResult(result: ParsedEkycResult): { isValid: boolean; matchScore?: number; errorMessage?: string } {
    // Kiểm tra nếu không có kết quả so sánh
    if (!result.compareResult || !result.compareResult.object) {
      return {
        isValid: false,
        errorMessage: 'Không tìm thấy kết quả so sánh khuôn mặt'
      };
    }

    // Lấy giá trị độ tương đồng (prob)
    const matchScore = result.compareResult.object.prob;

    // Kiểm tra nếu giá trị prob dưới ngưỡng
    if (typeof matchScore === 'number' && matchScore < EKYC_CONSTANTS.FACE_MATCH_THRESHOLD) {

      return {
        isValid: false,
        matchScore,
        errorMessage: `Độ tương đồng khuôn mặt thấp (${matchScore.toFixed(2)}%), vui lòng chụp lại`
      };
    }

    // Kiểm tra nếu kết quả là "NOMATCH" bất kể giá trị prob
    if (result.compareResult.object.msg === 'NOMATCH') {
      return {
        isValid: false,
        matchScore,
        errorMessage: 'Khuôn mặt không khớp với giấy tờ, vui lòng chụp lại'
      };
    }

    return { isValid: true, matchScore };
  }

  /**
   * Comprehensive eKYC validation using the validation utility
   * @param result Parsed eKYC result
   * @returns Validation result with detailed information
   */
  validateEkycResultComprehensive(result: ParsedEkycResult): ValidationResult {
    try {
      // Convert ParsedEkycResult to the format expected by validation utility
      const validationData = this.convertToValidationFormat(result);

      // Run comprehensive validation
      const validationResult = validateEkycResult(validationData);

      return validationResult;
    } catch (error) {

      // Return a failed validation result
      return {
        isValid: false,
        errors: ['Lỗi khi thực hiện validation: ' + (error instanceof Error ? error.message : 'Unknown error')],
        warnings: [],
        details: {
          ocrValid: false,
          documentAuthentic: false,
          faceMatch: false,
          personReal: false,
          noMask: false,
          dataQuality: false
        }
      };
    }
  }

  /**
   * Generate validation report for eKYC result
   * @param result Parsed eKYC result
   * @returns Detailed validation report
   */
  generateValidationReport(result: ParsedEkycResult): ValidationReport {
    try {
      const validationData = this.convertToValidationFormat(result);
      const report = createValidationReport(validationData);

      return report;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert ParsedEkycResult to the format expected by validation utility
   * @param result ParsedEkycResult from eKYC SDK
   * @returns Data in format expected by validation utility
   */
  private convertToValidationFormat(result: ParsedEkycResult): any {
    return {
      ocrData: result.ocrData || {},
      frontCardLiveness: result.frontCardLiveness || {},
      backCardLiveness: result.backCardLiveness || {},
      compareResult: result.compareResult || {},
      faceLiveness: result.faceLiveness || {},
      maskCheck: result.maskCheck || {},
      imagePaths: {
        frontPath: result.imagePaths?.frontPath || '',
        backPath: result.imagePaths?.backPath || '',
        faceFarPath: result.imagePaths?.faceFarPath || '',
        faceNearPath: result.imagePaths?.faceNearPath || ''
      }
    };
  }

  /**
   * Validate if the eKYC result contains meaningful data (legacy method)
   */
  validateEkycResult(result: ParsedEkycResult): boolean {
    const hasOcrData =
      result.ocrData &&
      (result.ocrData.id || result.ocrData.name || result.ocrData.dob);

    // Allow results with OCR errors to pass validation
    // The UserInfoScreen will handle showing errors and allowing retakes
    const hasOcrErrors = result.ocrErrors && result.ocrErrors.length > 0;

    // Consider result valid if we have OCR data OR OCR errors (but not completely empty)
    const hasOcrContent = hasOcrData || hasOcrErrors;

    const hasLivenessData = result.frontCardLiveness || result.backCardLiveness;
    const hasFaceData = result.faceLiveness;

    // Kiểm tra kết quả so sánh khuôn mặt
    // Lưu ý: Không bắt buộc kết quả so sánh phải hợp lệ ở đây
    // Chúng ta sẽ kiểm tra riêng ở EkycCaptureScreen và hiển thị thông báo phù hợp
    const faceMatchResult = this.validateFaceMatchResult(result);

    // For a complete eKYC flow, we need OCR content (data or errors) and liveness data
    // This allows navigation to UserInfoScreen even with OCR errors
    const isValid = !!(hasOcrContent && hasLivenessData && hasFaceData);

    return isValid;
  }

  /**
   * Create standardized error object
   */
  private createError(
    message: string,
    code: string,
    type: 'SDK' | 'NETWORK' | 'VALIDATION' | 'TIMEOUT' | 'UNKNOWN' = 'UNKNOWN',
    details?: any
  ) {
    return {
      message,
      code,
      type,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get eKYC token from API
   */
  private async getEkycToken(): Promise<string> {
    try {
      // Dynamic import to avoid TypeScript path resolution issues
      const { ekycApiService } = await import('./ekycApiService');
      return await ekycApiService.getEkycToken();
    } catch (error: any) {
      // Convert API service error to EkycService error format
      throw this.createError(
        error.message || 'Không thể lấy token eKYC.',
        error.code || EKYC_ERROR_CODES.TOKEN_ERROR,
        error.type || 'NETWORK'
      );
    }
  }

  /**
   * Check if eKYC is available on the current platform
   */
  isAvailable(): boolean {
    const available = Platform.OS === 'ios' || (Platform.OS === 'android' && !!EkycBridge);
    return available;
  }
}

// Export singleton instance
export const ekycService = EkycService.getInstance();

// Export legacy types for backward compatibility
export type { LegacyEkycOcrData as EkycOcrData };



/**
 * Phân tích dữ liệu OCR từ kết quả eKYC
 * @param ekycResult Kết quả từ eKYC
 * @returns Dữ liệu đã được phân tích và chuẩn hóa
 */
export const parseOcrData = (ekycResult: ParsedEkycResult) => {
  const ocrData = ekycResult.ocrData || {};
  const ocrErrors: string[] = [];

  // Kiểm tra các trường dữ liệu bắt buộc
  if (!ocrData.name) { ocrErrors.push('Không thể đọc họ tên từ giấy tờ'); }
  if (!ocrData.id) { ocrErrors.push('Không thể đọc số CCCD/CMND từ giấy tờ'); }
  if (!ocrData.dob) { ocrErrors.push('Không thể đọc ngày sinh từ giấy tờ'); }
  if (!ocrData.address) { ocrErrors.push('Không thể đọc địa chỉ từ giấy tờ'); }

  // Chuyển đổi định dạng ngày tháng sang YYYY-MM-DD
  const formattedDob = formatDateToYYYYMMDD(ocrData.dob || '');
  const formattedDoi = formatDateToYYYYMMDD(ocrData.doi || '');
  const formattedDoe = formatDateToYYYYMMDD(ocrData.doe || '');

  // Loại bỏ ký tự xuống dòng trong địa chỉ
  const cleanAddress = ocrData.address ? ocrData.address.replace(/\n/g, ' ').trim() : '';

  return {
    fullName: ocrData.name || '',
    gender: ocrData.sex || 'Nam',
    dateOfBirth: formattedDob,
    dateOfIssue: formattedDoi,
    dateOfExpiry: formattedDoe,
    nationality: ocrData.nationality || 'Việt Nam',
    idNumber: ocrData.id || '',
    address: cleanAddress,
    ocrErrors,
  };
};



// Deprecated function removed - use useEkycUpload hook instead
