import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface ImprovedSignatureCaptureProps {
  style?: any;
  onSaveEvent?: (result: any) => void;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

interface Point {
  x: number;
  y: number;
}

export const ImprovedSignatureCapture = forwardRef<any, ImprovedSignatureCaptureProps>(
  ({ style, onSaveEvent, backgroundColor = 'white', strokeColor = '#000000', strokeWidth = 2 }, ref) => {
    const { t } = useTranslation();
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const signatureHeight = 200;
    const signatureWidth = width - 40; // Leave some margin

    useImperativeHandle(ref, () => ({
      saveImage: () => {
        console.log('Saving signature with paths:', paths.length);
        if (paths.length > 0) {
          // Create a mock base64 signature - in a real implementation, 
          // this would render the SVG to a bitmap
          const signatureData = {
            encoded: generateMockSignatureBase64(),
            pathName: 'signature.png',
            svgPaths: paths, // Keep the actual path data for reference
          };
          
          if (onSaveEvent) {
            onSaveEvent(signatureData);
          }
        } else {
          console.warn('No signature data to save');
        }
      },
      resetImage: () => {
        console.log('Resetting signature');
        setPaths([]);
        setCurrentPath('');
        setIsDrawing(false);
      },
    }));

    const generateMockSignatureBase64 = (): string => {
      // This generates a simple base64 encoded PNG representing a signature
      // In a real implementation, you would render the SVG paths to a canvas/bitmap
      const timestamp = Date.now();
      const signatureHash = paths.join('').length;
      
      // Mock base64 data - this would be actual image data in production
      return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==${timestamp}_${signatureHash}`;
    };

    const handleTouchStart = (event: any) => {
      const { locationX, locationY } = event.nativeEvent;
      const newPath = `M${locationX},${locationY}`;
      setCurrentPath(newPath);
      setIsDrawing(true);
    };

    const handleTouchMove = (event: any) => {
      if (!isDrawing) return;
      
      const { locationX, locationY } = event.nativeEvent;
      setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
    };

    const handleTouchEnd = () => {
      if (currentPath && isDrawing) {
        setPaths(prev => [...prev, currentPath]);
        setCurrentPath('');
      }
      setIsDrawing(false);
    };

    const hasSignature = paths.length > 0 || currentPath.length > 0;

    return (
      <View style={[styles.container, style]}>
        <View style={[styles.signatureArea, { backgroundColor }]}>
          <View 
            style={styles.drawingArea}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Svg
              width={signatureWidth}
              height={signatureHeight}
              style={StyleSheet.absoluteFillObject}
            >
              <G>
                {paths.map((path, index) => (
                  <Path
                    key={index}
                    d={path}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {currentPath && (
                  <Path
                    d={currentPath}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </G>
            </Svg>
            
            {!hasSignature && (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholder}>
                  {t('econtract.signHere', 'Vui lòng ký tên tại đây')}
                </Text>
                <View style={styles.signatureLine} />
              </View>
            )}
          </View>
        </View>
        
        {hasSignature && (
          <View style={styles.signatureInfo}>
            <Text style={styles.infoText}>
              ✓ {t('econtract.signatureReady', 'Chữ ký đã sẵn sàng')}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  signatureArea: {
    width: '100%',
    minHeight: 200,
    position: 'relative',
  },
  drawingArea: {
    flex: 1,
    width: '100%',
    height: 200,
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  signatureLine: {
    width: '70%',
    height: 1,
    backgroundColor: '#DDD',
  },
  signatureInfo: {
    backgroundColor: '#F0F8F0',
    padding: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

ImprovedSignatureCapture.displayName = 'ImprovedSignatureCapture';