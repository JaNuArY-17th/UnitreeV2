import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  ViewStyle,
  PanResponder,
  PanResponderInstance,
} from 'react-native';
import { colors } from '@/shared/themes/colors';
import { FONT_WEIGHTS, getFontFamily } from '@/shared/themes/fonts';
import { dimensions, spacing } from '@/shared/themes';
import { EnsogoFlowerLogo } from '@/shared/assets/images';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowDown01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

interface NotificationToastProps {
  visible: boolean;
  title: string;
  message: string;
  onHide: () => void;
  onPress?: () => void; // Xử lý khi người dùng nhấn vào toast để điều hướng
  position?: 'top' | 'bottom' | 'center'; // Position of the toast
}

const NotificationToast = ({
  visible,
  title,
  message,
  onHide,
  onPress,
  position = 'top',
}: NotificationToastProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const autoHideTimeoutRef = useRef<number | null>(null);
  const userInteractedRef = useRef(false);

  // Sử dụng useMemo để tránh tạo lại Animated.Value trong mỗi render
  const translateY = useMemo(() => {
    // Start position based on toast position
    switch (position) {
      case 'top':
        return new Animated.Value(-100);
      case 'bottom':
        return new Animated.Value(100);
      case 'center':
        return new Animated.Value(0);
      default:
        return new Animated.Value(-100);
    }
  }, [position]);

  // Animation for expand/collapse
  const expandAnim = useMemo(() => new Animated.Value(0), []);

  // Định nghĩa hideToast dùng useCallback để tránh tạo lại hàm trong mỗi render
  const hideToast = useCallback(() => {
    // Clear any existing timeout
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
      autoHideTimeoutRef.current = null;
    }

    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsExpanded(false);
      expandAnim.setValue(0);
      onHide();
    });
  }, [translateY, onHide, expandAnim]);

  // Pan responder for swipe up gesture when collapsed
  const panResponder = useMemo(() => {
    let startY = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !isExpanded, // Only respond when collapsed
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isExpanded && Math.abs(gestureState.dy) > 10; // Only vertical movement
      },
      onPanResponderGrant: (_, gestureState) => {
        startY = gestureState.y0;
      },
      onPanResponderMove: (_, gestureState) => {
        // Optional: Add visual feedback for swipe
        const swipeDistance = startY - gestureState.moveY;
        if (swipeDistance > 0) {
          // Swiping up
          const progress = Math.min(swipeDistance / 100, 1); // Max 100px for full effect
          // Could add opacity or scale animation here
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeDistance = startY - gestureState.moveY;
        const swipeVelocity = gestureState.vy;

        // If swiped up more than 50px or fast enough
        if ((swipeDistance > 50 || swipeVelocity < -0.5) && !isExpanded) {
          hideToast();
        }
      },
    });
  }, [isExpanded, hideToast]);

  // Xử lý sự kiện nhấp vào thông báo để mở rộng/thu gọn
  const handleExpandPress = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    userInteractedRef.current = true; // Mark that user has interacted

    // Animate expand/collapse
    Animated.spring(expandAnim, {
      toValue: newExpanded ? 1 : 0,
      useNativeDriver: false, // Need false for height animation
      friction: 8,
    }).start();

    // Manage auto-hide timeout based on expanded state
    if (newExpanded) {
      // Clear timeout when expanding
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
        autoHideTimeoutRef.current = null;
      }
    } else {
      // Set timeout when collapsing
      const timeoutId = setTimeout(() => {
        hideToast();
      }, 5000);
      autoHideTimeoutRef.current = timeoutId;
    }

    // Note: No navigation on expand/collapse, only when pressing main content area
  }, [isExpanded, expandAnim, hideToast]);

  // Xử lý sự kiện nhấp vào nội dung chính để điều hướng
  const handleContentPress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  useEffect(() => {
    if (visible) {
      // Reset expanded state when showing new toast
      setIsExpanded(false);
      expandAnim.setValue(0);
      userInteractedRef.current = false; // Reset interaction flag

      // Clear any existing timeout
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
        autoHideTimeoutRef.current = null;
      }

      // Show the toast
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start(() => {
        // Only set auto-hide timeout if user hasn't interacted yet
        if (!userInteractedRef.current) {
          const timeoutId = setTimeout(() => {
            hideToast();
          }, 5000);
          autoHideTimeoutRef.current = timeoutId;
        }
      });
    } else {
      // Clear timeout when hiding
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
        autoHideTimeoutRef.current = null;
      }
    }
  }, [visible, hideToast, translateY, expandAnim]);

  const containerStyle = useMemo(() => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 999,
      paddingHorizontal: spacing.md,
      transform: [{ translateY }],
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: -30,
          paddingTop: Platform.OS === 'android' ? 70 : 80, // Account for status bar
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: 0,
          paddingBottom: 20, // Safe area padding
        };
      case 'center':
        return {
          ...baseStyle,
          top: '50%' as any, // Type assertion needed for percentage
          marginTop: -50, // Half of toast height for centering
        };
      default:
        return {
          ...baseStyle,
          top: 0,
          paddingTop: Platform.OS === 'android' ? 20 : 80,
        };
    }
  }, [position, translateY]);

  const chevronRotation = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  if (!visible) { return null; }

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.notificationCard} {...panResponder.panHandlers}>
        {/* App Icon/Avatar */}
        <View style={styles.iconContainer}>
          <View style={styles.appIcon}>
            <EnsogoFlowerLogo width={17} height={17} color="white" />
          </View>
        </View>

        {/* Content - Main pressable area for navigation */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleContentPress}
          style={[styles.contentContainer, isExpanded && styles.expandedContentContainer]}
        >
          <View style={styles.textContainer}>
            {isExpanded ? (
              // Expanded layout: title and message in separate rows
              <View style={styles.expandedTextContainer}>
                <Text
                  style={[styles.title, styles.expandedTitle]}
                >
                  {title}
                </Text>
                <Text
                  style={[styles.message, styles.expandedMessage]}
                  numberOfLines={0}
                >
                  {message}
                </Text>
              </View>
            ) : (
              // Collapsed layout: title and message in same row
              <View style={styles.textRow}>
                <Text
                  style={styles.title}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>
                <Text style={styles.space}> </Text>
                <Text
                  style={styles.message}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {message}
                </Text>
              </View>
            )}
          </View>

          {/* Expand/Collapse button - only show when collapsed */}
          {!isExpanded && (
            <TouchableOpacity
              style={[styles.expandButton]}
              onPress={handleExpandPress}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
                <HugeiconsIcon icon={ArrowDown01Icon} size={16} color={colors.text.secondary} />
              </Animated.View>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Close button - only show when expanded */}
        {isExpanded && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideToast}
            activeOpacity={0.7}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingTop: Platform.OS === 'android' ? 20 : 80, // Account for status bar
    paddingHorizontal: spacing.md,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  iconContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginRight: spacing.md,
  },
  appIcon: {
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm, // Add padding for close button when expanded
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    maxWidth: '33%',
    color: colors.text.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  space: { width: 4 },
  message: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    lineHeight: 18,
  },
  closeButton: {
    width: 24,
    height: 24,
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dimensions.radius.round,
  },
  expandedMessage: {
    flexWrap: 'wrap',
  },
  expandButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  expandedTextContainer: {
    gap: spacing.xs, // Space between title and message rows
  },
  expandedContentContainer: {
    flex: 1, // Take full width when expanded
  },
  expandedTitle: {
    maxWidth: undefined, // Remove width restriction when expanded
  },
});

export default NotificationToast;
