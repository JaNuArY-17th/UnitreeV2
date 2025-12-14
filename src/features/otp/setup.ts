import { useAppDispatch } from '@/shared/hooks/useRedux';
import { otpServiceRegistry } from './services/otpService';
import { AuthOTPService } from './services/authOTPService';
import { MockOTPService } from './services/otpService';
import { EcontractOTPService } from '@/features/econtract/services/econtractOTPService';

/**
 * Initialize all OTP services and register them with the service registry
 * This should be called once during app initialization
 * @param dispatch - Redux dispatch function for services that need it
 */
export const initializeOTPServices = (dispatch?: any) => {
  // Initialize services
  const mockService = new MockOTPService();

  // Register econtract service if dispatch is available
  if (dispatch) {
    const econtractService = new EcontractOTPService(dispatch);
    otpServiceRegistry.registerService('econtract-signing', econtractService);
  } else {
    // Fallback to mock service if no dispatch
    otpServiceRegistry.registerService('econtract-signing', mockService);
  }

  // Register mock services for types without real APIs yet
  otpServiceRegistry.registerService('loan-application', mockService);
  otpServiceRegistry.registerService('loan-payment', mockService);
  otpServiceRegistry.registerService('bank-transfer', mockService);

  // Set mock as default for unregistered types
  otpServiceRegistry.registerDefaultService(mockService);
};

/**
 * Initialize authentication-specific OTP services
 * This should be called in components/hooks that need auth services
 */
export const useInitializeAuthOTPServices = () => {
  const dispatch = useAppDispatch();
  
  return () => {
    const authService = new AuthOTPService(dispatch);
    
    // Register authentication services
    otpServiceRegistry.registerService('register', authService);
    otpServiceRegistry.registerService('login-new-device', authService);
    otpServiceRegistry.registerService('forgot-password', authService);
    otpServiceRegistry.registerService('general', authService);
  };
};
