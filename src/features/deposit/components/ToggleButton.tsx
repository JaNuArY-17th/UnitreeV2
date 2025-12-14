import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, LayoutChangeEvent } from 'react-native';
import { Text } from '@/shared/components/base';
import { colors, spacing, dimensions, typography } from '@/shared/themes';
import { subscribeToColorChanges } from '@/shared/themes/colors';
import { FONT_WEIGHTS, getFontFamily } from '@/shared/themes/fonts';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { MoneyReceiveFlow01Icon, MoneySend01Icon } from '@hugeicons/core-free-icons';

interface ToggleButtonProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  leftLabel: string;
  rightLabel: string;
  leftValue: T;
  rightValue: T;
  leftIcon?: any;
  rightIcon?: any;
  variant?: 'default' | 'onPrimary';
}

const ToggleButton = <T extends string>({
  value,
  onValueChange,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  leftIcon,
  rightIcon,
  variant = 'default',
}: ToggleButtonProps<T>) => {
  const [primaryColor, setPrimaryColor] = useState(colors.primary);
  const [containerWidth, setContainerWidth] = useState(0);

  // Animation value for slide - using translateX for native driver support
  const slideAnim = useRef(new Animated.Value(value === leftValue ? 0 : 1)).current;

  // Subscribe to color changes
  useEffect(() => {
    const unsubscribe = subscribeToColorChanges((newColors) => {
      setPrimaryColor(newColors.primary);
    });
    return unsubscribe;
  }, []);

  // Animate when value changes - optimized with native driver
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: value === leftValue ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 15,
    }).start();
  }, [value, slideAnim, leftValue]);

  const isOnPrimary = variant === 'onPrimary';

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  // Calculate button width (half of container minus padding)
  const buttonWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0;

  // Animated translateX for native driver performance
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, buttonWidth],
  });

  // Get colors based on current value
  const getLeftColor = () => {
    if (value === leftValue) {
      return isOnPrimary ? primaryColor : colors.light;
    }
    return isOnPrimary ? 'rgba(255, 255, 255, 0.9)' : colors.text.secondary;
  };

  const getRightColor = () => {
    if (value === rightValue) {
      return isOnPrimary ? primaryColor : colors.light;
    }
    return isOnPrimary ? 'rgba(255, 255, 255, 0.9)' : colors.text.secondary;
  };

  // Create dynamic styles based on current primary color
  const dynamicStyles = {
    activeIndicator: {
      backgroundColor: isOnPrimary ? colors.light : primaryColor,
    },
    container: {
      backgroundColor: isOnPrimary ? 'rgba(255, 255, 255, 0.2)' : colors.lightGray,
    },
  };

  return (
    <View
      style={[styles.container, dynamicStyles.container]}
      onLayout={handleLayout}
    >
      {/* Animated sliding indicator */}
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.activeIndicator,
            dynamicStyles.activeIndicator,
            {
              width: buttonWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}

      <TouchableOpacity
        style={[styles.button, styles.leftButton]}
        onPress={() => onValueChange(leftValue)}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {leftIcon && (
            <HugeiconsIcon
              icon={leftIcon}
              size={20}
              color={getLeftColor()}
            />
          )}
          <Text style={[styles.buttonText, { color: getLeftColor() }]}>
            {leftLabel}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.rightButton]}
        onPress={() => onValueChange(rightValue)}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {rightIcon && (
            <HugeiconsIcon
              icon={rightIcon}
              size={20}
              color={getRightColor()}
            />
          )}
          <Text style={[styles.buttonText, { color: getRightColor() }]}>
            {rightLabel}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 100,
    padding: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 100,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    zIndex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  leftButton: {
    marginRight: 2,
  },
  rightButton: {
    marginLeft: 2,
  },
  buttonText: {
    ...typography.subtitle,
  },
});

export default ToggleButton;
