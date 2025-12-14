// Biometric feature barrel exports

// Services
export { biometricService } from './services/biometricService';

// Hooks
export { useBiometric } from './hooks/useBiometric';

// Types
export type {
  BiometricStatusResponse,
  BiometricEnrollRequest,
  BiometricEnrollResponse,
  BiometricRemoveRequest,
  BiometricRemoveResponse,
  BiometricLoginRequest,
  BiometricLoginResponse,
  BiometricKeys,
  BiometricPromptConfig,
} from './types/biometric';

// Store
export {
  checkBiometricStatus,
  enrollBiometric,
  removeBiometric,
  loginWithBiometric,
  resetErrors,
  clearBiometricState,
} from './store/biometricSlice';
export type { BiometricState } from './store/biometricSlice';