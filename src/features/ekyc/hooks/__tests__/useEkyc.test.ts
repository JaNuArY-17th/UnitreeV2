/**
 * Tests for useEkyc hook
 * Tests for main eKYC hook functionality
 */

import { renderHook, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useEkyc } from '../useEkyc';
import ekycReducer from '../../store/ekycSlice';
import { EkycStep, EkycType } from '../../types/ekyc';

// Mock the ekycService
jest.mock('../../services/ekycService', () => ({
  ekycService: {
    isAvailable: jest.fn(() => true),
    startEkycOcr: jest.fn(),
    startEkycFull: jest.fn(),
    startEkycFace: jest.fn(),
  },
}));

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ekyc: ekycReducer,
    },
    preloadedState: {
      ekyc: {
        currentStep: EkycStep.IDLE,
        isProcessing: false,
        isInitialized: false,
        results: null,
        error: null,
        retryCount: 0,
        sessionId: null,
        startTime: null,
        endTime: null,
        ...initialState,
      },
    },
  });
};

// Create test wrapper
const createWrapper = (store: any, queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store },
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );
};

describe('useEkyc', () => {
  let store: any;
  let queryClient: QueryClient;

  beforeEach(() => {
    store = createTestStore();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should return initial state', () => {
    const wrapper = createWrapper(store, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    expect(result.current.currentStep).toBe(EkycStep.IDLE);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.results).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
    expect(result.current.canRetry).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should initialize eKYC', async () => {
    const wrapper = createWrapper(store, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    await act(async () => {
      await result.current.initializeEkyc();
    });

    const state = store.getState().ekyc;
    expect(state.isInitialized).toBe(true);
    expect(state.sessionId).toBeDefined();
  });

  it('should start capture successfully', async () => {
    const { ekycService } = require('../../services/ekycService');
    const mockResult = {
      ocrData: {
        id: '123456789',
        name: 'Test User',
        dob: '01/01/1990',
      },
    };

    ekycService.startEkycFull.mockResolvedValue(mockResult);

    const wrapper = createWrapper(store, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    // Initialize first
    await act(async () => {
      await result.current.initializeEkyc();
    });

    // Start capture
    await act(async () => {
      const captureResult = await result.current.startCapture(EkycType.FULL);
      expect(captureResult).toEqual(mockResult);
    });

    const state = store.getState().ekyc;
    expect(state.currentStep).toBe(EkycStep.COMPLETED);
    expect(state.results).toEqual(mockResult);
    expect(state.isProcessing).toBe(false);
  });

  it('should handle capture failure', async () => {
    const { ekycService } = require('../../services/ekycService');
    const mockError = new Error('Capture failed');
    ekycService.startEkycFull.mockRejectedValue(mockError);

    const wrapper = createWrapper(store, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    // Initialize first
    await act(async () => {
      await result.current.initializeEkyc();
    });

    // Start capture and expect failure
    await act(async () => {
      await expect(result.current.startCapture(EkycType.FULL)).rejects.toThrow('Capture failed');
    });

    const state = store.getState().ekyc;
    expect(state.currentStep).toBe(EkycStep.ERROR);
    expect(state.error).toBe('Capture failed');
    expect(state.retryCount).toBe(1);
  });

  it('should retry capture', async () => {
    const { ekycService } = require('../../services/ekycService');
    const mockResult = {
      ocrData: {
        id: '123456789',
        name: 'Test User',
        dob: '01/01/1990',
      },
    };

    // First call fails, second succeeds
    ekycService.startEkycFull
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(mockResult);

    const wrapper = createWrapper(store, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    // Initialize first
    await act(async () => {
      await result.current.initializeEkyc();
    });

    // First attempt fails
    await act(async () => {
      await expect(result.current.startCapture(EkycType.FULL)).rejects.toThrow();
    });

    expect(result.current.canRetry).toBe(true);

    // Retry succeeds
    await act(async () => {
      const retryResult = await result.current.retryCapture();
      expect(retryResult).toEqual(mockResult);
    });

    const state = store.getState().ekyc;
    expect(state.currentStep).toBe(EkycStep.COMPLETED);
    expect(state.results).toEqual(mockResult);
    expect(state.retryCount).toBe(0); // Reset on success
  });

  it('should reset eKYC state', async () => {
    const wrapper = createWrapper(store, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    // Initialize and set some state
    await act(async () => {
      await result.current.initializeEkyc();
    });

    // Reset
    act(() => {
      result.current.resetEkyc();
    });

    const state = store.getState().ekyc;
    expect(state.currentStep).toBe(EkycStep.IDLE);
    expect(state.isProcessing).toBe(false);
    expect(state.results).toBeNull();
    expect(state.error).toBeNull();
    expect(state.retryCount).toBe(0);
    // Session ID should be preserved
    expect(state.sessionId).toBeDefined();
  });

  it('should clear error', () => {
    const storeWithError = createTestStore({
      error: 'Test error',
      currentStep: EkycStep.ERROR,
    });

    const wrapper = createWrapper(storeWithError, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    const state = storeWithError.getState().ekyc;
    expect(state.error).toBeNull();
  });

  it('should check SDK availability', () => {
    const wrapper = createWrapper(store, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    expect(result.current.checkAvailability()).toBe(true);
  });

  it('should handle unavailable SDK', async () => {
    const { ekycService } = require('../../services/ekycService');
    ekycService.isAvailable.mockReturnValue(false);

    const wrapper = createWrapper(store, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    await act(async () => {
      await expect(result.current.startCapture(EkycType.FULL)).rejects.toThrow();
    });

    expect(result.current.checkAvailability()).toBe(false);
  });

  it('should provide summary data', () => {
    const storeWithData = createTestStore({
      currentStep: EkycStep.COMPLETED,
      isProcessing: false,
      results: {
        ocrData: {
          id: '123456789',
          name: 'Test User',
        },
      },
      startTime: Date.now() - 5000,
      endTime: Date.now(),
    });

    const wrapper = createWrapper(storeWithData, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    expect(result.current.summary).toBeDefined();
    expect(result.current.summary.currentStep).toBe(EkycStep.COMPLETED);
    expect(result.current.summary.isSuccess).toBe(true);
    expect(result.current.summary.processingDuration).toBeGreaterThan(0);
  });

  it('should provide navigation data', () => {
    const storeWithData = createTestStore({
      results: {
        ocrData: {
          id: '123456789',
          name: 'Test User',
          dob: '01/01/1990',
          sex: 'M',
          nationality: 'Việt Nam',
          address: 'Test Address',
        },
      },
    });

    const wrapper = createWrapper(storeWithData, queryClient);
    const { result } = renderHook(() => useEkyc(), { wrapper });

    expect(result.current.navigationData).toEqual({
      idNumber: '123456789',
      fullName: 'Test User',
      gender: 'M',
      dateOfBirth: '01/01/1990',
      nationality: 'Việt Nam',
      address: 'Test Address',
      ekycResult: expect.any(Object),
    });
  });
});
