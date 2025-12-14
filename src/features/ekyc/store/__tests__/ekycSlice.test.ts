/**
 * Tests for ekycSlice
 * Tests for Redux slice and async thunks
 */

import { configureStore } from '@reduxjs/toolkit';
import ekycReducer, {
  initializeEkycAsync,
  startEkycCaptureAsync,
  retryEkycCaptureAsync,
  resetEkyc,
  setCurrentStep,
  clearError,
  updateResults,
  setSessionId,
} from '../ekycSlice';
import { EkycStep, EkycType } from '../../types/ekyc';
import type { EkycState } from '../../types/ekyc';

// Mock the ekycService
const mockEkycService = {
  isAvailable: jest.fn(() => true),
  startEkycOcr: jest.fn(),
  startEkycFull: jest.fn(),
  startEkycFace: jest.fn(),
};

jest.mock('../../services/ekycService', () => ({
  ekycService: mockEkycService,
}));

const createTestStore = (initialState?: Partial<EkycState>) => {
  return configureStore({
    reducer: {
      ekyc: ekycReducer,
    },
    preloadedState: initialState ? { ekyc: initialState } : undefined,
  });
};

describe('ekycSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().ekyc;
      
      expect(state).toEqual({
        currentStep: EkycStep.IDLE,
        isProcessing: false,
        isInitialized: false,
        results: null,
        error: null,
        retryCount: 0,
        sessionId: null,
        startTime: null,
        endTime: null,
      });
    });
  });

  describe('Synchronous Actions', () => {
    it('should handle resetEkyc', () => {
      // Set some state first
      store.dispatch(setCurrentStep(EkycStep.PROCESSING));
      store.dispatch(setSessionId('test-session'));
      
      // Reset
      store.dispatch(resetEkyc());
      
      const state = store.getState().ekyc;
      expect(state.currentStep).toBe(EkycStep.IDLE);
      expect(state.isProcessing).toBe(false);
      expect(state.results).toBeNull();
      expect(state.error).toBeNull();
      expect(state.retryCount).toBe(0);
      // Session ID should be preserved
      expect(state.sessionId).toBe('test-session');
    });

    it('should handle setCurrentStep', () => {
      store.dispatch(setCurrentStep(EkycStep.CAPTURING));
      
      const state = store.getState().ekyc;
      expect(state.currentStep).toBe(EkycStep.CAPTURING);
    });

    it('should handle clearError', () => {
      // Set error first
      const storeWithError = createTestStore({
        error: 'Test error',
        currentStep: EkycStep.ERROR,
      });
      
      storeWithError.dispatch(clearError());
      
      const state = storeWithError.getState().ekyc;
      expect(state.error).toBeNull();
    });

    it('should handle updateResults', () => {
      const mockResults = {
        ocrData: {
          id: '123456789',
          name: 'Test User',
        },
      };
      
      store.dispatch(updateResults(mockResults));
      
      const state = store.getState().ekyc;
      expect(state.results).toEqual(mockResults);
    });

    it('should handle setSessionId', () => {
      const sessionId = 'test-session-123';
      
      store.dispatch(setSessionId(sessionId));
      
      const state = store.getState().ekyc;
      expect(state.sessionId).toBe(sessionId);
    });
  });

  describe('initializeEkycAsync', () => {
    it('should initialize successfully', async () => {
      const action = await store.dispatch(initializeEkycAsync());
      
      expect(action.type).toBe('ekyc/initialize/fulfilled');
      expect(action.payload).toEqual({
        sessionId: expect.any(String),
        timestamp: expect.any(Number),
      });
      
      const state = store.getState().ekyc;
      expect(state.isInitialized).toBe(true);
      expect(state.isProcessing).toBe(false);
      expect(state.currentStep).toBe(EkycStep.IDLE);
      expect(state.sessionId).toBeDefined();
      expect(state.startTime).toBeDefined();
    });

    it('should handle initialization failure when SDK not available', async () => {
      const { ekycService } = require('../../services/ekycService');
      ekycService.isAvailable.mockReturnValue(false);
      
      const action = await store.dispatch(initializeEkycAsync());
      
      expect(action.type).toBe('ekyc/initialize/rejected');
      expect(action.payload).toMatchObject({
        message: expect.stringContaining('SDK'),
        code: 'SDK_NOT_AVAILABLE',
        type: 'SDK',
      });
      
      const state = store.getState().ekyc;
      expect(state.isInitialized).toBe(false);
      expect(state.isProcessing).toBe(false);
      expect(state.currentStep).toBe(EkycStep.ERROR);
      expect(state.error).toContain('SDK');
    });
  });

  describe('startEkycCaptureAsync', () => {
    const mockResult = {
      ocrData: {
        id: '123456789',
        name: 'Test User',
        dob: '01/01/1990',
      },
    };

    it('should start OCR capture successfully', async () => {
      mockEkycService.startEkycOcr.mockResolvedValue(mockResult);

      const action = await store.dispatch(startEkycCaptureAsync({
        type: EkycType.OCR
      }));

      expect(action.type).toBe('ekyc/startCapture/fulfilled');
      expect(action.payload).toEqual({
        result: mockResult,
        type: EkycType.OCR,
        isRetake: false,
        timestamp: expect.any(Number),
      });

      const state = store.getState().ekyc;
      expect(state.currentStep).toBe(EkycStep.COMPLETED);
      expect(state.isProcessing).toBe(false);
      expect(state.results).toEqual(mockResult);
      expect(state.retryCount).toBe(0);
      expect(state.endTime).toBeDefined();
    });

    it('should start FULL capture successfully', async () => {
      mockEkycService.startEkycFull.mockResolvedValue(mockResult);

      const action = await store.dispatch(startEkycCaptureAsync({
        type: EkycType.FULL,
        isRetake: true,
      }));

      expect(action.type).toBe('ekyc/startCapture/fulfilled');
      expect(mockEkycService.startEkycFull).toHaveBeenCalled();
      expect(action.payload.isRetake).toBe(true);
    });

    it('should start FACE capture successfully', async () => {
      mockEkycService.startEkycFace.mockResolvedValue(mockResult);

      const action = await store.dispatch(startEkycCaptureAsync({
        type: EkycType.FACE
      }));

      expect(action.type).toBe('ekyc/startCapture/fulfilled');
      expect(mockEkycService.startEkycFace).toHaveBeenCalled();
    });

    it('should handle unsupported eKYC type', async () => {
      const action = await store.dispatch(startEkycCaptureAsync({ 
        type: 'unsupported' as EkycType 
      }));
      
      expect(action.type).toBe('ekyc/startCapture/rejected');
      expect(action.payload).toMatchObject({
        message: expect.stringContaining('Unsupported'),
        type: 'UNKNOWN',
      });
    });

    it('should handle SDK not available', async () => {
      mockEkycService.isAvailable.mockReturnValue(false);

      const action = await store.dispatch(startEkycCaptureAsync({
        type: EkycType.FULL
      }));

      expect(action.type).toBe('ekyc/startCapture/rejected');
      expect(action.payload).toMatchObject({
        code: 'SDK_NOT_AVAILABLE',
        type: 'SDK',
      });
    });

    it('should handle capture failure', async () => {
      const mockError = new Error('Capture failed');
      mockEkycService.startEkycFull.mockRejectedValue(mockError);

      const action = await store.dispatch(startEkycCaptureAsync({
        type: EkycType.FULL
      }));

      expect(action.type).toBe('ekyc/startCapture/rejected');
      expect(action.payload).toMatchObject({
        message: 'Capture failed',
        type: 'UNKNOWN',
      });

      const state = store.getState().ekyc;
      expect(state.currentStep).toBe(EkycStep.ERROR);
      expect(state.isProcessing).toBe(false);
      expect(state.error).toBe('Capture failed');
      expect(state.retryCount).toBe(1);
    });

    it('should handle timeout errors', async () => {
      const { ekycService } = require('../../services/ekycService');
      const timeoutError = new Error('Request timeout');
      ekycService.startEkycFull.mockRejectedValue(timeoutError);
      
      const action = await store.dispatch(startEkycCaptureAsync({ 
        type: EkycType.FULL 
      }));
      
      expect(action.type).toBe('ekyc/startCapture/rejected');
      expect(action.payload).toMatchObject({
        code: 'EKYC_TIMEOUT',
        type: 'TIMEOUT',
      });
    });

    it('should handle network errors', async () => {
      const { ekycService } = require('../../services/ekycService');
      const networkError = new Error('Network error');
      ekycService.startEkycFull.mockRejectedValue(networkError);
      
      const action = await store.dispatch(startEkycCaptureAsync({ 
        type: EkycType.FULL 
      }));
      
      expect(action.type).toBe('ekyc/startCapture/rejected');
      expect(action.payload).toMatchObject({
        code: 'NETWORK_ERROR',
        type: 'NETWORK',
      });
    });
  });

  describe('retryEkycCaptureAsync', () => {
    it('should retry successfully', async () => {
      const { ekycService } = require('../../services/ekycService');
      const mockResult = {
        ocrData: {
          id: '123456789',
          name: 'Test User',
        },
      };
      
      // Set initial state with retry count
      const storeWithRetry = createTestStore({
        retryCount: 1,
        error: 'Previous error',
        currentStep: EkycStep.ERROR,
      });
      
      // Mock successful retry
      ekycService.startEkycFull.mockResolvedValue(mockResult);
      
      const action = await storeWithRetry.dispatch(retryEkycCaptureAsync());
      
      expect(action.type).toBe('ekyc/retryCapture/fulfilled');
      
      // Should dispatch startEkycCaptureAsync internally
      const state = storeWithRetry.getState().ekyc;
      expect(state.isProcessing).toBe(false);
    });

    it('should reject when retry limit exceeded', async () => {
      const storeWithMaxRetries = createTestStore({
        retryCount: 3, // Max retries reached
        error: 'Previous error',
        currentStep: EkycStep.ERROR,
      });
      
      const action = await storeWithMaxRetries.dispatch(retryEkycCaptureAsync());
      
      expect(action.type).toBe('ekyc/retryCapture/rejected');
      expect(action.payload).toMatchObject({
        message: expect.stringContaining('vượt quá'),
        code: 'EKYC_TIMEOUT',
        type: 'VALIDATION',
      });
    });
  });

  describe('State Transitions', () => {
    it('should handle pending states correctly', () => {
      // Test pending state for initialization
      store.dispatch(initializeEkycAsync.pending('', undefined));
      
      let state = store.getState().ekyc;
      expect(state.isProcessing).toBe(true);
      expect(state.currentStep).toBe(EkycStep.INITIALIZING);
      expect(state.error).toBeNull();
      
      // Test pending state for capture
      store.dispatch(startEkycCaptureAsync.pending('', { type: EkycType.FULL }));
      
      state = store.getState().ekyc;
      expect(state.isProcessing).toBe(true);
      expect(state.currentStep).toBe(EkycStep.CAPTURING);
      expect(state.startTime).toBeDefined();
    });

    it('should preserve session ID during reset', () => {
      const sessionId = 'test-session-123';
      
      store.dispatch(setSessionId(sessionId));
      store.dispatch(setCurrentStep(EkycStep.PROCESSING));
      store.dispatch(resetEkyc());
      
      const state = store.getState().ekyc;
      expect(state.sessionId).toBe(sessionId);
      expect(state.currentStep).toBe(EkycStep.IDLE);
    });
  });
});
