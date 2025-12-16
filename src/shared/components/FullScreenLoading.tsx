import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, spacing } from '@/shared/themes';
import { Heading, Body } from '@/shared/components/base';

/**
 * FullScreenLoading Component
 *
 * A modal loading overlay with Lottie animation and customizable text.
 *
 * Translation Usage Examples:
 *
 * // Using shared translations (recommended)
 * const { t } = useTranslation('shared');
 *
 * // For loan applications:
 * <FullScreenLoading
 *   title={t('loading.loan.title')}
 *   subtitle={t('loading.loan.subtitle')}
 * />
 *
 * // For savings transactions:
 * <FullScreenLoading
 *   title={t('loading.savings.title')}
 *   subtitle={t('loading.savings.subtitle')}
 * />
 *
 * // For withdrawals:
 * <FullScreenLoading
 *   title={t('loading.withdrawal.title')}
 *   subtitle={t('loading.withdrawal.subtitle')}
 * />
 *
 * // For general transactions:
 * <FullScreenLoading
 *   title={t('loading.transaction.title')}
 *   subtitle={t('loading.transaction.subtitle')}
 * />
 *
 * // For payments:
 * <FullScreenLoading
 *   title={t('loading.payment.title')}
 *   subtitle={t('loading.payment.subtitle')}
 * />
 *
 * // For verification:
 * <FullScreenLoading
 *   title={t('loading.verification.title')}
 *   subtitle={t('loading.verification.subtitle')}
 * />
 *
 * // Default fallback:
 * <FullScreenLoading
 *   title={t('loading.default.title')}
 *   subtitle={t('loading.default.subtitle')}
 * />
 */

interface FullScreenLoadingProps {
  title?: string;
  subtitle?: string;
  showProgressBar?: boolean;
  preventBackButton?: boolean;
  onBackPress?: () => boolean;
  animationSource?: any;
  animationStyle?: any;
}

const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  title = 'Loading...',
  subtitle = 'Please wait while we process your request...',
  showProgressBar = true,
  preventBackButton = false,
  onBackPress,
  animationSource,
  animationStyle,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar
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
        return preventBackButton; // Prevent default back action if preventBackButton is true
      });

      return () => backHandler.remove();
    }
  }, [preventBackButton, onBackPress]);

  return (
    <View style={styles.overlay}>
      <View style={styles.backdrop} />
      <View style={styles.content}>
        <View style={styles.loadingArea}>
          <View style={styles.spinnerContainer}>
            <LottieView
              source={animationSource || require('@/shared/assets/lottie/plane-loading.json')}
              autoPlay
              loop
              style={animationStyle || styles.lottieAnimation}
            />
          </View>

          {showProgressBar && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <Heading level={2} style={styles.title}>
            {title}
          </Heading>

          <Body style={styles.subtitle}>
            {subtitle}
          </Body>


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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    maxWidth: 320,
    width: '80%',
  },
  loadingArea: {
    alignItems: 'center',
  },
  spinnerContainer: {
    // marginBottom: spacing.xl,
  },
  lottieAnimation: {
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
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});

export default FullScreenLoading;
