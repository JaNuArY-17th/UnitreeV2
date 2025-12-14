import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';

// Import SignatureCapture directly
let SignatureCapture: any = null;
try {
  SignatureCapture = require('react-native-signature-capture').default;
} catch (error) {
  console.error('react-native-signature-capture not available:', error);
}

interface SafeSignatureCaptureProps {
  signatureRef: React.RefObject<any>;
  onSave: (result: any) => void;
  onError: () => void;
}

export const SafeSignatureCapture: React.FC<SafeSignatureCaptureProps> = ({
  signatureRef,
  onSave,
  onError,
}) => {

  // Check if native SignatureCapture is available
  if (!SignatureCapture) {
    console.warn('Native SignatureCapture not available, triggering fallback mode');
    // Automatically trigger fallback mode instead of showing error
    setTimeout(() => {
      onError();
    }, 100);
    
    return (
      <View style={[styles.signature, { backgroundColor: '#FFF3CD', alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#856404', fontSize: 14, textAlign: 'center' }}>
          Đang chuyển sang chế độ chữ ký thay thế...
        </Text>
      </View>
    );
  }

  // Render native SignatureCapture directly
  console.log('Rendering native SignatureCapture');
  
  return (
    <SignatureCapture
      ref={signatureRef}
      style={styles.signature}
      showNativeButtons={false}
      showTitleLabel={false}
      onSaveEvent={(result: any) => {
        try {
          console.log('Native signature saved:', result);
          
          // Process the signature result to ensure proper format
          const processedResult = {
            encoded: result.encoded || result.base64 || result.pathName,
            pathName: result.pathName || 'signature.png'
          };
          
          console.log('Processed signature result:', processedResult);
          onSave(processedResult);
        } catch (saveError) {
          console.error('Error processing signature save:', saveError);
          onError();
        }
      }}
      backgroundColor="white"
      strokeColor="#000000"
      minStrokeWidth={2}
      maxStrokeWidth={4}
    />
  );
};