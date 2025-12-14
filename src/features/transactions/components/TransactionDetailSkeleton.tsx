import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox, SkeletonLine, SkeletonCircle } from '@/shared/components/skeleton';
import { colors, spacing, dimensions } from '@/shared/themes';

const TransactionDetailSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Total Amount Section Skeleton */}
      <View style={styles.totalAmountSection}>
        <SkeletonLine width={120} height={20} style={styles.statusSkeleton} />
        <SkeletonBox width={200} height={48} style={styles.amountSkeleton} />
        <SkeletonLine width={100} height={16} style={styles.statusTextSkeleton} />
      </View>

      {/* Transactions List Skeleton */}
      <View style={styles.card}>
        {[1, 2].map((item) => (
          <View key={item} style={styles.transactionItem}>
            <View style={styles.iconContainer}>
              <SkeletonCircle width={48} />
            </View>
            <View style={styles.transactionContent}>
              <SkeletonLine width="70%" height={18} />
              <View style={styles.detailsRow}>
                <SkeletonLine width={40} height={14} />
                <SkeletonLine width="50%" height={14} />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Transfer Details Card Skeleton */}
      <View style={styles.card}>
        <SkeletonLine width={150} height={22} style={styles.cardTitle} />
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.detailRow}>
            <SkeletonLine width={100} height={16} />
            <SkeletonLine width={120} height={16} />
          </View>
        ))}
      </View>

      {/* Order Details Card Skeleton */}
      <View style={styles.card}>
        <View style={styles.orderHeader}>
          <SkeletonLine width={120} height={22} />
          <SkeletonLine width={80} height={18} />
        </View>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.detailRow}>
            <SkeletonLine width={90} height={16} />
            <SkeletonLine width={100} height={16} />
          </View>
        ))}
      </View>

      {/* Action Buttons Skeleton */}
      <View style={styles.actionButtons}>
        <SkeletonBox width="48%" height={50} borderRadius={dimensions.radius.md} />
        <SkeletonBox width="48%" height={50} borderRadius={dimensions.radius.md} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  totalAmountSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
  },
  statusSkeleton: {
    marginBottom: spacing.sm,
  },
  amountSkeleton: {
    borderRadius: dimensions.radius.sm,
    marginBottom: spacing.sm,
  },
  statusTextSkeleton: {
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    marginBottom: spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  transactionContent: {
    flex: 1,
    gap: spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});

export default TransactionDetailSkeleton;
