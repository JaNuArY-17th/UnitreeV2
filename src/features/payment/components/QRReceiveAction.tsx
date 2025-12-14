import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/shared/components/base';
import { colors, spacing, shadows, FONT_WEIGHTS, getFontFamily } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { QRReceiveActionProps } from '../types';

const QRReceiveAction: React.FC<QRReceiveActionProps> = ({ onPress }) => {
  const { t } = useTranslation('payment');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📱</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>
            {t('receiveAction.title')}
          </Text>
          <Text style={styles.description}>
            {t('receiveAction.description')}
          </Text>
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.primaryLight,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,

    color: colors.text.primary,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: colors.text.secondary,

  },
});

export default QRReceiveAction;
