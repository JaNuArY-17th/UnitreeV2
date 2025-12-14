/**
 * eKYC Validation Utilities
 * Validation functions for eKYC data and results
 */

import { 
  EKYC_CONSTANTS, 
  VALIDATION_RULES, 
  DATE_FORMATS,
  EKYC_MESSAGES 
} from './constants';
import type { 
  EkycOcrData, 
  EkycLivenessData, 
  EkycCompareData,
  ParsedEkycResult,
  DocumentData,
  FaceData 
} from '../types';

/**
 * Validate ID number format
 */
export const validateIdNumber = (idNumber: string): { isValid: boolean; error?: string } => {
  if (!idNumber) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_ID_NUMBER };
  }

  const trimmed = idNumber.trim();
  
  if (trimmed.length < VALIDATION_RULES.ID_NUMBER.MIN_LENGTH || 
      trimmed.length > VALIDATION_RULES.ID_NUMBER.MAX_LENGTH) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_ID_NUMBER };
  }

  if (!VALIDATION_RULES.ID_NUMBER.PATTERN.test(trimmed)) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_ID_NUMBER };
  }

  return { isValid: true };
};

/**
 * Validate full name
 */
export const validateFullName = (name: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_NAME };
  }

  const trimmed = name.trim();
  
  if (trimmed.length < VALIDATION_RULES.NAME.MIN_LENGTH || 
      trimmed.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_NAME };
  }

  // Allow Vietnamese characters and spaces
  if (!VALIDATION_RULES.NAME.PATTERN.test(trimmed)) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_NAME };
  }

  return { isValid: true };
};

/**
 * Validate date format and value
 */
export const validateDate = (dateString: string): { isValid: boolean; error?: string } => {
  if (!dateString) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_DATE };
  }

  // Check format
  const isValidFormat = DATE_FORMATS.DD_MM_YYYY_REGEX.test(dateString) ||
                       DATE_FORMATS.YYYY_MM_DD_REGEX.test(dateString) ||
                       DATE_FORMATS.FLEXIBLE_DATE_REGEX.test(dateString);

  if (!isValidFormat) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_DATE };
  }

  // Parse and validate date
  let date: Date;
  let day: number, month: number, year: number;

  if (DATE_FORMATS.DD_MM_YYYY_REGEX.test(dateString)) {
    const parts = dateString.split('/');
    day = parseInt(parts[0]);
    month = parseInt(parts[1]);
    year = parseInt(parts[2]);

    // Validate day and month ranges
    if (day < 1 || day > 31 || month < 1 || month > 12) {
      return { isValid: false, error: EKYC_MESSAGES.INVALID_DATE };
    }

    date = new Date(year, month - 1, day);

    // Check if the date is valid (e.g., Feb 30 would be invalid)
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return { isValid: false, error: EKYC_MESSAGES.INVALID_DATE };
    }
  } else if (DATE_FORMATS.YYYY_MM_DD_REGEX.test(dateString)) {
    date = new Date(dateString);
  } else {
    // Try to parse flexible format
    const parts = dateString.split(/[\/\-]/);
    if (parts.length === 3) {
      // Assume DD/MM/YYYY or DD-MM-YYYY
      day = parseInt(parts[0]);
      month = parseInt(parts[1]);
      year = parseInt(parts[2]);

      // Validate day and month ranges
      if (day < 1 || day > 31 || month < 1 || month > 12) {
        return { isValid: false, error: EKYC_MESSAGES.INVALID_DATE };
      }

      date = new Date(year, month - 1, day);

      // Check if the date is valid
      if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        return { isValid: false, error: EKYC_MESSAGES.INVALID_DATE };
      }
    } else {
      return { isValid: false, error: EKYC_MESSAGES.INVALID_DATE };
    }
  }

  if (isNaN(date.getTime())) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_DATE };
  }

  // Check if date is reasonable (not too old or in the future)
  const now = new Date();
  const minDate = new Date(now.getFullYear() - EKYC_CONSTANTS.MAX_AGE, 0, 1);
  const maxDate = new Date(now.getFullYear() - EKYC_CONSTANTS.MIN_AGE, 11, 31);

  if (date < minDate || date > maxDate) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_DATE };
  }

  return { isValid: true };
};

