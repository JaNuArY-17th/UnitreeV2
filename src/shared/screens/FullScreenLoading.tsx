
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler, ActivityIndicator, Text } from 'react-native';
import { colors, spacing, typography } from '@/shared/themes';
import { Heading, Body } from '@/shared/components/base';

export interface FullScreenLoadingProps {
  title?: string;
  subtitle?: string;
  showProgressBar?: boolean;
  preventBackButton?: boolean;
  onBackPress?: () => boolean;
  style?: any;
  animationSource?: any; // Deprecated - kept for backward compatibility
  animationStyle?: any; // Deprecated - kept for backward compatibility
}

const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  title = 'Loading...',
  subtitle = 'Please wait while we process your request...',
  showProgressBar = false,
  preventBackButton = false,
  onBackPress,
  style,
}) => {
  React.useEffect(() => {
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
    <View style={[styles.overlay, style]}>
      <View style={styles.backdrop} />
      <View style={styles.content}>
        <View style={styles.loadingArea}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>

          {/* <Body style={styles.subtitle}>{subtitle}</Body> */}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    // maxWidth: 320,
    width: '85%',
  },
  loadingArea: {
    alignItems: 'center',
  },
  spinnerContainer: {
    // marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    ...typography.title,
    // color: colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
    lineHeight: 22,
  },
});

export default FullScreenLoading;
