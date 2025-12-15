import React from 'react';

interface BiometricLoginButtonProps {
  phone: string;
  onSuccess: (credentials: { phone: string; password: string }) => void;
  isLoading?: boolean;
}

/**
 * BiometricLoginButton - Stub component
 * 
 * Note: Biometric feature has been removed. This is a placeholder component
 * that renders nothing. The biometric login functionality has been deprecated.
 * 
 * To re-enable biometric authentication, implement a new biometric feature.
 */
const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = () => {
  return null;
};

export default BiometricLoginButton;
