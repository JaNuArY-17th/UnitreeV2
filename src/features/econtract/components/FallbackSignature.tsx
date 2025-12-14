import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ImprovedSignatureCapture } from './ImprovedSignatureCapture';

interface FallbackSignatureProps {
  style?: any;
  onSaveEvent?: (result: any) => void;
}

export const FallbackSignature = forwardRef<any, FallbackSignatureProps>(
  ({ style, onSaveEvent }, ref) => {
    const { t } = useTranslation();
    const signatureRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      saveImage: () => {
        console.log('FallbackSignature saveImage called');
        if (signatureRef.current) {
          signatureRef.current.saveImage();
        }
      },
      resetImage: () => {
        console.log('FallbackSignature resetImage called');
        if (signatureRef.current) {
          signatureRef.current.resetImage();
        }
      },
    }));

    return (
      <ImprovedSignatureCapture
        ref={signatureRef}
        style={style}
        onSaveEvent={onSaveEvent}
        backgroundColor="white"
        strokeColor="#000000"
        strokeWidth={2}
      />
    );
  }
);

FallbackSignature.displayName = 'FallbackSignature';
