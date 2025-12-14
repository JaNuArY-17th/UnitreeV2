import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, spacing } from '@/shared/themes';
import { Heading, Body } from '@/shared/components/base';

interface WithdrawProcessingModalProps {
  title?: string;
  subtitle?: string;
  showProgressBar?: boolean;
  preventBackButton?: boolean;
  onBackPress?: () => boolean;
}

// Focused variant of FullScreenLoading with withdraw-specific defaults
const WithdrawProcessingModal: React.FC<WithdrawProcessingModalProps> = ({
  title = 'Processing Withdrawal',
  subtitle = 'Please wait while we process your withdrawal request...',
  showProgressBar = false,
  preventBackButton = true,
  onBackPress,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showProgressBar) {
      const animation = Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      });
      animation.start();
    }
  }, [showProgressBar, progressAnim]);

  useEffect(() => {
    if (preventBackButton || onBackPress) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (onBackPress) {
          return onBackPress();
        }
        return preventBackButton;
      });
      return () => backHandler.remove();
    }
  }, [preventBackButton, onBackPress]);

  return (
    <View style={styles.overlay}>
      <View style={styles.backdrop} />
      <View style={styles.content} accessibilityRole="alert" accessible>
        <View style={styles.loadingArea}>
          <LottieView
            source={require('@/shared/assets/lottie/plane-loading.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />

            {showProgressBar && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={{
                      ...styles.progressFill,
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }}
                  />
                </View>
              </View>
            )}

          <Heading level={2} style={styles.title}>{title}</Heading>
          <Body style={styles.subtitle}>{subtitle}</Body>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    maxWidth: 320,
    width: '80%',
  },
  loadingArea: {
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 140,
    height: 140,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
    lineHeight: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});

export default WithdrawProcessingModal;
