import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/shared/themes';

interface BackgroundPatternSolidProps {
  /**
   * Pattern color in hex format (e.g., '#164951') or RGB format (e.g., '22, 73, 81')
   * @default '#164951'
   */
  patternColor?: string;
  /**
   * Border radius for the container
   * @default 0
   */
  borderRadius?: number;
  /**
   * Solid background color (no transparency)
   * @default '#FFFFFF'
   */
  backgroundColor?: string;
  /**
   * Pattern opacity (0-1)
   * @default 1
   */
  patternOpacity?: number;
}

/**
 * Convert hex color to RGB string for use in rgba
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
 * Decorative background pattern with solid background and transparent pattern shapes
 * - Solid background color (no transparency)
 * - Pattern shapes use rgba with transparency for subtle effect
 * - Supports custom pattern color, background color, and border radius
 */
export const BackgroundPatternSolid: React.FC<BackgroundPatternSolidProps> = ({ 
  patternColor = '#164951',
  borderRadius = 0,
  backgroundColor = '#FFFFFF',
  patternOpacity = 1
}) => {
  
  // Convert pattern color to RGB format if it's hex
  const rgbColor = useMemo(() => {
    if (patternColor.startsWith('#')) {
      return hexToRgb(patternColor);
    }
    // If already in RGB format
    return patternColor;
  }, [patternColor]);

  const dynamicStyles = useMemo(() => {
    return StyleSheet.create({
      patternContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        borderRadius: borderRadius,
        backgroundColor: backgroundColor, // Solid background color
      } as ViewStyle,
      circle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: `rgba(${rgbColor}, ${0.05 * patternOpacity})`, // Transparent pattern
        top: -50,
        left: -50,
      } as ViewStyle,
      circle2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: `rgba(${rgbColor}, ${0.04 * patternOpacity})`,
        top: '50%',
        right: -100,
      } as ViewStyle,
      circle4: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: `rgba(${rgbColor}, ${0.06 * patternOpacity})`,
        backgroundColor: 'transparent',
        top: '30%',
        left: '20%',
      } as ViewStyle,
      circle5: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: `rgba(${rgbColor}, ${0.04 * patternOpacity})`,
        top: '15%',
        left: '60%',
      } as ViewStyle,
      square1: {
        position: 'absolute',
        width: 120,
        height: 120,
        transform: [{ rotate: '45deg' }],
        backgroundColor: `rgba(${rgbColor}, ${0.03 * patternOpacity})`,
        top: '20%',
        right: 30,
      } as ViewStyle,
      square2: {
        position: 'absolute',
        width: 80,
        height: 80,
        transform: [{ rotate: '30deg' }],
        backgroundColor: `rgba(${rgbColor}, ${0.04 * patternOpacity})`,
        bottom: '15%',
        left: -20,
      } as ViewStyle,
      rectangle1: {
        position: 'absolute',
        width: 150,
        height: 30,
        backgroundColor: `rgba(${rgbColor}, ${0.03 * patternOpacity})`,
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
        borderBottomColor: `rgba(${rgbColor}, ${0.03 * patternOpacity})`,
        top: '40%',
        left: '5%',
        transform: [{ rotate: '35deg' }],
      } as ViewStyle,
      gradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: `rgba(${rgbColor}, ${0.02 * patternOpacity})`,
        transform: [{ skewY: '-20deg' }],
        top: '70%',
      } as ViewStyle,
      // Additional decorative elements for more depth
      hexagon: {
        position: 'absolute',
        width: 70,
        height: 70,
        backgroundColor: `rgba(${rgbColor}, ${0.04 * patternOpacity})`,
        transform: [{ rotate: '60deg' }],
        top: '60%',
        left: '40%',
      } as ViewStyle,
      diamond: {
        position: 'absolute',
        width: 50,
        height: 50,
        backgroundColor: `rgba(${rgbColor}, ${0.05 * patternOpacity})`,
        transform: [{ rotate: '45deg' }],
        bottom: '30%',
        right: '20%',
      } as ViewStyle,
      ellipse: {
        position: 'absolute',
        width: 140,
        height: 70,
        borderRadius: 70,
        backgroundColor: `rgba(${rgbColor}, ${0.03 * patternOpacity})`,
        transform: [{ rotate: '-30deg' }],
        top: '75%',
        left: '10%',
      } as ViewStyle,
    });
  }, [rgbColor, borderRadius, backgroundColor, patternOpacity]);

  return (
    <View pointerEvents="none" style={dynamicStyles.patternContainer}>
      {/* Layer 1: Larger background shapes */}
      <View style={dynamicStyles.circle1} />
      <View style={dynamicStyles.circle2} />
      <View style={dynamicStyles.gradient} />
      
      {/* Layer 2: Medium shapes */}
      <View style={dynamicStyles.square1} />
      <View style={dynamicStyles.square2} />
      <View style={dynamicStyles.rectangle1} />
      <View style={dynamicStyles.ellipse} />
      
      {/* Layer 3: Smaller accent shapes */}
      <View style={dynamicStyles.circle4} />
      <View style={dynamicStyles.circle5} />
      <View style={dynamicStyles.triangle} />
      <View style={dynamicStyles.hexagon} />
      <View style={dynamicStyles.diamond} />
    </View>
  );
};

export default BackgroundPatternSolid;