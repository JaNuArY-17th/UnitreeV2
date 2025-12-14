import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/shared/themes';

interface BackgroundPatternProps {
  /**
   * Brand color in RGB format (e.g., '22, 73, 81') or hex format (e.g., '#164951')
   * @default '22, 73, 81'
   */
  BRAND_RGB?: string;
  /**
   * Border radius for the container
   * @default 0
   */
  borderRadius?: number;
}

/**
 * Convert hex color to RGB string
 * @param hex - Hex color string (e.g., '#164951')
 * @returns RGB string (e.g., '22, 73, 81')
 */
const hexToRgb = (hex: string): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
};

/**
 * Decorative background pattern with subtle brand-colored shapes
 * - Uses project theme colors for consistency
 * - Kept very light to avoid distracting from form
 * - Supports custom brand color and border radius
 */
export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ 
  BRAND_RGB = '22, 73, 81',
  borderRadius = 0 
}) => {
  // Convert hex to RGB if needed
  const rgbColor = useMemo(() => {
    if (BRAND_RGB.startsWith('#')) {
      return hexToRgb(BRAND_RGB);
    }
    return BRAND_RGB;
  }, [BRAND_RGB]);

  const dynamicStyles = useMemo(() => {
    return StyleSheet.create({
      patternContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        borderRadius: borderRadius,
      } as ViewStyle,
      circle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: `rgba(${rgbColor}, 0.05)`,
        top: -50,
        left: -50,
      } as ViewStyle,
      circle2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: `rgba(${rgbColor}, 0.04)`,
        top: '50%',
        right: -100,
      } as ViewStyle,
      circle4: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: `rgba(${rgbColor}, 0.06)`,
        backgroundColor: 'transparent',
        top: '30%',
        left: '20%',
      } as ViewStyle,
      circle5: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: `rgba(${rgbColor}, 0.04)`,
        top: '15%',
        left: '60%',
      } as ViewStyle,
      square1: {
        position: 'absolute',
        width: 120,
        height: 120,
        transform: [{ rotate: '45deg' }],
        backgroundColor: `rgba(${rgbColor}, 0.03)`,
        top: '20%',
        right: 30,
      } as ViewStyle,
      square2: {
        position: 'absolute',
        width: 80,
        height: 80,
        transform: [{ rotate: '30deg' }],
        backgroundColor: `rgba(${rgbColor}, 0.04)`,
        bottom: '15%',
        left: -20,
      } as ViewStyle,
      rectangle1: {
        position: 'absolute',
        width: 150,
        height: 30,
        backgroundColor: `rgba(${rgbColor}, 0.03)`,
        transform: [{ rotate: '65deg' }],
        bottom: '40%',
        right: '10%',
      } as ViewStyle,
      triangle: {
        position: 'absolute',
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 50,
        borderRightWidth: 50,
        borderBottomWidth: 100,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: `rgba(${rgbColor}, 0.03)`,
        top: '40%',
        left: '5%',
        transform: [{ rotate: '35deg' }],
      } as ViewStyle,
      gradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.03,
        backgroundColor: BRAND_RGB.startsWith('#') ? BRAND_RGB : colors.brand,
        transform: [{ skewY: '-20deg' }],
        top: '70%',
      } as ViewStyle,
    });
  }, [rgbColor, borderRadius, BRAND_RGB]);

  return (
    <View pointerEvents="none" style={dynamicStyles.patternContainer}>
      <View style={dynamicStyles.circle1} />
      <View style={dynamicStyles.circle2} />
      <View style={dynamicStyles.square1} />
      <View style={dynamicStyles.square2} />
      <View style={dynamicStyles.circle4} />
      <View style={dynamicStyles.circle5} />
      <View style={dynamicStyles.rectangle1} />
      <View style={dynamicStyles.triangle} />
      <View style={dynamicStyles.gradient} />
    </View>
  );
};

export default BackgroundPattern;

