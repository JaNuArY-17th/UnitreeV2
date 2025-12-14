import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ekycService } from '../services/ekycService';
import type {
  EkycState,
  ParsedEkycResult,
  EkycError
} from '../types/ekyc';
import {
  EkycType,
  EkycStep
} from '../types/ekyc';
import { EKYC_CONSTANTS, EKYC_ERROR_CODES, EKYC_MESSAGES } from '../utils/constants';

// Initial state
const initialState: EkycState = {
  currentStep: EkycStep.IDLE,
  isProcessing: false,
  isInitialized: false,
  results: null,
  error: null,
  retryCount: 0,
  sessionId: null,
  startTime: null,
  endTime: null,
};

// Helper function to generate session ID
const generateSessionId = (): string => {
  return `ekyc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// Helper function to get error message
const getErrorMessage = (error: any, defaultMessage: string = EKYC_MESSAGES.GENERAL_ERROR): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.userMessage) return error.userMessage;
  return defaultMessage;
};

// Async thunks
export const initializeEkycAsync = createAsyncThunk(
  'ekyc/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Check if SDK is available
      if (!ekycService.isAvailable()) {
        return rejectWithValue({
          message: EKYC_MESSAGES.SDK_ERROR,
          code: EKYC_ERROR_CODES.SDK_NOT_AVAILABLE,
          type: 'SDK' as const,
        });
      }

      // Generate session ID
      const sessionId = generateSessionId();

      return {
        sessionId,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, EKYC_MESSAGES.SDK_ERROR),
        code: EKYC_ERROR_CODES.SDK_INITIALIZATION_FAILED,
        type: 'SDK' as const,
      });
    }
  }
);

export const startEkycCaptureAsync = createAsyncThunk(
  'ekyc/startCapture',
  async (request: { type: EkycType; isRetake?: boolean }, { rejectWithValue, getState: _getState }) => {
    try {
      const { type, isRetake = false } = request;

      // Check if SDK is available
      if (!ekycService.isAvailable()) {
        return rejectWithValue({
          message: EKYC_MESSAGES.SDK_ERROR,
          code: EKYC_ERROR_CODES.SDK_NOT_AVAILABLE,
          type: 'SDK' as const,
        });
      }

      let result: ParsedEkycResult;

      // Call appropriate service method based on type
      switch (type) {
        case EkycType.OCR:
          result = await ekycService.startEkycOcr();
          break;
        case EkycType.FACE:
          result = await ekycService.startEkycFace();
          break;
        case EkycType.FULL:
          result = await ekycService.startEkycFull();
          break;
        default:
          throw new Error(`Unsupported eKYC type: ${type}`);
      }

      // Validate result
      if (!result) {
        throw new Error('No result returned from eKYC service');
      }

      return {
        result,
        type,
        isRetake,
        timestamp: Date.now(),
      };
    } catch (error: any) {

      // Handle specific error types
      let errorCode: string = EKYC_ERROR_CODES.EKYC_TIMEOUT;
      let errorType: EkycError['type'] = 'UNKNOWN';

      if (error.message?.includes('timeout')) {
        errorCode = EKYC_ERROR_CODES.EKYC_TIMEOUT;
        errorType = 'TIMEOUT';
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorCode = EKYC_ERROR_CODES.NETWORK_ERROR;
        errorType = 'NETWORK';
      } else if (error.message?.includes('SDK') || error.message?.includes('not available')) {
        errorCode = EKYC_ERROR_CODES.SDK_NOT_AVAILABLE;
        errorType = 'SDK';
      }

      return rejectWithValue({
        message: getErrorMessage(error, EKYC_MESSAGES.GENERAL_ERROR),
        code: errorCode,
        type: errorType,
        details: error,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export const retryEkycCaptureAsync = createAsyncThunk(
  'ekyc/retryCapture',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { ekyc: EkycState };
      const { retryCount } = state.ekyc;

      // Check retry limit
      if (retryCount >= EKYC_CONSTANTS.MAX_RETRY_COUNT) {
        return rejectWithValue({
          message: 'Đã vượt quá số lần thử lại cho phép',
          code: EKYC_ERROR_CODES.EKYC_TIMEOUT,
          type: 'VALIDATION' as const,
        });
      }

      // Add delay before retry
      await new Promise(resolve => setTimeout(resolve, EKYC_CONSTANTS.RETRY_DELAY));

      // Retry with FULL type by default
      return dispatch(startEkycCaptureAsync({ type: EkycType.FULL, isRetake: true })).unwrap();
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Retry failed'),
        code: EKYC_ERROR_CODES.EKYC_TIMEOUT,
        type: 'UNKNOWN' as const,
      });
    }
  }
);

// Slice
const ekycSlice = createSlice({
  name: 'ekyc',
  initialState,
  reducers: {
    // Reset eKYC state
    resetEkyc: (state) => {
      return {
        ...initialState,
        sessionId: state.sessionId, // Keep session ID
      };
    },

    // Set current step
    setCurrentStep: (state, action: PayloadAction<EkycStep>) => {
      state.currentStep = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update results
    updateResults: (state, action: PayloadAction<Partial<ParsedEkycResult>>) => {
      if (state.results) {
        state.results = { ...state.results, ...action.payload };
      } else {
        state.results = action.payload as ParsedEkycResult;
      }
    },

    // Set session ID
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Initialize eKYC
    builder
      .addCase(initializeEkycAsync.pending, (state) => {
        state.isProcessing = true;
        state.currentStep = EkycStep.INITIALIZING;
        state.error = null;
      })
      .addCase(initializeEkycAsync.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.isInitialized = true;
        state.currentStep = EkycStep.IDLE;
        state.sessionId = action.payload.sessionId;
        state.startTime = action.payload.timestamp;
      })
      .addCase(initializeEkycAsync.rejected, (state, action) => {
        state.isProcessing = false;
        state.isInitialized = false;
        state.currentStep = EkycStep.ERROR;
        state.error = (action.payload as any)?.message || EKYC_MESSAGES.SDK_ERROR;
      });

    // Start eKYC capture
    builder
      .addCase(startEkycCaptureAsync.pending, (state) => {
        state.isProcessing = true;
        state.currentStep = EkycStep.CAPTURING;
        state.error = null;
        if (!state.startTime) {
          state.startTime = Date.now();
        }
      })
      .addCase(startEkycCaptureAsync.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentStep = EkycStep.COMPLETED;
        state.results = action.payload.result;
        state.endTime = action.payload.timestamp;
        state.retryCount = 0; // Reset retry count on success
      })
      .addCase(startEkycCaptureAsync.rejected, (state, action) => {
        state.isProcessing = false;
        state.currentStep = EkycStep.ERROR;
        state.error = (action.payload as any)?.message || EKYC_MESSAGES.GENERAL_ERROR;
        state.retryCount += 1;
      });

    // Retry eKYC capture
    builder
      .addCase(retryEkycCaptureAsync.pending, (state) => {
        state.isProcessing = true;
        state.currentStep = EkycStep.CAPTURING;
        state.error = null;
      })
      .addCase(retryEkycCaptureAsync.fulfilled, (_state, _action) => {
        // This will be handled by startEkycCaptureAsync.fulfilled
      })
      .addCase(retryEkycCaptureAsync.rejected, (state, action) => {
        state.isProcessing = false;
        state.currentStep = EkycStep.ERROR;
        state.error = (action.payload as any)?.message || 'Retry failed';
      });
  },
});

// Export actions
export const {
  resetEkyc,
  setCurrentStep,
  clearError,
  updateResults,
  setSessionId
} = ekycSlice.actions;

// Export reducer
export default ekycSlice.reducer;
