import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ArrowCircleUp, ArrowCircleDown, ArrowUp, ArrowDown } from '@/shared/assets/icons';

interface FinanceCardPatternProps {
  /**
   * Pattern color in hex format (e.g., '#FFFFFF')
   * @default '#FFFFFF'
   */
  patternColor?: string;
  /**
   * Border radius for the container
   * @default 16
   */
  borderRadius?: number;
  /**
   * Solid background color
   * @default '#8B5CF6'
   */
  backgroundColor?: string;
  /**
   * Pattern opacity (0-1)
   * @default 0.1
   */
  patternOpacity?: number;
  /**
   * Card type to determine arrow direction
   * @default 'expense'
   */
  type?: 'income' | 'expense';
}

/**
 * Convert hex color to RGB string for use in rgba
 * @param hex - Hex color string (e.g., '#FFFFFF')
 * @returns RGB string (e.g., '255, 255, 255')
 */
const hexToRgb = (hex: string): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

/**
 * Background pattern specifically designed for Finance Cards
 * Creates geometric shapes similar to the expense card design
 */
export const FinanceCardPattern: React.FC<FinanceCardPatternProps> = ({
  patternColor = '#FFFFFF',
  borderRadius = 16,
  backgroundColor = '#8B5CF6',
  patternOpacity = 0.15,
  type = 'expense'
}) => {

  // Convert pattern color to RGB format if it's hex
  const rgbColor = useMemo(() => {
    if (patternColor.startsWith('#')) {
      return hexToRgb(patternColor);
    }
    return patternColor;
  }, [patternColor]);

  const dynamicStyles = useMemo(() => {
    return StyleSheet.create({
      patternContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        borderRadius: borderRadius,
        backgroundColor: backgroundColor,
      } as ViewStyle,

      // Small circle at top left corner (outline only)
      smallCircleTopLeft: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: `rgba(${rgbColor}, ${0.3 * patternOpacity})`,
        backgroundColor: 'transparent',
        top: -35,
        left: -45,
      } as ViewStyle,

      // Big solid circle at bottom right corner with opacity
      bigCircleBottomRight: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 100,
        backgroundColor: `rgba(${rgbColor}, ${0.2 * patternOpacity})`,
        bottom: -20,
        right: -50,
        justifyContent: 'center',
        alignItems: 'center',
      } as ViewStyle,

      // Arrow container inside the big circle
      arrowContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      } as ViewStyle,
    });
  }, [rgbColor, borderRadius, backgroundColor, patternOpacity]);

  return (
    <View pointerEvents="none" style={dynamicStyles.patternContainer}>
      {/* Small circle at top left corner (outline only) */}
      <View style={dynamicStyles.smallCircleTopLeft} />

      {/* Big solid circle at bottom right corner with arrow inside */}
      <View style={dynamicStyles.bigCircleBottomRight}>
        <View style={dynamicStyles.arrowContainer}>
          {type === 'income' ? (
            <ArrowDown
              width={60}
              height={60}
              color={`rgba(${rgbColor}, ${0.6 * patternOpacity})`}
            />
          ) : (
            <ArrowUp
              width={60}
              height={60}
              color={`rgba(${rgbColor}, ${0.6 * patternOpacity})`}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default FinanceCardPattern;