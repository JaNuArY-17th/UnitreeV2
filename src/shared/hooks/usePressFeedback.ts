import { useRef } from 'react';
import { Animated } from 'react-native';

interface PressFeedbackReturn {
  onPressIn: () => void;
  onPressOut: () => void;
  animatedStyle: {
    transform: { scale: Animated.Value }[];
  };
}

export const usePressFeedback = (
  scaleValue: number = 0.95,
  duration: number = 150
): PressFeedbackReturn => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: scaleValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  return {
    onPressIn,
    onPressOut,
    animatedStyle,
  };
};