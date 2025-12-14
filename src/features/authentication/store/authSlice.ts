import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import type { AuthState, LoginRequest, OTPVerificationRequest, AuthError } from '../types/auth';
import type { User } from '../types/auth';
import { isOTPRequired, getErrorMessage } from '../utils/authUtils';
import { updateColorsForAccountType } from '@/shared/themes/colors';

// Persist configuration for auth slice
export const authPersistConfig = {
  key: 'auth',
  storage: {
    getItem: async (key: string): Promise<string | null> => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.warn(`redux-persist storage getItem error for key "${key}":`, error);
        return null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.warn(`redux-persist storage setItem error for key "${key}":`, error);
        throw error;
      }
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.warn(`redux-persist storage removeItem error for key "${key}":`, error);
        throw error;
      }
    },
  },
  // Only persist essential auth data, not loading states
  whitelist: ['user', 'accessToken', 'refreshToken', 'isAuthenticated'],
  blacklist: ['isLoading', 'error'],
  // Timeout for storage operations
  timeout: 10000,
};

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      if (!response.success) {
        // Don't use confusing success messages for failures
        const isSuccessMessage = response.message?.toLowerCase().includes('successful');
        const errorMessage = isSuccessMessage ? 'Login failed' : (response.message || 'Login failed');
        return rejectWithValue({
          message: errorMessage,
        });
      }

      // Handle OTP cases - API returns success but requires verification
      // Check response.data for OTP requirement, not the root response
      if (isOTPRequired(response.data)) {
        return {
          ...response.data,
          code: response.code,
          message: response.message,
          is_new_device: response.data?.is_new_device || true,
          is_verified: response.data?.is_verified || false,
        };
      }

      return response.data || {};
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Login failed'),
        errors: error.errors,
      });
    }
  }
);

export const verifyOTPAsync = createAsyncThunk(
  'auth/verifyOTP',
  async (request: OTPVerificationRequest, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP(request);

      if (!response.success || !response.data) {
        return rejectWithValue({
          message: response.message || 'OTP verification failed',
        });
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'OTP verification failed',
        errors: error.errors,
      });
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;

      await authService.logout(refreshToken ? { refresh_token: refreshToken } : undefined);
      return;
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Logout failed',
      });
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();

      if (!response.success || !response.data) {
        return rejectWithValue({
          message: response.message || 'Failed to get user profile',
        });
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to get user profile',
      });
    }
  }
);

export const initializeAuthAsync = createAsyncThunk(
  'auth/initialize',
  async () => {
    try {
      const isAuthenticated = authService.isAuthenticated();

      if (isAuthenticated) {
        // Try to get current user to validate token
        const response = await authService.getCurrentUser();

        if (response.success && response.data) {
          const accessToken = await authService.getAccessToken();
          return {
            user: response.data,
            accessToken,
            isAuthenticated: true,
          };
        }
      }

      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
      };
    } catch (error: any) {
      // Token might be expired, clear it
      await authService.logout();
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
      };
    }
  }
);

// Register OTP verification
export const verifyOTPRegisterAsync = createAsyncThunk(
  'auth/verifyOTPRegister',
  async (request: { phone_number: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTPRegister(request);

      if (!response.success || !response.data) {
        return rejectWithValue({
          message: response.message || 'Register OTP verification failed',
        });
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Register OTP verification failed'),
        errors: error.errors,
      });
    }
  }
);

// Resend OTP for register
export const resendOTPRegisterAsync = createAsyncThunk(
  'auth/resendOTPRegister',
  async (request: { phone_number: string }, { rejectWithValue }) => {
    try {
      const response = await authService.resendOTPRegister(request);

      if (!response.success || !response.data) {
        return rejectWithValue({
          message: response.message || 'Failed to resend register OTP',
        });
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Failed to resend register OTP'),
        errors: error.errors,
      });
    }
  }
);

// Login new device OTP verification
export const verifyLoginNewDeviceAsync = createAsyncThunk(
  'auth/verifyLoginNewDevice',
  async (request: { phone_number: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyLoginNewDevice(request);

      if (!response.success || !response.data) {
        return rejectWithValue({
          message: response.message || 'Login new device OTP verification failed',
        });
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Login new device OTP verification failed'),
        errors: error.errors,
      });
    }
  }
);

// Resend OTP for login new device
export const resendOTPLoginNewDeviceAsync = createAsyncThunk(
  'auth/resendOTPLoginNewDevice',
  async (request: { phone_number: string }, { rejectWithValue }) => {
    try {
      const response = await authService.resendOTPLoginNewDevice(request);

      if (!response.success || !response.data) {
        return rejectWithValue({
          message: response.message || 'Failed to resend login new device OTP',
        });
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Failed to resend login new device OTP'),
        errors: error.errors,
      });
    }
  }
);

// Forgot password
export const forgotPasswordAsync = createAsyncThunk(
  'auth/forgotPassword',
  async (request: { phone_number: string }, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(request);

      if (!response.success || !response.data) {
        return rejectWithValue({
          message: response.message || 'Failed to send forgot password OTP',
        });
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Failed to send forgot password OTP'),
        errors: error.errors,
      });
    }
  }
);

