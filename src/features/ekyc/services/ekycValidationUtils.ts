/**
 * TypeScript utility functions for validating eKYC verification results
 */
import i18n from '@/shared/config/i18n';

// Type definitions for eKYC data structures
export interface AddressEntity {
  debug: string;
  city: [string, string, number];
  district: [string, string, number];
  ward: [string, string, number];
  detail: string;
  type: 'address' | 'hometown';
}

export interface OcrData {
  id: string;
  name: string;
  dob: string;
  doi: string;
  sex: string;
  nationality: string;
  home: string;
  address: string;
  doe: string;
  type_new: string;
  type: string;
  address_entities: AddressEntity[];
  home_entities: AddressEntity[];
  id_prob: string;
  name_prob: number;
  dob_prob: number;
  sex_prob: string;
  nationality_prob: string;
  home_prob: number;
  address_prob: string;
  doe_prob: number;
  type_new_prob: string;
}

export interface CardLivenessObject {
  face_swapping: boolean;
  fake_print_photo: boolean;
  face_swapping_prob: number;
  fake_liveness_prob: number;
  liveness: string;
  fake_liveness: boolean;
  fake_print_photo_prob: number;
  liveness_msg: string;
}

export interface CardLiveness {
  imgs: {
    img: string;
  };
  dataSign: string;
  dataBase64: string;
  logID: string;
  message: string;
  server_version: string;
  object: CardLivenessObject;
  statusCode: number;
  challengeCode: string;
}

export interface MultipleFacesDetails {
  multiple_face_2: boolean;
  multiple_face_1: boolean;
}

export interface CompareResultObject {
  result: string;
  msg: string;
  prob: number;
  match_warning: string;
  multiple_faces_details: MultipleFacesDetails;
  multiple_faces: boolean;
}

export interface CompareResult {
  imgs: {
    img_face: string;
    img_front: string;
  };
  dataSign: string;
  dataBase64: string;
  logID: string;
  message: string;
  server_version: string;
  object: CompareResultObject;
  statusCode: number;
  challengeCode: string;
}

export interface FaceLivenessObject {
  multiple_faces_details: MultipleFacesDetails;
  gender: string;
  blur_face: string;
  liveness: string;
  liveness_msg: string;
  is_eye_open: string;
  age: number;
  blur_face_score: number;
  liveness_prob: number;
  background_warning: string;
  multiple_faces: boolean;
}

export interface FaceLiveness {
  imgs: {
    near_img: string;
    far_img: string;
  };
  dataSign: string;
  dataBase64: string;
  logID: string;
  message: string;
  server_version: string;
  object: FaceLivenessObject;
  statusCode: number;
  challengeCode: string;
}

export interface MaskCheckObject {
  masked: string;
}

export interface MaskCheck {
  imgs: {
    img: string;
  };
  dataSign: string;
  dataBase64: string;
  logID: string;
  message: string;
  server_version: string;
  object: MaskCheckObject;
  statusCode: number;
  challengeCode: string;
}

export interface ImagePaths {
  frontPath: string;
  backPath: string;
  faceFarPath: string;
  faceNearPath: string;
}

export interface ParsedResult {
  ocrData: OcrData;
  frontCardLiveness: CardLiveness;
  backCardLiveness: CardLiveness;
  compareResult: CompareResult;
  faceLiveness: FaceLiveness;
  maskCheck: MaskCheck;
  imagePaths: ImagePaths;
}

// Validation result interfaces
export interface ValidationDetails {
  ocrValid: boolean;
  documentAuthentic: boolean;
  faceMatch: boolean;
  personReal: boolean;
  noMask: boolean;
  dataQuality: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: ValidationDetails;
}

