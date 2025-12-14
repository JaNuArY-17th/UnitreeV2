import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing } from '@/shared/themes';
import Body from './Body';
import { CheckCircleIcon } from '@/shared/assets/icons';

interface SuccessMessageProps {
  message?: string | null;
  visible?: boolean;
  style?: any;
  iconSize?: number;
  showIcon?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  onHide?: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  visible = true,
  style,
  iconSize = 18,
  showIcon = true,
  autoHide = false,
  autoHideDelay = 3000, // Success messages auto-hide faster
  onHide,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (message && visible) {
      // Show success with animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide if enabled
      if (autoHide && onHide) {
        timeoutRef.current = setTimeout(() => {
          onHide();
        }, autoHideDelay);
      }
    } else {
      // Hide success with animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Clear timeout if hiding
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, visible, opacity, translateY, autoHide, autoHideDelay, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {showIcon && (
          <CheckCircleIcon width={iconSize} height={iconSize} color={colors.success} />
        )}
        <Body style={[styles.text, !showIcon && styles.textNoIcon]}>
          {message}
        </Body>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.successSoft,
    padding: spacing.sm,
    borderRadius: 12,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.success + '20', // 20% opacity
    shadowColor: colors.success,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.success,
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    marginLeft: spacing.xs,
    flex: 1,
    textAlign: 'center',
  },
  textNoIcon: {
    marginLeft: 0,
  },
});

export default SuccessMessage;
