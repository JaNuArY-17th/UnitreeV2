import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, spacing } from '@/shared/themes';
import { Heading, Body } from '@/shared/components/base';

interface LoadingModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  animationSource?: any;
  animationStyle?: any;
  animationSpeed?: number; // 0.5 = half speed, 1 = normal, 2 = double speed
  duration?: number; // Duration in ms before auto-closing (optional)
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
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (animationRef.current && animationSpeed !== 1) {
      animationRef.current.setSpeed?.(animationSpeed);
    }
  }, [animationSpeed]);

  useEffect(() => {
    if (visible && duration) {
      const timer = setTimeout(() => {
        // Handle auto-close logic if needed
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);
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
    borderRadius: 16,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    maxWidth: 300,
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
});

export default LoadingModal;
