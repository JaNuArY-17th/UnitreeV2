import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { PostpaidStatus } from '../types/accountType';

interface BlurCardWrapperProps {
  children: React.ReactNode;
  status: PostpaidStatus;
  isLoading?: boolean;
  onActivatePress?: () => void;
  onReactivatePress?: () => void;
}

export const BlurCardWrapper: React.FC<BlurCardWrapperProps> = ({
  children,
  status,
  isLoading = false,
  onActivatePress,
  onReactivatePress,
}) => {
  const { t } = useTranslation('account');

  const renderStatusButton = () => {
    switch (status) {
      case 'INACTIVE':
        return (
          <Pressable
            style={[styles.actionButton, styles.activateButton]}
            onPress={onActivatePress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.light} />
            ) : (
              <Text style={styles.buttonText}>
                {t('loan.requestActivation', 'Yêu cầu kích hoạt')}
              </Text>
            )}
          </Pressable>
        );

      case 'PENDING':
        return (
          <View style={[styles.actionButton, styles.pendingButton]}>
            <Text style={[styles.buttonText, styles.pendingText]}>
              {t('loan.pendingApproval', 'Đang chờ phê duyệt')}
            </Text>
          </View>
        );

      case 'LOCKED':
        return (
          <Pressable
            style={[styles.actionButton, styles.reactivateButton]}
            onPress={onReactivatePress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.light} />
            ) : (
              <Text style={styles.buttonText}>
                {t('loan.requestReactivation', 'Yêu cầu mở khóa')}
              </Text>
            )}
          </Pressable>
        );

      case 'ACTIVE':
      default:
        return null;
    }
  };

  const shouldShowBlur = status !== 'ACTIVE';

  if (!shouldShowBlur) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {children}
      <View style={styles.overlay}>
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor={colors.light}
        />
        <View style={styles.buttonContainer}>
          {renderStatusButton()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: dimensions.radius.lg,
    overflow: 'hidden',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonContainer: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: dimensions.radius.lg,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activateButton: {
    backgroundColor: colors.primary,
  },
  reactivateButton: {
    backgroundColor: colors.warning,
  },
  pendingButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: dimensions.fontSize.lg,

    color: colors.light,
    textAlign: 'center',
  },
  pendingText: {
    color: colors.primary,
  },
});
