import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { Body, Heading } from '@/shared/components/base';

interface TransferProcessingModalProps {
  title?: string;
  subtitle?: string;
  preventBackButton?: boolean;
}

const TransferProcessingModal: React.FC<TransferProcessingModalProps> = ({
  title = 'Processing Transfer',
  subtitle = 'Please wait while we process your transfer...',
  preventBackButton = false,
}) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (preventBackButton) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [preventBackButton]);

  return (
    <Modal visible={true} transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('@/shared/assets/lottie/plane-loading.json')}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>

            <Heading style={styles.title}>{title}</Heading>
            <Body style={styles.subtitle}>{subtitle}</Body>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.xxl,
    marginHorizontal: spacing.xl,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: '90%',
  },
  content: {
    alignItems: 'center',
  },
  animationContainer: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 20,

    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TransferProcessingModal;
