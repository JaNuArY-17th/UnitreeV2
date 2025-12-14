import React, { useRef } from 'react';
import { View, StyleSheet, Switch, Animated, Pressable } from 'react-native';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { colors, spacing } from '@/shared/themes';
import typographyStyles from '@/shared/themes/typography';

interface MenuItemProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  showArrow?: boolean;
  isLast?: boolean;
  // Toggle functionality
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  showToggle?: boolean;
  disabled?: boolean;
  // Custom right component
  rightComponent?: React.ReactNode;
  reverse?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  showArrow = true,
  isLast = false,
  toggleValue,
  onToggle,
  showToggle = false,
  disabled = false,
  rightComponent,
  reverse = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = (value: boolean) => {
    if (onToggle && !disabled) {
      onToggle(value);
    }
  };

  const handlePressIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 0.6,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !showToggle) {
      onPress();
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        !isLast && styles.borderBottom,
        disabled && styles.disabled
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || showToggle} // Disable press when showing toggle to prevent interference
    >
      <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          {icon}
        </View>

        <View style={styles.content}>
          {reverse && subtitle ? (
            <>
              <Text style={[
                styles.subtitle,
                disabled && styles.disabledText
              ]}>{subtitle}</Text>
              <Text style={[
                styles.title,
                disabled && styles.disabledText
              ]}>{title}</Text>
            </>
          ) : (
            <>
              <Text style={[
                styles.title,
                disabled && styles.disabledText
              ]}>{title}</Text>
              {subtitle && (
                <Text style={[
                  styles.subtitle,
                  disabled && styles.disabledText
                ]}>{subtitle}</Text>
              )}
            </>
          )}
        </View>

        {rightComponent ? (
          <View style={styles.rightComponent}>
            {rightComponent}
          </View>
        ) : showToggle ? (
          <View style={styles.switchContainer}>
            <Switch
              value={toggleValue || false}
              onValueChange={handleToggle}
              disabled={disabled}
              trackColor={{
                false: colors.border,
                true: disabled ? colors.lightGray : colors.primary
              }}
              thumbColor={colors.light}
              style={[
                styles.switch,
                disabled && styles.disabledSwitch
              ]}
            />
          </View>
        ) : showArrow && !disabled && (
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={20}
            color={colors.text.secondary}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    // minHeight: 72,
  },
  animatedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  borderBottom: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#DCE2EF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typographyStyles.subtitle,
  },
  subtitle: {
    marginTop: spacing.xs,
    ...typographyStyles.caption,
  },
  switchContainer: {
    marginLeft: spacing.sm,
  },
  switch: {
    // No additional margin needed, handled by switchContainer
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.lightGray,
  },
  disabledSwitch: {
    opacity: 0.5,
  },
  rightComponent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
