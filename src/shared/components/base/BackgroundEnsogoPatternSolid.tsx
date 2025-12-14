import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/shared/themes';
import { EnsogoFlowerLogo } from '@/shared/assets/images/EnsogoFlower';

interface BackgroundEnsogoPatternSolidProps {
  /**
   * Pattern color in hex format (e.g., '#164951')
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
   * @default 0.1
   */
  patternOpacity?: number;
  /**
   * Size of the flower logos
   * @default 40
   */
  flowerSize?: number;
}

/**
 * Decorative background pattern using Ensogo Flower logos
 * - Solid background color (no transparency)
 * - Two flower patterns: one big on top right, one medium on top left
 * - Supports custom pattern color, background color, and border radius
 */
export const BackgroundEnsogoPatternSolid: React.FC<BackgroundEnsogoPatternSolidProps> = ({
  patternColor = '#164951',
  borderRadius = 0,
  backgroundColor = '#FFFFFF',
  patternOpacity = 0.1,
  flowerSize = 40
}) => {

  const dynamicStyles = useMemo(() => {
    return StyleSheet.create({
      patternContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        borderRadius: borderRadius,
        backgroundColor: backgroundColor, // Solid background color
      } as ViewStyle,
      flowerWrapper: {
        position: 'absolute',
        opacity: patternOpacity,
      } as ViewStyle,
      // Big flower on top right
      flowerBig: {
        position: 'absolute',
        top: 50,
        right: 10,
        opacity: patternOpacity * 0.3,
        transform: [{ rotate: '15deg' }, { scale: 1.5 }],
      } as ViewStyle,
      // Medium flower on top left
      flowerMedium: {
        position: 'absolute',
        top: 10,
        left: 10,
        opacity: patternOpacity * 0.7,
        transform: [{ rotate: '-20deg' }],
      } as ViewStyle,
    });
  }, [borderRadius, backgroundColor, patternOpacity]);

  return (
    <View pointerEvents="none" style={dynamicStyles.patternContainer}>
      {/* Big flower on top right */}
      {/* <View style={dynamicStyles.flowerBig}>
        <EnsogoFlowerLogo
          width={flowerSize * 6}
          height={flowerSize * 6}
          color={patternColor}
          focused={false}
        />
      </View> */}

      {/* Medium flower on top left */}
      {/* <View style={dynamicStyles.flowerMedium}>
        <EnsogoFlowerLogo
          width={flowerSize * 2}
          height={flowerSize * 2}
          color={patternColor}
          focused={false}
        />
      </View> */}
    </View>
  );
};

export default BackgroundEnsogoPatternSolid;