// Verify OTP for forgot password
export const verifyOTPForgotPasswordAsync = createAsyncThunk(
  'auth/verifyOTPForgotPassword',
  async (request: { phone_number: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTPForgotPassword(request);

      if (!response.success || !response.data) {
        return rejectWithValue({
          message: response.message || 'Forgot password OTP verification failed',
        });
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Forgot password OTP verification failed'),
        errors: error.errors,
      });
    }
  }
);

// Reset password
export const resetPasswordAsync = createAsyncThunk(
  'auth/resetPassword',
  async (request: { phone_number: string; reset_token: string; new_password: string; confirm_password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(request);

      if (!response.success || !response.data) {
        return rejectWithValue({
          message: response.message || 'Password reset failed',
        });
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Password reset failed'),
        errors: error.errors,
      });
    }
  }
);

// Resend OTP for forgot password
export const resendOTPForgotPasswordAsync = createAsyncThunk(
  'auth/resendOTPForgotPassword',
  async (request: { phone_number: string }, { rejectWithValue }) => {
    try {
      const response = await authService.resendOTPForgotPassword(request);

      if (!response.success || !response.data) {
        return rejectWithValue({
          message: response.message || 'Failed to resend forgot password OTP',
        });
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Failed to resend forgot password OTP'),
        errors: error.errors,
      });
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // ✅ NEW: Synchronization actions for AuthGuard state
    setAuthenticationState: (state, action: PayloadAction<{
      isAuthenticated: boolean;
      isLoading?: boolean;
    }>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      if (action.payload.isLoading !== undefined) {
        state.isLoading = action.payload.isLoading;
      }
    },
    setLoadingState: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Simulate access token expiry (keeps refreshToken so refresh flow can be tested)
    expireAccessToken: (state) => {
      state.accessToken = null;
      // Optionally mark unauthenticated; keep true if you want guarded screens to attempt silent refresh
      // state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;

        const tokenData: any = (action as any).payload?.data || (action as any).payload;

        // Only set authenticated if we have tokens AND no OTP is required
        if (action.payload && tokenData?.access_token && !isOTPRequired(tokenData)) {
          state.isAuthenticated = true;
          state.user = tokenData.user || null;
          state.accessToken = tokenData.access_token;
          state.refreshToken = tokenData.refresh_token || null;
        }
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        // Ensure we don't show confusing success messages for failures
        const errorMessage = (action.payload as AuthError)?.message || 'Login failed';
        const isSuccessMessage = errorMessage.toLowerCase().includes('successful');
        state.error = isSuccessMessage ? 'Login failed' : errorMessage;
      });

    // OTP Verification
    builder
      .addCase(verifyOTPAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTPAsync.fulfilled, (state) => {
        state.isLoading = false;
        // Note: General OTP verification does not return tokens
        // User needs to login again to get authenticated
        state.error = null;
      })
      .addCase(verifyOTPAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as AuthError)?.message || 'OTP verification failed';
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        // Reset colors to default (STORE) on logout
        updateColorsForAccountType('STORE');
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.isLoading = false;
        // Even if logout fails, clear the state
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = (action.payload as AuthError)?.message || 'Logout failed';
      });

    // Get current user
    builder
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as AuthError)?.message || 'Failed to get user profile';
      });

    // Initialize auth
    builder
      .addCase(initializeAuthAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuthAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(initializeAuthAsync.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      });

    // Register OTP verification
    builder
      .addCase(verifyOTPRegisterAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTPRegisterAsync.fulfilled, (state) => {
        state.isLoading = false;
        // Note: Register OTP verification does not return tokens
        // User needs to login again to get authenticated
        state.error = null;
      })
      .addCase(verifyOTPRegisterAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as AuthError)?.message || 'Register OTP verification failed';
      });

    // Resend OTP for register
    builder
      .addCase(resendOTPRegisterAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTPRegisterAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendOTPRegisterAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as AuthError)?.message || 'Failed to resend register OTP';
      });

    // Login new device OTP verification
    builder
      .addCase(verifyLoginNewDeviceAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyLoginNewDeviceAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // Login new device OTP verification returns tokens and user data
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user || null;
          state.accessToken = action.payload.access_token || null;
          state.refreshToken = action.payload.refresh_token || null;
        }
        state.error = null;
      })
      .addCase(verifyLoginNewDeviceAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as AuthError)?.message || 'Login new device OTP verification failed';
      });

    // Resend OTP for login new device
    builder
      .addCase(resendOTPLoginNewDeviceAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTPLoginNewDeviceAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendOTPLoginNewDeviceAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as AuthError)?.message || 'Failed to resend login new device OTP';
      });

    // Forgot password
    builder
      .addCase(forgotPasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as AuthError)?.message || 'Failed to send forgot password OTP';
      });

    // Verify OTP for forgot password
    builder
      .addCase(verifyOTPForgotPasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTPForgotPasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyOTPForgotPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as AuthError)?.message || 'Forgot password OTP verification failed';
      });

    // Reset password
    builder
      .addCase(resetPasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(resetPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as AuthError)?.message || 'Password reset failed';
      });

    // Resend OTP for forgot password
    builder
      .addCase(resendOTPForgotPasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTPForgotPasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendOTPForgotPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as AuthError)?.message || 'Failed to resend forgot password OTP';
      });
  },
});

// Export actions
export const {
  clearError,
  setUser,
  updateUser,
  setAuthenticationState,
  setLoadingState
  , expireAccessToken
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
