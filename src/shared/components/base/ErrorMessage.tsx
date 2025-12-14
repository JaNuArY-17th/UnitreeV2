import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import Body from './Body';
import { ErrorIcon } from '@/shared/assets/icons';

interface ErrorMessageProps {
  message?: string | null;
  visible?: boolean;
  style?: any;
  iconSize?: number;
  showIcon?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  onHide?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  visible = true,
  style,
  iconSize = 18,
  showIcon = true,
  autoHide = false,
  autoHideDelay = 5000,
  onHide,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (message && visible) {
      // Show error with animation
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
      // Hide error with animation
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
          <ErrorIcon width={iconSize} height={iconSize} color={colors.danger} />
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
    backgroundColor: colors.dangerSoft,
    padding: spacing.sm,
    borderRadius: 12,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.danger + '20',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.body,
    color: colors.danger,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    marginLeft: spacing.xs,
    flex: 1,
    textAlign: 'center',
  },
  textNoIcon: {
    marginLeft: 0,
  },
});

export default ErrorMessage;
