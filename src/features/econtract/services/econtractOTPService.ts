import type { 
  IOTPService, 
  BaseOTPVerificationRequest, 
  BaseOTPVerificationResponse, 
  BaseOTPResendRequest, 
  BaseOTPResendResponse 
} from '@/features/otp/services/otpService';
import type { OTPType, OTPContextData } from '@/features/otp/types';
import { useAppDispatch } from '@/shared/hooks/useRedux';
import { 
  signContract as signContractAction,
  requestOtp as requestOtpAction,
  resendOtp as resendOtpAction
} from '../store/econtractSlice';

/**
 * OTP service for econtract signing
 * Integrates with the econtract Redux store
 */
export class EcontractOTPService implements IOTPService {
  constructor(
    private dispatch: ReturnType<typeof useAppDispatch>
  ) {}

  async verify(
    type: OTPType, 
    request: BaseOTPVerificationRequest,
    context?: OTPContextData
  ): Promise<BaseOTPVerificationResponse> {
    if (type !== 'econtract-signing') {
      throw new Error(`Unsupported OTP type for econtract service: ${type}`);
    }

    // Get signature from context
    const signatureBase64 = context?.signatureBase64;
    if (!signatureBase64) {
      throw new Error('Signature is required for contract signing');
    }

    try {
      const result = await this.dispatch(signContractAction({
        otp: request.otp,
        sign_base64: signatureBase64
      }));

      if (signContractAction.fulfilled.match(result)) {
        const contractData = result.payload.data;
        
        // Return success with contract signing result
        return {
          success: true,
          message: 'Contract signed successfully',
          data: {
            success: true,
            pdfUrl: contractData?.signed_file?.file_url || null,
            contractData
          }
        };
      } else {
        throw new Error(result.payload as string || 'Contract signing failed');
      }
    } catch (error: any) {
      console.error('Error signing contract with OTP:', error);
      throw new Error(error.message || 'Contract signing verification failed');
    }
  }

  async resend(
    type: OTPType, 
    request: BaseOTPResendRequest,
    context?: OTPContextData
  ): Promise<BaseOTPResendResponse> {
    if (type !== 'econtract-signing') {
      throw new Error(`Unsupported OTP type for econtract service: ${type}`);
    }

    try {
      // Try requestOtp first (new API), fallback to resendOtp if needed
      let result;
      try {
        result = await this.dispatch(requestOtpAction());
        
        if (requestOtpAction.fulfilled.match(result)) {
          return {
            success: true,
            message: 'OTP requested successfully',
            otp_sent: result.payload.data.otp_sent || true,
            phone_number: result.payload.data.phone_number
          };
        }
      } catch (requestError) {
        console.log('RequestOtp failed, trying resendOtp:', requestError);
        // Fallback to resendOtp
        result = await this.dispatch(resendOtpAction());
        
        if (resendOtpAction.fulfilled.match(result)) {
          return {
            success: true,
            message: 'OTP resent successfully',
            otp_sent: true
          };
        }
      }
      
      throw new Error(result.payload as string || 'Failed to send OTP');
    } catch (error: any) {
      console.error('Error sending econtract OTP:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  }
}