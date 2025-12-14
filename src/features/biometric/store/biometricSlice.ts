import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { biometricService } from '../services/biometricService';
import { storeBiometricStatus, updateBiometricStatus, removeBiometricStatus } from '@/shared/utils/biometricStorage';
import { tokenManager } from '@/shared/utils/tokenManager';
import type {
  BiometricStatusResponse,
  BiometricEnrollRequest,
  BiometricEnrollResponse,
  BiometricRemoveRequest,
  BiometricRemoveResponse,
  BiometricLoginRequest,
  BiometricLoginResponse,
} from '../types/biometric';

export interface BiometricState {
  // Device biometric status
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricType?: 'TouchID' | 'FaceID' | 'Biometric' | 'Fingerprint';

  // API status
  isEnrolledOnServer: boolean;

  // Loading states
  checkingStatus: boolean;
  enrolling: boolean;
  removing: boolean;
  loggingIn: boolean;

  // Error states
  checkError: string | null;
  enrollError: string | null;
  removeError: string | null;
  loginError: string | null;
}

const initialState: BiometricState = {
  isAvailable: false,
  isEnrolled: false,
  isEnrolledOnServer: false,
  checkingStatus: false,
  enrolling: false,
  removing: false,
  loggingIn: false,
  checkError: null,
  enrollError: null,
  removeError: null,
  loginError: null,
};

// Async thunks
export const checkBiometricStatus = createAsyncThunk(
  'biometric/checkStatus',
  async (userId?: string) => {
    // Always check device status
    const deviceStatus = await biometricService.checkBiometricStatus();

    // Only check server status if user is authenticated
    const hasValidToken = await tokenManager.getToken();
    let serverStatus = {
      is_enrolled: false,
    };

    if (hasValidToken) {
      try {
        serverStatus = await biometricService.checkBiometricStatusAPI();

        // Store the biometric status for this user if userId is provided
        if (userId && serverStatus.is_enrolled) {
          await storeBiometricStatus(userId, {
            isEnrolled: serverStatus.is_enrolled,
            biometricType: deviceStatus.biometric_type,
          });
        }
      } catch (error) {
        // If API call fails (e.g., 401), just use device status
        console.log('⚠️ Could not check server biometric status, using device status only');
      }
    }

    return {
      device: deviceStatus,
      server: serverStatus,
    };
  }
);

export const enrollBiometric = createAsyncThunk(
  'biometric/enroll',
  async ({ data, userId }: { data: BiometricEnrollRequest; userId: string }) => {
    // First generate keys on device
    const keys = await biometricService.generateBiometricKeys();
    if (!keys) {
      throw new Error('Failed to generate biometric keys');
    }

    // Then enroll on server with the public key
    const enrollData = {
      ...data,
      biometric_key: keys.publicKey,
    };

    const result = await biometricService.enrollBiometric(enrollData);

    // Store the biometric status for this user if enrollment successful
    if (result.success) {
      const deviceStatus = await biometricService.checkBiometricStatus();
      await storeBiometricStatus(userId, {
        isEnrolled: true,
        biometricType: deviceStatus.biometric_type,
      });
    }

    return result;
  }
);

export const removeBiometric = createAsyncThunk(
  'biometric/remove',
  async ({ data, userId }: { data: BiometricRemoveRequest; userId: string }) => {
    const result = await biometricService.removeBiometric(data);

    // If server removal successful, also delete local keys and clear stored status
    if (result.success) {
      await biometricService.deleteBiometricKeys();
      await removeBiometricStatus(userId);
    }

    return result;
  }
);

export const loginWithBiometric = createAsyncThunk(
  'biometric/login',
  async (data: BiometricLoginRequest) => {
    return await biometricService.loginWithBiometric(data);
  }
);

const biometricSlice = createSlice({
  name: 'biometric',
  initialState,
  reducers: {
    resetErrors: (state) => {
      state.checkError = null;
      state.enrollError = null;
      state.removeError = null;
      state.loginError = null;
    },
    clearBiometricState: (state) => {
      state.isAvailable = false;
      state.isEnrolled = false;
      state.isEnrolledOnServer = false;
      state.biometricType = undefined;
    },
  },
  extraReducers: (builder) => {
    // Check status
    builder
      .addCase(checkBiometricStatus.pending, (state) => {
        state.checkingStatus = true;
        state.checkError = null;
      })
      .addCase(checkBiometricStatus.fulfilled, (state, action) => {
        state.checkingStatus = false;
        state.isAvailable = action.payload.device.is_available;
        state.isEnrolled = action.payload.device.is_enrolled;
        state.biometricType = action.payload.device.biometric_type;
        state.isEnrolledOnServer = action.payload.server.is_enrolled;
      })
      .addCase(checkBiometricStatus.rejected, (state, action) => {
        state.checkingStatus = false;
        state.checkError = action.error.message || 'Failed to check biometric status';
      });

    // Enroll
    builder
      .addCase(enrollBiometric.pending, (state) => {
        state.enrolling = true;
        state.enrollError = null;
      })
      .addCase(enrollBiometric.fulfilled, (state, action) => {
        state.enrolling = false;
        if (action.payload.success) {
          state.isEnrolled = true;
          state.isEnrolledOnServer = true;
        }
      })
      .addCase(enrollBiometric.rejected, (state, action) => {
        state.enrolling = false;
        state.enrollError = action.error.message || 'Failed to enroll biometric';
      });

    // Remove
    builder
      .addCase(removeBiometric.pending, (state) => {
        state.removing = true;
        state.removeError = null;
      })
      .addCase(removeBiometric.fulfilled, (state, action) => {
        state.removing = false;
        if (action.payload.success) {
          state.isEnrolled = false;
          state.isEnrolledOnServer = false;
        }
      })
      .addCase(removeBiometric.rejected, (state, action) => {
        state.removing = false;
        state.removeError = action.error.message || 'Failed to remove biometric';
      });

    // Login
    builder
      .addCase(loginWithBiometric.pending, (state) => {
        state.loggingIn = true;
        state.loginError = null;
      })
      .addCase(loginWithBiometric.fulfilled, (state) => {
        state.loggingIn = false;
      })
      .addCase(loginWithBiometric.rejected, (state, action) => {
        state.loggingIn = false;
        state.loginError = action.error.message || 'Biometric login failed';
      });
  },
});

export const { resetErrors, clearBiometricState } = biometricSlice.actions;
export default biometricSlice.reducer;
