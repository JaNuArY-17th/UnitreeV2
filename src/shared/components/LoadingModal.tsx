import React from 'react';
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
  subtitle = 'Please wait while we process your request...',
  animationSource,
  animationStyle,
}) => {
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
              source={animationSource || require('@/shared/assets/lottie/plane-loading.json')}
              autoPlay
              loop
              style={animationStyle || styles.animation}
            />
          </View>

          {title && (
            <Heading level={2} style={styles.title}>
              {title}
            </Heading>
          )}

          {subtitle && (
            <Body style={styles.subtitle}>
              {subtitle}
            </Body>
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
