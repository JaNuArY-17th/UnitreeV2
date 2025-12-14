import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/shared/themes';
import Curve1 from '@/shared/assets/icons/Curve1';

interface ModernBackgroundPatternProps {
    /**
     * Primary color for the pattern elements
     * @default colors.primary
     */
    primaryColor?: string;
    /**
     * Secondary color for accents
     * @default colors.secondary
     */
    secondaryColor?: string;
    /**
     * Opacity level for pattern elements (0-1)
     * @default 0.08
     */
    opacity?: number;
    /**
     * Border radius for the container
     * @default 0
     */
    borderRadius?: number;
}

/**
 * Modern background pattern with SVG curve elements
 * Features flowing curve shapes positioned in the top right corner
 */
export const ModernBackgroundPattern: React.FC<ModernBackgroundPatternProps> = ({
    primaryColor = '#0C5C3E',
    secondaryColor = colors.secondary,
    opacity = 0.2,
    borderRadius = 0
}) => {
    const dynamicStyles = useMemo(() => {
        return StyleSheet.create({
            patternContainer: {
                ...StyleSheet.absoluteFillObject,
                overflow: 'hidden',
                borderRadius: borderRadius,
            } as ViewStyle,

            curveContainer: {
                position: 'absolute',
                top: -27,
                right: -27,
                opacity: opacity,
            } as ViewStyle,

            curve1: {
                marginBottom: 10,
                transform: [{ rotate: '70deg' }],
            } as ViewStyle,
        });
    }, [primaryColor, secondaryColor, opacity, borderRadius]);

    return (
        <View pointerEvents="none" style={dynamicStyles.patternContainer}>
            <View style={dynamicStyles.curveContainer}>
                <View style={dynamicStyles.curve1}>
                    <Curve1 width={300} height={230} color={colors.light} />
                </View>
                {/* <View style={dynamicStyles.curve2}>
                    <Curve2 width={100} height={60} color={colors.light} />
                </View>
                <View style={dynamicStyles.curve3}>
                    <Curve3 width={100} height={60} color={colors.light} />
                </View> */}
            </View>
        </View>
    );
};

export default ModernBackgroundPattern;