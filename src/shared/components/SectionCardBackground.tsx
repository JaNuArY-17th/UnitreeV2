import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';

interface SectionCardBackgroundProps {
  colors: [string, string];
  borderRadius?: number;
  decorColor?: string;
}

const SectionCardBackground: React.FC<SectionCardBackgroundProps> = ({
  colors,
  borderRadius = 16,
  decorColor,
}) => {
  const [start, end] = colors;
  const deco = decorColor || start;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 320 160" preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={start} />
            <Stop offset="100%" stopColor={end} />
          </SvgLinearGradient>
        </Defs>

        {/* Background rounded rect */}
        <Rect x="0" y="0" width="320" height="160" rx={borderRadius} fill="url(#cardGrad)" />

        {/* Soft circles (bokeh) */}
        <Circle cx="24" cy="24" r="6" fill={deco} opacity="0.25" />
        <Circle cx="300" cy="20" r="5" fill={deco} opacity="0.18" />
        <Circle cx="290" cy="120" r="8" fill={deco} opacity="0.12" />

        {/* Star sparkles */}
        <Path d="M50 28 L54 30 L50 32 L48 36 L46 32 L42 30 L46 28 L48 24 Z" fill={deco} opacity="0.25" />
        <Path d="M274 40 L276 42 L274 44 L272 42 Z" fill={deco} opacity="0.3" />
        <Path d="M40 120 L42 123 L40 126 L37 123 Z" fill={deco} opacity="0.2" />
      </Svg>
    </View>
  );
};

export default SectionCardBackground;
