import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/base';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { MoreHorizontalIcon, Notification01Icon } from '@hugeicons/core-free-icons';
import { NotificationItem as NotificationItemType } from '../types/notification';
import { formatTimeAgo } from '@/shared/utils';

interface Props {
  item: NotificationItemType;
  onPress?: (item: NotificationItemType) => void;
}

export const NotificationItem: React.FC<Props> = ({ item, onPress }) => {
  const isUnread = typeof item.unread === 'boolean' ? item.unread : (typeof (item as any).read === 'boolean' ? !(item as any).read : false);

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <HugeiconsIcon icon={Notification01Icon} size={24} color={colors.primary} />
      </View>

      <View style={styles.contentWithDot}>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        {/*
        <TouchableOpacity style={styles.moreButton}>
          <HugeiconsIcon icon={MoreHorizontalIcon} size={24} color={colors.text.primary} />
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  unreadContainer: {
    backgroundColor: colors.primaryLight,
  },
  iconContainer: {
    marginRight: spacing.md,
    marginTop: 4,
  },
  contentWithDot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    marginBottom: 2,
  },
  body: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'justify',
  },
  time: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 4,
  },
  moreButton: {
    padding: 4,
  },
});