export interface ValidationCheck {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ValidationSummary {
  status: 'PASSED' | 'FAILED';
  totalErrors: number;
  totalWarnings: number;
  checks: Record<string, boolean>;
  errors: string[];
  warnings: string[];
}

// Validation thresholds and constants
export const VALIDATION_THRESHOLDS = {
  OCR_CONFIDENCE_MIN: 0.8,
  FACE_MATCH_MIN: 80.0,
  LIVENESS_PROB_MAX: 0.3,
  FACE_SWAP_PROB_MAX: 0.2,
  FAKE_PRINT_PROB_MAX: 0.1,
  MIN_AGE: 18,
  MAX_AGE: 100
} as const;

const REQUIRED_FIELDS: (keyof OcrData)[] = [
  'id', 'name', 'dob', 'doi', 'sex', 'nationality',
  'home', 'address', 'doe', 'type'
];

const VALID_CARD_TYPES = [
  'CĂN CƯỚC CÔNG DÂN',
  'CHỨNG MINH NHÂN DÂN'
] as const;

// i18n helpers
const tEkyc = (key: string, options?: Record<string, any>) => i18n.t(`ekyc:${key}`, options);

function fieldKeyToLabel(field: keyof OcrData | 'type'): string {
  switch (field) {
    case 'id':
      return tEkyc('fields.idNumber');
    case 'name':
      return tEkyc('fields.fullName');
    case 'dob':
      return tEkyc('fields.dateOfBirth');
    case 'doi':
      return tEkyc('fields.issueDate');
    case 'doe':
      return tEkyc('fields.dateOfExpiry');
    case 'sex':
      return tEkyc('fields.gender');
    case 'nationality':
      return tEkyc('fields.nationality');
    case 'home':
      return tEkyc('fields.placeOfOrigin');
    case 'address':
      return tEkyc('fields.address');
    case 'type':
      return tEkyc('fields.documentType');
    default:
      return String(field);
  }
}

type ConfidenceKeys = 'name_prob' | 'dob_prob' | 'home_prob' | 'address_prob' | 'doe_prob';
function confidenceKeyToLabel(field: ConfidenceKeys): string {
  switch (field) {
    case 'name_prob':
      return tEkyc('fields.fullName');
    case 'dob_prob':
      return tEkyc('fields.dateOfBirth');
    case 'home_prob':
      return tEkyc('fields.placeOfOrigin');
    case 'address_prob':
      return tEkyc('fields.address');
    case 'doe_prob':
      return tEkyc('fields.dateOfExpiry');
    default:
      return field;
  }
}

/**
 * Main validation function for eKYC results
 */
export function validateEkycResult(parsedResult: ParsedResult): ValidationResult {
  const validationResult: ValidationResult = {
    isValid: true,
    errors: [],
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

  try {
    // 1. Validate OCR data
    const ocrValidation = validateOcrData(parsedResult.ocrData);
    validationResult.details.ocrValid = ocrValidation.isValid;
    if (!ocrValidation.isValid) {
      validationResult.errors.push(...ocrValidation.errors);
      if (ocrValidation.warnings) {
        validationResult.warnings.push(...ocrValidation.warnings);
      }
    }

    // 2. Validate document authenticity (front and back card liveness)
    const docValidation = validateDocumentAuthenticity(
      parsedResult.frontCardLiveness,
      parsedResult.backCardLiveness
    );
    validationResult.details.documentAuthentic = docValidation.isValid;
    if (!docValidation.isValid) {
      validationResult.errors.push(...docValidation.errors);
    }

    // 3. Validate face matching
    const faceMatchValidation = validateFaceMatch(parsedResult.compareResult);
    validationResult.details.faceMatch = faceMatchValidation.isValid;
    if (!faceMatchValidation.isValid) {
      validationResult.errors.push(...faceMatchValidation.errors);
    }

    // 4. Validate person is real (face liveness)
    const livenessValidation = validateFaceLiveness(parsedResult.faceLiveness);
    validationResult.details.personReal = livenessValidation.isValid;
    if (!livenessValidation.isValid) {
      validationResult.errors.push(...livenessValidation.errors);
    }

    // 5. Validate no mask
    const maskValidation = validateMaskCheck(parsedResult.maskCheck);
    validationResult.details.noMask = maskValidation.isValid;
    if (!maskValidation.isValid) {
      validationResult.errors.push(...maskValidation.errors);
    }

    // 6. Validate overall data quality
    const qualityValidation = validateDataQuality(parsedResult);
    validationResult.details.dataQuality = qualityValidation.isValid;
    if (!qualityValidation.isValid && qualityValidation.warnings) {
      validationResult.warnings.push(...qualityValidation.warnings);
    }

    // Set overall validation status
    validationResult.isValid = validationResult.errors.length === 0;

  } catch (error) {
    validationResult.isValid = false;
    validationResult.errors.push(
      tEkyc('validationErrors.unexpected', { message: error instanceof Error ? error.message : 'Unknown error' })
    );
  }

  return validationResult;
}

/**
 * Validate OCR data quality and completeness
 */
function validateOcrData(ocrData: OcrData): ValidationCheck & { warnings: string[] } {
  const result: ValidationCheck & { warnings: string[] } = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!ocrData) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.ocrMissing'));
    return result;
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    const value = ocrData[field];
    if (!value || value.toString().trim() === '') {
      result.isValid = false;
      result.errors.push(
        tEkyc('validationErrors.requiredField', { field: fieldKeyToLabel(field) })
      );
    }
  }

