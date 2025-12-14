import React from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, typography } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { RefreshIcon } from '@hugeicons/core-free-icons';

interface PostpaidErrorStateProps {
  onBackPress: () => void;
  onRetry: () => void;
}

const PostpaidErrorState: React.FC<PostpaidErrorStateProps> = ({ onBackPress, onRetry }) => {
  const { t } = useTranslation('account');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top, height: 180 + insets.top }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScreenHeader
          title={t('postpaid.title')}
          titleStyle={{ color: colors.light }}
          backIconColor={colors.light}
          showBack={true}
          onBackPress={onBackPress}
        />
      </View>
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{t('loan.loadError')}</Text>
        <Text style={styles.errorMessage}>{t('loan.loadErrorMessage')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <HugeiconsIcon icon={RefreshIcon} size={20} color={colors.primary} />
          <Text style={styles.retryText}>{t('common:retry', 'Thử lại')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: 200,
  },
  errorTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  retryText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default PostpaidErrorState;
