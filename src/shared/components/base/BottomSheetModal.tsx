import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Modal, Platform, Animated, Keyboard, KeyboardEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/shared/themes';
import Text from './Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

export type BottomSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeightRatio?: number; // 0..1
  showHandle?: boolean;
  showClose?: boolean;
  headerContent?: React.ReactNode; // replaces title when provided
  footerContent?: React.ReactNode;
  testID?: string;
  fillToMaxHeight?: boolean;
  enableDynamicSizing?: boolean; // Allow content to determine height
  snapPoints?: (string | number)[]; // Custom snap points
  avoidKeyboard?: boolean; // Enable keyboard avoidance (default: true)
};

/**
 * Bottom sheet modal component using @gorhom/bottom-sheet BottomSheetModal
 * This provides better control for show/hide behavior compared to the regular BottomSheet
 */
const BottomSheetModalComponent: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  title,
  children,
  maxHeightRatio = 0.95,
  showHandle = true,
  headerContent,
  footerContent,
  testID,
  fillToMaxHeight,
  enableDynamicSizing = false,
  showClose = false,
  snapPoints: customSnapPoints,
  avoidKeyboard = true,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();

  // Animated values
  const translateY = useRef(new Animated.Value(1000)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Keyboard handling - expand height instead of translating
  useEffect(() => {
    if (!avoidKeyboard || !isModalVisible) return;

    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [avoidKeyboard, isModalVisible]);

  // Animate modal in/out
  useEffect(() => {
    if (visible) {
      // Reset giá trị ban đầu trước khi animate
      translateY.setValue(1000);
      backdropOpacity.setValue(0);
      setKeyboardHeight(0);

      // Hiện modal ngay lập tức
      setIsModalVisible(true);

      // Delay nhỏ để đảm bảo modal đã render
      requestAnimationFrame(() => {
        // Animate in
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 150,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else if (isModalVisible) {
      // Dismiss keyboard first
      Keyboard.dismiss();

      // Animate out trước khi ẩn modal
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 1000, // Trượt xuống
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Ẩn modal sau khi animation hoàn tất
        setIsModalVisible(false);
      });
    }
  }, [visible, isModalVisible, translateY, backdropOpacity]);

  // Calculate snap points based on configuration
  const snapPoints = useMemo(() => {
    // Use custom snap points if provided
    if (customSnapPoints) {
      return customSnapPoints;
    }

    // If dynamic sizing is enabled, use percentage-based snap points
    // Avoid calculating height values that can cause worklets serialization issues
    if (enableDynamicSizing) {
      const maxHeightPercentage = `${Math.round(maxHeightRatio * 100)}%`;
      if (fillToMaxHeight) {
        return [maxHeightPercentage];
      }
      const halfHeightPercentage = `${Math.round(maxHeightRatio * 50)}%`;
      return [halfHeightPercentage, maxHeightPercentage];
    }

    // Always use percentage-based snap points to avoid layout measurement errors
    // This prevents worklets serialization issues with numeric height values
    const maxHeightPercentage = `${Math.round(maxHeightRatio * 100)}%`;
    if (fillToMaxHeight) {
      return [maxHeightPercentage];
    }
    const halfHeightPercentage = `${Math.round(maxHeightRatio * 50)}%`;
    return [halfHeightPercentage, maxHeightPercentage];
  }, [customSnapPoints, enableDynamicSizing, fillToMaxHeight, maxHeightRatio]);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  // Don't render at all if never visible
  if (!isModalVisible) {
    return null;
  }

  const { height: screenHeight } = Dimensions.get('window');
  // Expand maxHeight when keyboard is visible to keep modal anchored at bottom
  const baseMaxHeight = Math.round(screenHeight * maxHeightRatio);
  const maxHeight = keyboardHeight > 0
    ? Math.min(baseMaxHeight + keyboardHeight, screenHeight - insets.top)
    : baseMaxHeight;

  // Calculate safe bottom padding
  const bottomPadding = Math.max(insets.bottom, spacing.md);

  // Calculate content height based on fillToMaxHeight or use flexible sizing
  const contentHeight = fillToMaxHeight
    ? maxHeight - 100 // Reserve space for header/footer/padding
    : undefined; // Let content determine its own height

  return (
    <Modal
      visible={isModalVisible}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop/Overlay - với fade in animation */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            }
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sheet - với slide up/down animation */}
        <Animated.View
          style={[
            styles.container,
            {
              maxHeight,
              paddingBottom: keyboardHeight > 0 ? keyboardHeight : bottomPadding,
              transform: [{ translateY }],
            }
          ]}
          testID={testID}
        >
          {/* Handle dash - thanh nhỏ phía trên giống gorhom */}
          {showHandle && (
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          )}

          {/* Header */}
          {headerContent ? (
            <View style={styles.header}>{headerContent}</View>
          ) : title ? (
            <View style={styles.headerRow}>
              {showClose ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onClose}
                  hitSlop={8}
                  style={styles.headerSide}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={20} color={colors.text.primary} />
                </Pressable>
              ) : (
                <View style={styles.headerSide} />
              )}
              <Text variant="title" style={styles.title}>{title}</Text>
              <View style={styles.headerSide} />
            </View>
          ) : null}

          {/* Content */}
          <View style={[styles.content, contentHeight ? { height: contentHeight } : {}]}>
            {children}
          </View>

          {/* Footer */}
          {footerContent ? <View style={styles.footer}>{footerContent}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    backgroundColor: colors.light,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  handle: {
    width: 50,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerSide: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    paddingTop: spacing.lg,
    ...typography.h3,
    lineHeight: 0,
  },
  content: {
    // minHeight: 200,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});

export default BottomSheetModalComponent;