  // Validate card type
  if (!VALID_CARD_TYPES.includes(ocrData.type as any)) {
    result.isValid = false;
    result.errors.push(
      tEkyc('validationErrors.invalidCardType', { type: ocrData.type })
    );
  }

  // Validate ID format (Vietnamese citizen ID)
  if (ocrData.id && !isValidVietnameseId(ocrData.id)) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.invalidIdFormat'));
  }

  // Validate dates
  if (ocrData.dob && !isValidDate(ocrData.dob)) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.invalidDobFormat'));
  }

  if (ocrData.doi && !isValidDate(ocrData.doi)) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.invalidDoiFormat'));
  }

  if (ocrData.doe && !isValidDate(ocrData.doe)) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.invalidDoeFormat'));
  }

  // Check if document is expired
  if (ocrData.doe && isExpired(ocrData.doe)) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.documentExpired'));
  }

  // Validate confidence scores
  const confidenceFields: (keyof Pick<OcrData, 'name_prob' | 'dob_prob' | 'home_prob' | 'address_prob' | 'doe_prob'>)[] = [
    'name_prob', 'dob_prob', 'home_prob', 'address_prob', 'doe_prob'
  ];

  for (const field of confidenceFields) {
    const confidence = parseFloat(ocrData[field].toString());
    if (confidence < VALIDATION_THRESHOLDS.OCR_CONFIDENCE_MIN) {
      result.warnings.push(
        tEkyc('validationWarnings.lowConfidenceForField', {
          field: confidenceKeyToLabel(field as ConfidenceKeys),
          confidence
        })
      );
    }
  }

  // Validate address entities
  if (ocrData.address_entities && ocrData.address_entities.length > 0) {
    const addressEntity = ocrData.address_entities[0];
    if (!addressEntity.city || !addressEntity.district || !addressEntity.ward) {
      result.warnings.push(tEkyc('validationWarnings.incompleteAddressInfo'));
    }
  }

  return result;
}

/**
 * Validate document authenticity (liveness check for ID cards)
 */
function validateDocumentAuthenticity(
  frontCardLiveness: CardLiveness,
  backCardLiveness: CardLiveness
): ValidationCheck {
  const result: ValidationCheck = { isValid: true, errors: [] };

  // Validate front card
  if (!frontCardLiveness || frontCardLiveness.statusCode !== 200) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.frontCardValidationFailed'));
    return result;
  }

  if (frontCardLiveness.object.liveness !== 'success') {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.frontCardLivenessFailed'));
  }

  if (frontCardLiveness.object.fake_liveness) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.frontCardFakeDetected'));
  }

  if (frontCardLiveness.object.fake_print_photo) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.frontCardPrintedPhoto'));
  }

  if (frontCardLiveness.object.face_swapping) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.frontCardFaceSwapDetected'));
  }

  // Check probability thresholds for front card
  if (frontCardLiveness.object.fake_liveness_prob > VALIDATION_THRESHOLDS.LIVENESS_PROB_MAX) {
    result.isValid = false;
    result.errors.push(
      tEkyc('validationErrors.frontCardHighFakeLivenessProb', { prob: frontCardLiveness.object.fake_liveness_prob })
    );
  }

  if (frontCardLiveness.object.face_swapping_prob > VALIDATION_THRESHOLDS.FACE_SWAP_PROB_MAX) {
    result.isValid = false;
    result.errors.push(
      tEkyc('validationErrors.frontCardHighFaceSwapProb', { prob: frontCardLiveness.object.face_swapping_prob })
    );
  }

  // Validate back card
  if (!backCardLiveness || backCardLiveness.statusCode !== 200) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.backCardValidationFailed'));
    return result;
  }

  if (backCardLiveness.object.liveness !== 'success') {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.backCardLivenessFailed'));
  }

  if (backCardLiveness.object.fake_liveness) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.backCardFakeDetected'));
  }

  return result;
}

/**
 * Validate face matching between ID photo and selfie
 */
function validateFaceMatch(compareResult: CompareResult): ValidationCheck {
  const result: ValidationCheck = { isValid: true, errors: [] };

  if (!compareResult || compareResult.statusCode !== 200) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.faceComparisonFailed'));
    return result;
  }

  if (compareResult.object.msg !== 'MATCH') {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.facesDoNotMatch'));
  }

  if (compareResult.object.prob < VALIDATION_THRESHOLDS.FACE_MATCH_MIN) {
    result.isValid = false;
    result.errors.push(
      tEkyc('validationErrors.faceMatchingLowConfidence', { prob: compareResult.object.prob })
    );
  }

  if (compareResult.object.multiple_faces) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.multipleFacesInImages'));
  }

  return result;
}

