import type { OTPType, BaseOTPVerificationRequest, BaseOTPVerificationResponse, BaseOTPResendRequest, BaseOTPResendResponse } from '../types';

// Abstract OTP service interface
export interface IOTPService {
  verify(type: OTPType, request: BaseOTPVerificationRequest, context?: any): Promise<BaseOTPVerificationResponse>;
  resend(type: OTPType, request: BaseOTPResendRequest, context?: any): Promise<BaseOTPResendResponse>;
}

// OTP service registry for different types
export class OTPServiceRegistry {
  private services: Map<OTPType, IOTPService> = new Map();
  private defaultService?: IOTPService;

  registerService(type: OTPType, service: IOTPService): void {
    this.services.set(type, service);
  }

  registerDefaultService(service: IOTPService): void {
    this.defaultService = service;
  }

  getService(type: OTPType): IOTPService | undefined {
    return this.services.get(type) || this.defaultService;
  }

  async verify(type: OTPType, request: BaseOTPVerificationRequest, context?: any): Promise<BaseOTPVerificationResponse> {
    const service = this.getService(type);
    if (!service) {
      throw new Error(`No OTP service registered for type: ${type}`);
    }
    return service.verify(type, request, context);
  }

  async resend(type: OTPType, request: BaseOTPResendRequest, context?: any): Promise<BaseOTPResendResponse> {
    const service = this.getService(type);
    if (!service) {
      throw new Error(`No OTP service registered for type: ${type}`);
    }
    return service.resend(type, request, context);
  }
}

// Global OTP service registry
export const otpServiceRegistry = new OTPServiceRegistry();

// Mock OTP service for types that don't have real APIs yet
export class MockOTPService implements IOTPService {
  async verify(type: OTPType, request: BaseOTPVerificationRequest, context?: any): Promise<BaseOTPVerificationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `${type} OTP verified successfully`,
          data: {
            verified: true,
            timestamp: new Date().toISOString(),
            type,
            ...context,
          },
        });
      }, 1500); // Simulate API delay
    });
  }

  async resend(type: OTPType, request: BaseOTPResendRequest, context?: any): Promise<BaseOTPResendResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `${type} OTP resent successfully`,
          otp_sent: true,
          phone_number: request.phone_number,
        });
      }, 1000); // Simulate API delay
    });
  }
}

// Helper function to initialize default services
export const initializeOTPServices = () => {
  const mockService = new MockOTPService();
  
  // Register mock service for types without real APIs
  otpServiceRegistry.registerService('trading', mockService);
  otpServiceRegistry.registerService('econtract-signing', mockService);
  otpServiceRegistry.registerService('loan-application', mockService);
  otpServiceRegistry.registerService('loan-payment', mockService);
  otpServiceRegistry.registerService('bank-transfer', mockService);
  
  // Set mock as default for unregistered types
  otpServiceRegistry.registerDefaultService(mockService);
};
