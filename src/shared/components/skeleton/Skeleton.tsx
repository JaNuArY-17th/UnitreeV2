import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Animated, Easing, LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../themes';

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean; // if true, shimmer disabled
  baseColor?: string;
  highlightColor?: string;
};

// A single skeleton box with shimmer overlay
export const SkeletonBox: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  disabled = false,
  baseColor = '#ECEFF1',
  highlightColor = '#F5F7F8',
}) => {
  const [layoutW, setLayoutW] = useState(0);
  const shimmerX = useRef(new Animated.Value(0)).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setLayoutW(w);
  };

  useEffect(() => {
    if (disabled) return;
    if (layoutW === 0) return;
    shimmerX.setValue(-layoutW);
    const loop = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: layoutW,
        duration: 1200,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [disabled, layoutW, shimmerX]);

  const animatedStyle = useMemo(() => ({
    transform: [{ translateX: shimmerX }],
  }), [shimmerX]);

  return (
    <View onLayout={onLayout} style={[
      styles.box,
      { width: width as any, height: height as any, borderRadius, backgroundColor: baseColor } as any,
      style,
    ]}>
      {!disabled && layoutW > 0 && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius }]}>
          {/* Shimmer gradient overlay, clipped by parent borderRadius */}
          <Animated.View style={[{ width: layoutW * 0.6, height: '100%' }, animatedStyle]}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={baseColor} stopOpacity="0.2" />
                  <Stop offset="0.5" stopColor={highlightColor} stopOpacity="0.9" />
                  <Stop offset="1" stopColor={baseColor} stopOpacity="0.2" />
                </LinearGradient>
              </Defs>
              <Rect x={0} y={0} width="100%" height="100%" fill="url(#grad)" />
            </Svg>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

export const SkeletonLine: React.FC<Pick<SkeletonProps, 'width' | 'style' | 'height'>> = ({ width = '100%', style, height = 12 }) => (
  <SkeletonBox height={height} width={width} borderRadius={6} style={style} />
);

export const SkeletonCircle: React.FC<Pick<SkeletonProps, 'width' | 'style'>> = ({ width = 40, style }) => (
  <SkeletonBox height={width as number} width={width} borderRadius={(width as number) / 2} style={style} />
);

export const SkeletonBlock: React.FC<SkeletonProps> = (props) => (
  <SkeletonBox {...props} />
);

export const SkeletonDivider: React.FC = () => (
  <View style={{ height: 1, backgroundColor: colors.border, opacity: 0.5 }} />
);

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#ECEFF1',
    overflow: 'hidden',
  },
});

export default SkeletonBox;