/**
 * Validate address
 */
export const validateAddress = (address: string): { isValid: boolean; error?: string } => {
  if (!address) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_ADDRESS };
  }

  const trimmed = address.trim();
  
  if (trimmed.length < VALIDATION_RULES.ADDRESS.MIN_LENGTH || 
      trimmed.length > VALIDATION_RULES.ADDRESS.MAX_LENGTH) {
    return { isValid: false, error: EKYC_MESSAGES.INVALID_ADDRESS };
  }

  return { isValid: true };
};

/**
 * Validate OCR data
 */
export const validateOcrData = (ocrData: EkycOcrData): string[] => {
  const errors: string[] = [];

  // Validate required fields
  if (!ocrData.id) {
    errors.push('Không tìm thấy số CCCD/CMND');
  } else {
    const idValidation = validateIdNumber(ocrData.id);
    if (!idValidation.isValid) {
      errors.push(idValidation.error || 'Số CCCD/CMND không hợp lệ');
    }
  }

  if (!ocrData.name) {
    errors.push('Không tìm thấy họ tên');
  } else {
    const nameValidation = validateFullName(ocrData.name);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.error || 'Họ tên không hợp lệ');
    }
  }

  if (!ocrData.dob) {
    errors.push('Không tìm thấy ngày sinh');
  } else {
    const dateValidation = validateDate(ocrData.dob);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.error || 'Ngày sinh không hợp lệ');
    }
  }

  // Validate optional fields if present
  if (ocrData.address) {
    const addressValidation = validateAddress(ocrData.address);
    if (!addressValidation.isValid) {
      errors.push(addressValidation.error || 'Địa chỉ không hợp lệ');
    }
  }

  return errors;
};

/**
 * Validate liveness data
 */
export const validateLivenessData = (livenessData: EkycLivenessData): string[] => {
  const errors: string[] = [];

  if (!livenessData.object) {
    errors.push('Không có dữ liệu liveness');
    return errors;
  }

  const { liveness, liveness_prob } = livenessData.object;

  // Check liveness result
  if (liveness !== 'live' && liveness !== '1') {
    errors.push('Không thể xác nhận tính sống của khuôn mặt');
  }

  // Check liveness probability if available
  if (typeof liveness_prob === 'number' && liveness_prob < EKYC_CONSTANTS.MIN_LIVENESS_SCORE) {
    errors.push(`Điểm liveness thấp: ${liveness_prob}%`);
  }

  return errors;
};

/**
 * Validate face comparison result
 */
export const validateCompareResult = (compareData: EkycCompareData): string[] => {
  const errors: string[] = [];

  if (!compareData.object) {
    errors.push('Không có dữ liệu so sánh khuôn mặt');
    return errors;
  }

  // Use 'prob' field which is what the SDK actually returns
  const { prob, msg, result } = compareData.object;

  // Check matching result - msg can be 'MATCH' or 'NOMATCH'
  if (msg === 'NOMATCH') {
    errors.push('Khuôn mặt không khớp với ảnh trong giấy tờ');
  }

  // Check probability score (face match confidence)
  if (typeof prob === 'number' && prob < EKYC_CONSTANTS.FACE_MATCH_THRESHOLD) {
    errors.push(`Độ tương đồng khuôn mặt thấp: ${prob.toFixed(2)}%, vui lòng chụp lại`);
  }

  return errors;
};

/**
 * Validate complete eKYC result
 */
