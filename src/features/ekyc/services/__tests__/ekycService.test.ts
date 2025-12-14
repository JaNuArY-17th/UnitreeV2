/**
 * Tests for ekycService
 * Tests for eKYC SDK integration and service methods
 */

import { ekycService } from '../ekycService';
import { authService } from '@/features/authentication/services/authService';
import { EKYC_CONSTANTS, EKYC_ERROR_CODES } from '../../utils/constants';
import type { ParsedEkycResult } from '../../types/ekyc';

// Mock dependencies
jest.mock('@/features/authentication/services/authService');
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  writeFile: jest.fn(),
  readFile: jest.fn(),
  exists: jest.fn(),
  unlink: jest.fn(),
}));
jest.mock('react-native', () => ({
  NativeModules: {
    EkycBridge: {
      startEkycOcr: jest.fn(),
      startEkycFull: jest.fn(),
      startEkycFace: jest.fn(),
    },
  },
  Platform: {
    OS: 'android',
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('EkycService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ekycService;
      const instance2 = ekycService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('isAvailable', () => {
    it('should return true on Android with EkycBridge', () => {
      expect(ekycService.isAvailable()).toBe(true);
    });

    it('should return true on iOS', () => {
      const { Platform } = require('react-native');
      Platform.OS = 'ios';
      expect(ekycService.isAvailable()).toBe(true);
    });
  });

  describe('startEkycOcr', () => {
    const mockToken = 'mock-ekyc-token';
    const mockResult: ParsedEkycResult = {
      ocrData: {
        id: '123456789',
        name: 'Test User',
        dob: '01/01/1990',
        sex: 'M',
        nationality: 'Việt Nam',
        address: 'Test Address',
      },
      ocrErrors: [],
    };

    beforeEach(() => {
      mockAuthService.getEkycToken.mockResolvedValue(mockToken);
    });

    it('should start OCR successfully', async () => {
      const { NativeModules } = require('react-native');
      NativeModules.EkycBridge.startEkycOcr.mockResolvedValue({
        LOG_OCR: JSON.stringify({ data: mockResult.ocrData }),
      });

      const result = await ekycService.startEkycOcr();

      expect(mockAuthService.getEkycToken).toHaveBeenCalled();
      expect(NativeModules.EkycBridge.startEkycOcr).toHaveBeenCalledWith(mockToken);
      expect(result).toBeDefined();
      expect(result.ocrData).toEqual(mockResult.ocrData);
    });

    it('should throw error when SDK not available', async () => {
      const { Platform } = require('react-native');
      Platform.OS = 'web'; // Unsupported platform

      await expect(ekycService.startEkycOcr()).rejects.toMatchObject({
        code: EKYC_ERROR_CODES.SDK_NOT_AVAILABLE,
        type: 'SDK',
      });
    });

    it('should throw error when token retrieval fails', async () => {
      mockAuthService.getEkycToken.mockRejectedValue(new Error('Token error'));

      await expect(ekycService.startEkycOcr()).rejects.toMatchObject({
        code: EKYC_ERROR_CODES.TOKEN_ERROR,
        type: 'NETWORK',
      });
    });

    it('should handle user cancellation', async () => {
      const { NativeModules } = require('react-native');
      const cancelError = new Error('User cancelled');
      (cancelError as any).code = 'USER_CANCELLED';
      NativeModules.EkycBridge.startEkycOcr.mockRejectedValue(cancelError);

      await expect(ekycService.startEkycOcr()).rejects.toMatchObject({
        code: EKYC_ERROR_CODES.USER_CANCELLED,
        type: 'VALIDATION',
      });
    });

    it('should handle timeout errors', async () => {
      const { NativeModules } = require('react-native');
      const timeoutError = new Error('Timeout occurred');
      NativeModules.EkycBridge.startEkycOcr.mockRejectedValue(timeoutError);

      await expect(ekycService.startEkycOcr()).rejects.toMatchObject({
        code: EKYC_ERROR_CODES.EKYC_TIMEOUT,
        type: 'TIMEOUT',
      });
    });
  });

  describe('startEkycFull', () => {
    const mockToken = 'mock-ekyc-token';
    const mockFullResult: ParsedEkycResult = {
      ocrData: {
        id: '123456789',
        name: 'Test User',
        dob: '01/01/1990',
        sex: 'M',
        nationality: 'Việt Nam',
        address: 'Test Address',
      },
      faceLiveness: {
        object: {
          liveness: 'live',
          liveness_prob: 95,
          age: 30,
          gender: 'male',
        },
      },
      compareResult: {
        object: {
          similarity: 95,
          matching: 'true',
        },
      },
      ocrErrors: [],
    };

    beforeEach(() => {
      mockAuthService.getEkycToken.mockResolvedValue(mockToken);
    });

    it('should start full eKYC successfully', async () => {
      const { NativeModules } = require('react-native');
      NativeModules.EkycBridge.startEkycFull.mockResolvedValue({
        LOG_OCR: JSON.stringify({ data: mockFullResult.ocrData }),
        LOG_LIVENESS_FACE: JSON.stringify(mockFullResult.faceLiveness),
        LOG_COMPARE: JSON.stringify(mockFullResult.compareResult),
      });

      const result = await ekycService.startEkycFull();

      expect(mockAuthService.getEkycToken).toHaveBeenCalled();
      expect(NativeModules.EkycBridge.startEkycFull).toHaveBeenCalledWith(
        mockToken,
        EKYC_CONSTANTS.EKYC_TIMEOUT
      );
      expect(result).toBeDefined();
      expect(result.ocrData).toEqual(mockFullResult.ocrData);
      expect(result.faceLiveness).toEqual(mockFullResult.faceLiveness);
      expect(result.compareResult).toEqual(mockFullResult.compareResult);
    });

    it('should handle malformed JSON responses', async () => {
      const { NativeModules } = require('react-native');
      NativeModules.EkycBridge.startEkycFull.mockResolvedValue({
        LOG_OCR: 'invalid json',
      });

      const result = await ekycService.startEkycFull();

      expect(result).toBeDefined();
      expect(result.ocrData).toBeUndefined();
    });
  });

  describe('startEkycFace', () => {
    const mockToken = 'mock-ekyc-token';

    beforeEach(() => {
      mockAuthService.getEkycToken.mockResolvedValue(mockToken);
    });

    it('should start face eKYC successfully', async () => {
      const { NativeModules } = require('react-native');
      const mockFaceResult = {
        faceLiveness: {
          object: {
            liveness: 'live',
            liveness_prob: 95,
          },
        },
      };

      NativeModules.EkycBridge.startEkycFace.mockResolvedValue({
        LOG_LIVENESS_FACE: JSON.stringify(mockFaceResult.faceLiveness),
      });

      const result = await ekycService.startEkycFace();

      expect(mockAuthService.getEkycToken).toHaveBeenCalled();
      expect(NativeModules.EkycBridge.startEkycFace).toHaveBeenCalledWith(mockToken);
      expect(result).toBeDefined();
      expect(result.faceLiveness).toEqual(mockFaceResult.faceLiveness);
    });
  });

  describe('validateEkycResult', () => {
    it('should validate result with OCR data', () => {
      const validResult: ParsedEkycResult = {
        ocrData: {
          id: '123456789',
          name: 'Test User',
          dob: '01/01/1990',
        },
      };

      expect(ekycService.validateEkycResult(validResult)).toBe(true);
    });

    it('should reject result without OCR data', () => {
      const invalidResult: ParsedEkycResult = {};

      expect(ekycService.validateEkycResult(invalidResult)).toBe(false);
    });

    it('should reject result with invalid OCR data', () => {
      const invalidResult: ParsedEkycResult = {
        ocrData: {
          id: 'XXXXXXXXX',
          name: 'XXXXXXXXX',
          dob: 'XX/XX/XXXX',
        },
      };

      expect(ekycService.validateEkycResult(invalidResult)).toBe(false);
    });
  });

  describe('validateFaceMatchResult', () => {
    it('should validate successful face match', () => {
      const result: ParsedEkycResult = {
        compareResult: {
          object: {
            similarity: 95,
            matching: 'true',
          },
        },
      };

      const validation = ekycService.validateFaceMatchResult(result);

      expect(validation.isValid).toBe(true);
      expect(validation.matchScore).toBe(95);
    });

    it('should reject low similarity score', () => {
      const result: ParsedEkycResult = {
        compareResult: {
          object: {
            similarity: 80, // Below threshold
            matching: 'true',
          },
        },
      };

      const validation = ekycService.validateFaceMatchResult(result);

      expect(validation.isValid).toBe(false);
      expect(validation.matchScore).toBe(80);
      expect(validation.errorMessage).toContain('80');
    });

    it('should reject no match result', () => {
      const result: ParsedEkycResult = {
        compareResult: {
          object: {
            similarity: 95,
            matching: 'false',
          },
        },
      };

      const validation = ekycService.validateFaceMatchResult(result);

      expect(validation.isValid).toBe(false);
    });

    it('should handle missing compare result', () => {
      const result: ParsedEkycResult = {};

      const validation = ekycService.validateFaceMatchResult(result);

      expect(validation.isValid).toBe(false);
      expect(validation.errorMessage).toContain('Không có dữ liệu so sánh');
    });
  });

  describe('Error Handling', () => {
    it('should create standardized error objects', () => {
      const error = (ekycService as any).createError(
        'Test message',
        'TEST_CODE',
        'VALIDATION',
        { detail: 'test' }
      );

      expect(error).toMatchObject({
        message: 'Test message',
        code: 'TEST_CODE',
        type: 'VALIDATION',
        details: { detail: 'test' },
        timestamp: expect.any(String),
      });
    });
  });
});
