import { useState, useRef } from 'react';
import { SignatureResult } from '../types';

export const useContractSigning = () => {
  const signatureRef = useRef<any>(null);

  // States
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [isSignedPdfVisible, setIsSignedPdfVisible] = useState(false);
  const [onSignatureCompleteCallback, setOnSignatureCompleteCallback] = useState<((signature: string) => void) | null>(null);

  // Xử lý khi người dùng muốn ký hợp đồng
  const handleSignContract = (onComplete?: (signature: string) => void) => {
    if (onComplete) {
      setOnSignatureCompleteCallback(() => onComplete);
    }
    setIsSignatureModalVisible(true);
  };

  // Lưu chữ ký và gọi callback
  const saveSignature = (result: SignatureResult) => {
    try {
      setSignatureBase64(result.encoded);
      setIsSignatureModalVisible(false);
      
      // Gọi callback nếu có
      if (onSignatureCompleteCallback) {
        onSignatureCompleteCallback(result.encoded);
        setOnSignatureCompleteCallback(null);
      }
    } catch (error) {
      console.error('Error in saveSignature:', error);
      // Close modal even if there's an error
      setIsSignatureModalVisible(false);
    }
  };

  // Reset chữ ký
  const resetSignature = () => {
    try {
      if (signatureRef.current && signatureRef.current.resetImage) {
        signatureRef.current.resetImage();
      }
    } catch (error) {
      console.error('Error resetting signature:', error);
    }
  };


  // Dọn dẹp tài nguyên
  const cleanupResources = () => {
    // Clean up any resources if needed
    console.log('Cleaning up contract signing resources');
  };

  return {
    // Refs
    signatureRef,

    // States
    signatureBase64,
    isSignatureModalVisible,
    isSignedPdfVisible,

    // Setters
    setIsSignatureModalVisible,
    setIsSignedPdfVisible,

    // Methods
    handleSignContract,
    saveSignature,
    resetSignature,
    cleanupResources
  };
};
