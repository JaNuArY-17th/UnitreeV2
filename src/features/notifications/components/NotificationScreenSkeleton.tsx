import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox, SkeletonLine, SkeletonCircle } from '@/shared/components/skeleton';
import { colors, spacing, dimensions } from '@/shared/themes';

const NotificationItemSkeleton = ({ isLast = false }: { isLast?: boolean }) => (
  <View style={styles.notificationItem}>
    <View style={styles.iconContainer}>
      <SkeletonCircle width={40} />
    </View>
    <View style={styles.itemContent}>
      <SkeletonLine width="90%" height={16} />
      <SkeletonLine width="70%" height={14} />
      <SkeletonLine width={80} height={12} style={styles.timeSkeleton} />
    </View>
  </View>
);

const NotificationScreenSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Section 1 - Today */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonLine width={70} height={18} />
        </View>
        <NotificationItemSkeleton />
        <NotificationItemSkeleton />
        <NotificationItemSkeleton />
      </View>

      {/* Section 2 - Yesterday */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonLine width={80} height={18} />
        </View>
        <NotificationItemSkeleton />
        <NotificationItemSkeleton />
      </View>

      {/* Section 3 - Earlier */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonLine width={65} height={18} />
        </View>
        <NotificationItemSkeleton />
        <NotificationItemSkeleton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.light,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
    gap: spacing.xs,
  },
  timeSkeleton: {
    marginTop: spacing.xs,
  },
});

export default NotificationScreenSkeleton;
