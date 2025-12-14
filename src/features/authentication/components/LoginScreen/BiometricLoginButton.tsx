import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useBiometric } from '@/features/biometric';
import { getStoredBiometricStatus } from '@/shared/utils/biometricStorage';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FaceIdIcon, FingerPrintIcon } from '@hugeicons/core-free-icons';

interface BiometricLoginButtonProps {
  phone: string;
  userType: 'store' | 'user';
  currentColor: string;
  onBiometricLogin?: (phone: string, userType: 'store' | 'user') => void;
}

const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({
  phone,
  userType,
  currentColor,
  onBiometricLogin,
}) => {
  const { t } = useTranslation('biometric');
  const { checkStatus, login: biometricLogin, createSignature, isEnrolled, isAvailable, biometricType, loggingIn } = useBiometric();
  const [storedBiometricStatus, setStoredBiometricStatus] = useState<{ isEnrolled: boolean; biometricType?: string } | null>(null);

  // Check biometric status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Check stored biometric status when phone changes
  useEffect(() => {
    const checkStoredBiometricStatus = async () => {
      if (phone.trim()) {
        const status = await getStoredBiometricStatus(phone.trim());
        setStoredBiometricStatus(status);
      } else {
        setStoredBiometricStatus(null);
      }
    };

    checkStoredBiometricStatus();
  }, [phone]);

  const handleBiometricLogin = async () => {
    if (!loggingIn && onBiometricLogin && phone.trim()) {
      try {
        // Create signature for the payload (this includes biometric authentication)
        const payload = `biometric_login_${Date.now()}_${phone}`;

        const signature = await createSignature(payload, {
          promptMessage: t('biometric.login.prompt') || 'Authenticate to login',
        });

        if (signature) {
          // Call the login API with signed payload
          try {
            await biometricLogin({
              phone_number: phone,
              payload,
              signature,
              user_type: userType, // Pass user type to determine endpoint
            });

            // Call the parent callback to handle successful login
            onBiometricLogin(phone, userType);
          } catch (loginError: any) {
            // Show error alert for biometric login failure
            const errorMessage = loginError?.response?.data?.message
              || loginError?.message
              || t('login:errors.biometricLoginFailed')
              || 'Biometric login failed';

            Alert.alert(
              t('login:errors.loginFailed') || 'Login Failed',
              errorMessage,
              [
                {
                  text: t('common:ok') || 'OK',
                  style: 'default',
                },
              ]
            );
          }
        }
      } catch (error) {
        // User cancelled biometric prompt or biometric failed
        // Don't show alert - user already cancelled
        console.log('Biometric cancelled or failed:', error);
      }
    }
  };

  // Don't render if biometric is not available or not enrolled
  if (!isAvailable || (!isEnrolled && !storedBiometricStatus?.isEnrolled) || !onBiometricLogin) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.biometricButton, { backgroundColor: currentColor }]}
      onPress={handleBiometricLogin}
      disabled={loggingIn || !phone.trim()}
    >
      {((biometricType === 'FaceID') || (storedBiometricStatus?.biometricType === 'FaceID')) ? (
        <HugeiconsIcon icon={FaceIdIcon} size={24} color="white" />
      ) : (
        <HugeiconsIcon icon={FingerPrintIcon} size={24} color="white" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  biometricButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BiometricLoginButton;
