import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '@/shared/themes';
import { typography } from '@/shared/themes/typography';
import Text from './Text';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import HapticFeedback from 'react-native-haptic-feedback';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'tonal' | 'danger';
type ButtonSize = 'lg' | 'md' | 'sm';

export type ButtonProps = {
  label?: string;
  children?: React.ReactNode; // optional custom content
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
};

function getSizeStyles(size: ButtonSize) {
  switch (size) {
    case 'lg':
      return {
        height: 56,
        paddingHorizontal: 16,
        gap: 8,
        fontSize: typography.fontSizes.lg,
      } as const;
    case 'sm':
      return {
        height: 40,
        paddingHorizontal: 12,
        gap: 6,
        fontSize: typography.fontSizes.md,
      } as const;
    case 'md':
    default:
      return {
        height: 46,
        paddingHorizontal: 16,
        gap: 8,
        fontSize: typography.fontSizes.md,
      } as const;
  }
}

function getVariantStyles(variant: ButtonVariant, disabled?: boolean) {
  const base: ViewStyle = {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  };

  const variants: Record<ButtonVariant, { container: ViewStyle; text: TextStyle; border?: ViewStyle }>
    = {
    primary: {
      container: { backgroundColor: colors.primary },
      text: { color: colors.light },
    },
    secondary: {
      container: { backgroundColor: colors.secondary },
      text: { color: colors.text.primary },
    },
    outline: {
      container: { backgroundColor: colors.light, borderWidth: 1, borderColor: colors.primary },
      text: { color: colors.primary },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: colors.primary },
    },
    tonal: {
      container: { backgroundColor: colors.primaryLight },
      text: { color: colors.primary },
    },
    danger: {
      container: { backgroundColor: colors.danger },
      text: { color: colors.light },
    },
  };

  const v = variants[variant];
  const container: ViewStyle = { ...base, ...v.container };
  const text: TextStyle = { ...v.text };

  if (disabled) {
    container.opacity = 0.6;
  }

  return { container, text };
}
const Button: React.FC<ButtonProps> = ({
  label,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  leftIcon,
  rightIcon,
  fullWidth,
  style,
  contentStyle,
  textStyle,
  testID,
}) => {
  const s = getSizeStyles(size);
  const v = getVariantStyles(variant, disabled);
  const letterSpacing = 0;
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
  }, [scale]);
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  }, [scale]);

  const handlePress = useCallback((e: GestureResponderEvent) => {
    if (onPress) {
      HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
      onPress(e);
    }
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressableStyle = ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
    v.container,
    // subtle overlay when pressed
    pressed ? { opacity: 0.9 } : null,
    {
      height: s.height,
      paddingHorizontal: s.paddingHorizontal,
      width: fullWidth ? '100%' : undefined,
    },
    // use border instead of shadow for non-ghost/non-outline variants
    (variant === 'ghost' || variant === 'outline') ? null : { borderWidth: 1, borderColor: colors.mutedLine },
    disabled ? { opacity: 0.55 } : null,
    style,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={pressableStyle}
      testID={testID}
    >
      <Animated.View style={[styles.content, { columnGap: s.gap, rowGap: s.gap }, animatedStyle, contentStyle]}>
        {(loading || leftIcon) && (
          <View style={styles.iconSlot}>
            {loading ? (
              <ActivityIndicator size="small" color={v.text.color as string} />
            ) : (
              leftIcon
            )}
          </View>
        )}

        {label ? (
          <Text
            variant="buttonText"
            style={[
              {
                color: v.text.color,
                fontSize: s.fontSize,
                letterSpacing,
                textAlign: 'center',
              },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : (
          children
        )}

        {rightIcon && !loading && <View style={styles.iconSlot}>{rightIcon}</View>}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
