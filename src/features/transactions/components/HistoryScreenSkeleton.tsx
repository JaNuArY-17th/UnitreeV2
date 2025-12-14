import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox, SkeletonLine, SkeletonCircle } from '@/shared/components/skeleton';
import { colors, spacing, dimensions } from '@/shared/themes';

const HistoryItemSkeleton = ({ isLast = false }: { isLast?: boolean }) => (
  <View>
    <View style={styles.historyItem}>
      <View style={styles.iconContainer}>
        <SkeletonCircle width={24} />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.leftContent}>
          <SkeletonLine width="85%" height={16} />
          <SkeletonLine width="60%" height={12} />
        </View>
        <View style={styles.rightContent}>
          <SkeletonLine width={80} height={16} />
          <View style={{ height: 12 }} />
        </View>
      </View>
    </View>
    {!isLast && <View style={styles.separator} />}
  </View>
);

const HistoryScreenSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Search Bar Skeleton */}
      <View style={styles.searchSection}>
        <SkeletonBox width="100%" height={44} borderRadius={dimensions.radius.md} />
      </View>

      {/* Filter Bar Skeleton */}
      <View style={styles.filterBar}>
        <View style={styles.filterButtons}>
          <SkeletonBox width={70} height={32} borderRadius={dimensions.radius.round} />
          <SkeletonBox width={80} height={32} borderRadius={dimensions.radius.round} />
          <SkeletonBox width={75} height={32} borderRadius={dimensions.radius.round} />
        </View>
        <View style={styles.summarySection}>
          <SkeletonLine width={120} height={14} />
          <SkeletonLine width={100} height={18} />
        </View>
      </View>

      {/* Section 1 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonLine width={80} height={16} />
        </View>
        <HistoryItemSkeleton />
        <HistoryItemSkeleton />
        <HistoryItemSkeleton isLast />
      </View>

      {/* Section 2 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonLine width={70} height={16} />
        </View>
        <HistoryItemSkeleton />
        <HistoryItemSkeleton isLast />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  searchSection: {
    marginBottom: spacing.md,
  },
  filterBar: {
    marginBottom: spacing.md,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    backgroundColor: colors.lightGray,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: dimensions.radius.md,
    marginBottom: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.md,
    paddingTop: spacing.xs / 2,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  leftContent: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: spacing.xs / 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginLeft: spacing.sm * 2 + 24,
    opacity: 0.3,
  },
});

export default HistoryScreenSkeleton;