export const validateEkycResult = (result: ParsedEkycResult): { 
  isValid: boolean; 
  errors: string[]; 
  warnings: string[] 
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate OCR data
  if (result.ocrData) {
    const ocrErrors = validateOcrData(result.ocrData);
    errors.push(...ocrErrors);
  } else {
    errors.push('Không có dữ liệu OCR');
  }

  // Validate liveness data
  if (result.faceLiveness) {
    const livenessErrors = validateLivenessData(result.faceLiveness);
    errors.push(...livenessErrors);
  } else {
    warnings.push('Không có dữ liệu liveness khuôn mặt');
  }

  // Validate face comparison
  if (result.compareResult) {
    const compareErrors = validateCompareResult(result.compareResult);
    errors.push(...compareErrors);
  } else {
    warnings.push('Không có dữ liệu so sánh khuôn mặt');
  }

  // Check for existing OCR errors
  if (result.ocrErrors && result.ocrErrors.length > 0) {
    warnings.push(...result.ocrErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Check if OCR data has invalid fields
 */
export const checkInvalidOcrData = (verifiedData: {
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
}): boolean => {
  const { fullName, dateOfBirth, idNumber } = verifiedData;

  // Check for common invalid patterns
  const invalidPatterns = [
    /^[X\s]+$/, // All X's or spaces
    /^[0\s]+$/, // All zeros or spaces
    /^[\-\s]+$/, // All dashes or spaces
    /^[\.]+$/, // All dots
    /^X+\/X+\/X+$/, // XX/XX/XXXX pattern
    /unknown/i,
    /invalid/i,
    /error/i,
  ];

  const fieldsToCheck = [fullName, dateOfBirth, idNumber];

  return fieldsToCheck.some(field => {
    if (!field || field.trim().length === 0) return true;
    return invalidPatterns.some(pattern => pattern.test(field));
  });
};

/**
 * Validate document data
 */
export const validateDocumentData = (documentData: DocumentData): {
  isValid: boolean;
  errors: string[];
  fieldErrors: { [key: string]: string };
} => {
  const errors: string[] = [];
  const fieldErrors: { [key: string]: string } = {};

  // Validate ID number
  if (documentData.idNumber) {
    const idValidation = validateIdNumber(documentData.idNumber);
    if (!idValidation.isValid) {
      errors.push(idValidation.error!);
      fieldErrors.idNumber = idValidation.error!;
    }
  }

  // Validate full name
  if (documentData.fullName) {
    const nameValidation = validateFullName(documentData.fullName);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.error!);
      fieldErrors.fullName = nameValidation.error!;
    }
  }

  // Validate date of birth
  if (documentData.dateOfBirth) {
    const dateValidation = validateDate(documentData.dateOfBirth);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.error!);
      fieldErrors.dateOfBirth = dateValidation.error!;
    }
  }

  // Validate address
  if (documentData.address) {
    const addressValidation = validateAddress(documentData.address);
    if (!addressValidation.isValid) {
      errors.push(addressValidation.error!);
      fieldErrors.address = addressValidation.error!;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  };
};

/**
 * Validate face data
 */
export const validateFaceData = (faceData: FaceData): string[] => {
  const errors: string[] = [];

  // Check face quality
  if (typeof faceData.faceQuality === 'number' && 
      faceData.faceQuality < EKYC_CONSTANTS.MIN_FACE_QUALITY) {
    errors.push(`Chất lượng khuôn mặt thấp: ${faceData.faceQuality}%`);
  }

  // Check liveness
  if (faceData.isLive === false) {
    errors.push('Không thể xác nhận tính sống của khuôn mặt');
  }

  // Check if eyes are open
  if (faceData.eyesOpen === false) {
    errors.push('Vui lòng mở mắt');
  }

  // Check mask detection
  if (faceData.hasMask === true) {
    errors.push('Vui lòng tháo khẩu trang');
  }

  return errors;
};

/**
 * Get validation summary for display
 */
export const getValidationSummary = (result: ParsedEkycResult): {
  status: 'success' | 'warning' | 'error';
  message: string;
  details: string[];
} => {
  const validation = validateEkycResult(result);

  if (validation.isValid) {
    return {
      status: 'success',
      message: EKYC_MESSAGES.VALIDATION_SUCCESS,
      details: validation.warnings
    };
  }

  if (validation.errors.length > 0 && validation.warnings.length === 0) {
    return {
      status: 'error',
      message: 'Xác thực thất bại',
      details: validation.errors
    };
  }

  return {
    status: 'warning',
    message: 'Xác thực có cảnh báo',
    details: [...validation.errors, ...validation.warnings]
  };
};
