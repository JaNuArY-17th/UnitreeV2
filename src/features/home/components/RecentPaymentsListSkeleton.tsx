import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, dimensions, typography } from '@/shared/themes';

const RecentPaymentsListSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBox = ({ width, height, style }: { width: number | string; height: number; style?: any }) => (
    <Animated.View
      style={[
        styles.skeletonBox,
        { width, height, opacity },
        style,
      ]}
    />
  );

  const HistoryItemSkeleton = ({ isLast = false }: { isLast?: boolean }) => (
    <View>
      <View style={styles.historyItemContainer}>
        {/* Icon with proper margin */}
        <View style={styles.iconContainer}>
          <SkeletonBox width={24} height={24} style={styles.iconSkeleton} />
        </View>

        {/* Item content wrapper */}
        <View style={styles.itemContent}>
          {/* Left content */}
          <View style={styles.leftContent}>
            <SkeletonBox width="85%" height={16} style={{ marginBottom: spacing.xs / 2 }} />
            <SkeletonBox width="60%" height={12} />
          </View>

          {/* Right content */}
          <View style={styles.rightContent}>
            <SkeletonBox width={80} height={16} style={{ marginBottom: spacing.xs / 2 }} />
            {/* Empty space for state */}
            <View style={{ height: 12 }} />
          </View>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </View>
  );

  return (
    <View style={styles.containerWrapper}>
      {/* Header Skeleton */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <SkeletonBox width={150} height={20} />
          <SkeletonBox width={80} height={16} />
        </View>
      </View>

      {/* Section Header Skeleton */}
      <View style={styles.sectionHeaderContainer}>
        <View style={styles.sectionHeader}>
          <SkeletonBox width={70} height={14} />
        </View>
      </View>

      {/* History Items Skeleton */}
      <HistoryItemSkeleton />
      <HistoryItemSkeleton />
      <HistoryItemSkeleton isLast />
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    // Removed marginBottom to match actual component
  },
  headerSection: {
    marginBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderContainer: {
    // Removed backgroundColor to match actual component
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // Removed paddingVertical, paddingHorizontal, backgroundColor, and borderRadius to match actual component
  },
  historyItemContainer: {
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
    marginLeft: spacing.sm * 2 + 24, // Icon width + margins
    opacity: 0.3,
  },
  skeletonBox: {
    backgroundColor: colors.lightGray,
    borderRadius: dimensions.radius.sm,
  },
  iconSkeleton: {
    borderRadius: 12,
  },
});

export default RecentPaymentsListSkeleton;