/**
 * Validate face liveness (real person check)
 */
function validateFaceLiveness(faceLiveness: FaceLiveness): ValidationCheck {
  const result: ValidationCheck = { isValid: true, errors: [] };

  if (!faceLiveness || faceLiveness.statusCode !== 200) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.faceLivenessFailed'));
    return result;
  }

  if (faceLiveness.object.liveness !== 'success') {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.livenessNotRealPerson'));
  }

  if (faceLiveness.object.is_eye_open !== 'yes') {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.eyesNotOpen'));
  }

  if (faceLiveness.object.blur_face !== 'no') {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.faceTooBlurry'));
  }

  // Validate age range
  const age = faceLiveness.object.age;
  if (age < VALIDATION_THRESHOLDS.MIN_AGE || age > VALIDATION_THRESHOLDS.MAX_AGE) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.ageOutOfRange', { age }));
  }

  if (faceLiveness.object.multiple_faces) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.multipleFacesInSelfie'));
  }

  return result;
}

/**
 * Validate mask detection
 */
function validateMaskCheck(maskCheck: MaskCheck): ValidationCheck {
  const result: ValidationCheck = { isValid: true, errors: [] };

  if (!maskCheck || maskCheck.statusCode !== 200) {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.maskDetectionFailed'));
    return result;
  }

  if (maskCheck.object.masked !== 'no') {
    result.isValid = false;
    result.errors.push(tEkyc('validationErrors.personWearingMask'));
  }

  return result;
}

/**
 * Validate overall data quality
 */
function validateDataQuality(parsedResult: ParsedResult): ValidationCheck & { warnings: string[] } {
  const result: ValidationCheck & { warnings: string[] } = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check if all image paths are present
  if (!parsedResult.imagePaths) {
    result.warnings.push(tEkyc('validationWarnings.imagePathsMissing'));
  } else {
    const requiredPaths: (keyof ImagePaths)[] = ['frontPath', 'backPath', 'faceFarPath', 'faceNearPath'];
    for (const path of requiredPaths) {
      if (!parsedResult.imagePaths[path]) {
        result.warnings.push(
          tEkyc('validationWarnings.missingImagePath', { path })
        );
      }
    }
  }

  // Check for consistency between gender in OCR and face detection
  if (parsedResult.ocrData?.sex && parsedResult.faceLiveness?.object?.gender) {
    if (parsedResult.ocrData.sex !== parsedResult.faceLiveness.object.gender) {
      result.warnings.push(tEkyc('validationWarnings.genderMismatch'));
    }
  }

  return result;
}

/**
 * Helper function to validate Vietnamese ID format
 */
function isValidVietnameseId(id: string): boolean {
  // Vietnamese citizen ID: 12 digits
  const idPattern = /^\d{12}$/;
  return idPattern.test(id);
}

/**
 * Helper function to validate date format (DD/MM/YYYY)
 */
function isValidDate(dateString: string): boolean {
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!datePattern.test(dateString)) return false;

  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
}

/**
 * Helper function to check if document is expired
 */
function isExpired(expiryDateString: string): boolean {
  if (!isValidDate(expiryDateString)) return true;

  const [day, month, year] = expiryDateString.split('/').map(Number);
  const expiryDate = new Date(year, month - 1, day);
  const today = new Date();

  return expiryDate < today;
}

/**
 * Get validation summary for display
 */
export function getValidationSummary(validationResult: ValidationResult): ValidationSummary {
  return {
    status: validationResult.isValid ? 'PASSED' : 'FAILED',
    totalErrors: validationResult.errors.length,
    totalWarnings: validationResult.warnings.length,
    checks: {
      [
        `✓ ${tEkyc('summaryChecks.ocrDataQuality')}`
      ]: validationResult.details.ocrValid,
      [
        `✓ ${tEkyc('summaryChecks.documentAuthentic')}`
      ]: validationResult.details.documentAuthentic,
      [
        `✓ ${tEkyc('summaryChecks.faceMatch')}`
      ]: validationResult.details.faceMatch,
      [
        `✓ ${tEkyc('summaryChecks.realPerson')}`
      ]: validationResult.details.personReal,
      [
        `✓ ${tEkyc('summaryChecks.noMask')}`
      ]: validationResult.details.noMask,
      [
        `✓ ${tEkyc('summaryChecks.dataQuality')}`
      ]: validationResult.details.dataQuality
    },
    errors: validationResult.errors,
    warnings: validationResult.warnings
  };
}
