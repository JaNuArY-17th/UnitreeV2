import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors } from '@/shared/themes';
import { getFontFamily, FONT_WEIGHTS } from '@/shared/themes/fonts';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface TabShapeProps {
    width?: number;
    height?: number;
    isActive?: boolean;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    flipHorizontal?: boolean;
    text?: string;
}

export const TabShape: React.FC<TabShapeProps> = ({
    width = 122,
    height = 40,
    isActive = false,
    fillColor,
    strokeColor = 'transparent',
    strokeWidth = 0,
    flipHorizontal = false,
    text,
}) => {
    // Scale the SVG path to match the provided width
    const scaleX = width / 115;
    const scaleY = height / 35;

    // Create scaled path using the original coordinates
    const scaledPath = `M${116.486 * scaleX},${29.036 * scaleY}c${-23.582 * scaleX},${-8 * scaleY} ${-14.821 * scaleX},${-29 * scaleY} ${-42.018 * scaleX},${-29 * scaleY}h${-62.4 * scaleX}C${5.441 * scaleX},${0.036 * scaleY},0,${5.376 * scaleY} 0,${12.003 * scaleY}v${28.033 * scaleY}h${122 * scaleX}v${-11 * scaleY}H${116.486 * scaleX}z`;

    return (
        <View style={[styles.container, { width, height }]}>
            <Svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={[
                    StyleSheet.absoluteFillObject,
                    flipHorizontal && { transform: [{ scaleX: -1 }] }
                ]}
            >
                <Defs>
                    {/* Gradient for active tabs */}
                    <LinearGradient id={`activeGradient-${width}-${flipHorizontal ? 'flipped' : 'normal'}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={colors.light} />
                        <Stop offset="100%" stopColor={colors.light} />
                    </LinearGradient>

                    {/* Gradient for inactive tabs */}
                    <LinearGradient id={`inactiveGradient-${width}-${flipHorizontal ? 'flipped' : 'normal'}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={colors.primary} />
                        <Stop offset="100%" stopColor={colors.primary} />
                    </LinearGradient>
                </Defs>

                <Path
                    d={scaledPath}
                    fill={isActive ? `url(#activeGradient-${width}-${flipHorizontal ? 'flipped' : 'normal'})` : `url(#inactiveGradient-${width}-${flipHorizontal ? 'flipped' : 'normal'})`}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />

                {/* Text inside SVG */}
                {text && (
                    <SvgText
                        x={flipHorizontal ? (isActive ? width / 1.7 : width / 1.5) : (isActive ? width / 2.5 : width / 3.5)}
                        y={isActive ? height / 2.5 : height / 3} // Adjust vertical position
                        fontSize={isActive ? 15 : 13}
                        fontFamily={getFontFamily(FONT_WEIGHTS.BOLD)}
                        fontWeight={'bold'}
                        fill={isActive ? colors.primary : colors.light}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={flipHorizontal ? `scale(-1, 1) translate(-${width}, 0)` : undefined}
                    >
                        {text}
                    </SvgText>
                )}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});

export default TabShape;