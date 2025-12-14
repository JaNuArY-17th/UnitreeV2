import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography, dimensions } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Notification01Icon } from '@hugeicons/core-free-icons';

interface StatisticHeaderProps {
  title?: string;
  onNotificationPress?: () => void;
  hasNotification?: boolean;
}

export const StatisticHeader: React.FC<StatisticHeaderProps> = ({
  title,
  onNotificationPress,
  hasNotification = false,
}) => {
  const { t } = useTranslation('report');

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title || t('statistics.title')}</Text>
          <Text style={styles.subtitle}>{t('statistics.subtitle')}</Text>
        </View>
        {onNotificationPress && (
          <Pressable style={styles.notificationButton} onPress={onNotificationPress}>
            <HugeiconsIcon icon={Notification01Icon} size={24} color={colors.light} />
            {hasNotification && <View style={styles.notificationDot} />}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    color: colors.light,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4040',
    borderWidth: 1,
    borderColor: colors.light,
  },
});
