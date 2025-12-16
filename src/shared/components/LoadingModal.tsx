import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Modal, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, dimensions, spacing, typography } from '@/shared/themes';
import { Heading, Body } from '@/shared/components/base';

interface LoadingModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  animationSource?: any;
  animationStyle?: any;
  animationSpeed?: number; // 0.5 = half speed, 1 = normal, 2 = double speed
  duration?: number; // Duration in ms before showing completion message
  completionMessage?: string; // Message to show when loading completes
  completionAnimationSource?: any; // Animation to show on completion
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
  completionMessage,
  completionAnimationSource,
}) => {
  const animationRef = useRef<LottieView>(null);
  const [isComplete, setIsComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const successFadeAnim = useRef(new Animated.Value(0)).current;

  // Get default success animation
  const defaultSuccessAnimation = require('@/shared/assets/lottie/Success.json');
  const successAnimation = completionAnimationSource || defaultSuccessAnimation;

  useEffect(() => {
    if (visible) {
      setIsComplete(false);
      fadeAnim.setValue(1);
      successFadeAnim.setValue(0);
    }
  }, [visible, fadeAnim, successFadeAnim]);

  useEffect(() => {
    if (visible && duration) {
      const timer = setTimeout(() => {
        setIsComplete(true);
        // Fade out loading animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        // Fade in success animation
        Animated.timing(successFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, successFadeAnim]);
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <View style={styles.overlay} />
        <View style={styles.modalContent}>
          {!isComplete ? (
            <>
              <Animated.View style={[styles.animationContainer, { opacity: fadeAnim }]}>
                <LottieView
                  ref={animationRef}
                  source={animationSource || require('@/shared/assets/lottie/plane-loading.json')}
                  autoPlay
                  loop
                  speed={animationSpeed}
                  style={animationStyle || styles.animation}
                />
              </Animated.View>

              {title && (
                <Heading level={2} style={styles.title}>
                  {title}
                </Heading>
              )}
            </>
          ) : (
            <>
              <Animated.View style={[styles.animationContainer, { opacity: successFadeAnim }]}>
                <LottieView
                  source={successAnimation}
                  autoPlay
                  loop={false}
                  style={animationStyle || styles.animation}
                />
              </Animated.View>
              {completionMessage && (
                <Body style={styles.completionMessage}>
                  {completionMessage}
                </Body>
              )}
            </>
          )}

          {/* {subtitle && (
            <Body style={styles.subtitle}>
              {subtitle}
            </Body>
          )} */}
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
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 9999,
    width: 240,
    height: 240,
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {

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
  completionMessage: {
    ...typography.title,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default LoadingModal;
