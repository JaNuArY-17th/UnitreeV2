import React, { useState } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { theme } from '@/shared/themes';
import { bottomTabStyles, hapticOptions } from '../styles/bottomTabStyles';
import { getUserTypeColor } from '@/shared/themes/colors';
import Svg, { Path } from 'react-native-svg';

interface CreateButtonProps {
  onPress?: () => void;
}

const PlusIcon = ({ color = theme.colors.light }: { color?: string }) => (
  <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <Path
      d="M16 8V24M8 16H24"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CreateButton: React.FC<CreateButtonProps> = ({ onPress }) => {
  const [scale] = useState(new Animated.Value(1));
  const [rotate] = useState(new Animated.Value(0));

  const handlePressIn = () => {
    onPress?.();
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.9,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <Animated.View
      style={[
        bottomTabStyles.scanButton,
        {
          backgroundColor: getUserTypeColor(),
          transform: [{ scale }]
        }
      ]}
    >
      <TouchableOpacity
        style={bottomTabStyles.scanButtonTouch}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessibilityLabel="Tạo mới"
        accessibilityRole="button"
      >
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <PlusIcon />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};
