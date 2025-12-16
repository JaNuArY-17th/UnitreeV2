import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, dimensions, spacing } from '@/shared/themes';
import { Heading, Body } from '@/shared/components/base';

interface LoadingModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  animationSource?: any;
  animationStyle?: any;
  animationSpeed?: number; // 0.5 = half speed, 1 = normal, 2 = double speed
  duration?: number; // Duration in ms before auto-closing (optional)
  isLoading?: boolean; // Whether animation is loading (true) or showing message (false)
  message?: string; // Optional message to show after loading completes
  onComplete?: () => void; // Callback when loading completes or modal is tapped
}

/**
 * LoadingModal Component
 * 
 * Displays a modal overlay with Lottie animation at the center of the screen
 * 
 * Usage:
 * const plantAnimation = getLoadingAnimation('plant');
 * <LoadingModal
 *   visible={isLoading}
 *   title="Creating Account..."
 *   subtitle="Please wait"
 *   animationSource={plantAnimation.source}
 *   animationStyle={plantAnimation.style}
 * />
 */
const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  title = 'Loading...',
  // subtitle = 'Please wait while we process your request...',
  animationSource,
  animationStyle,
  animationSpeed = 1,
  duration,
  isLoading = true,
  message,
  onComplete,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible && duration) {
      const timer = setTimeout(() => {
        // Handle auto-close logic if needed
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  useEffect(() => {
    if (visible && !isLoading && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, isLoading, onComplete]);

  const handleModalPress = () => {
    if (!isLoading && onComplete) {
      onComplete();
    }
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <View style={[styles.overlay, !isLoading && styles.overlayTappable]} onTouchEnd={handleModalPress} />
        <View style={[styles.modalContent, isLoading && styles.modalContentCircle]} onTouchEnd={handleModalPress}>
          {isLoading ? (
            <>
              <View style={styles.animationContainer}>
                <LottieView
                  ref={animationRef}
                  source={animationSource || require('@/shared/assets/lottie/plane-loading.json')}
                  autoPlay
                  loop
                  speed={animationSpeed}
                  style={animationStyle || styles.animation}
                />
              </View>
              {title && (
                <Heading level={2} style={styles.title}>
                  {title}
                </Heading>
              )}
            </>
          ) : (
            <View style={styles.messageContainer}>
              {title && (
                <Heading level={2} style={styles.title}>
                  {title}
                </Heading>
              )}
              {message && (
                <Body style={styles.message}>
                  {message}
                </Body>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTappable: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.round,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    width: '70%',
  },
  modalContentCircle: {
    borderRadius: 300,
    width: 250,
    height: 250,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  animationContainer: {
    marginBottom: spacing.lg,
  },
  animation: {
    width: 150,
    height: 150,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
    lineHeight: 22,
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    color: colors.text.primary,
    lineHeight: 22,
  },
});

export default LoadingModal;
