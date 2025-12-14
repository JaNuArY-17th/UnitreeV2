import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox, SkeletonLine, SkeletonCircle } from '@/shared/components/skeleton';
import { colors, spacing, dimensions } from '@/shared/themes';

const OrderDetailSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Order Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <SkeletonCircle width={60} />
        </View>
        <SkeletonLine width={120} height={24} style={styles.orderIdSkeleton} />
        <SkeletonBox width={100} height={28} borderRadius={dimensions.radius.round} style={styles.statusBadge} />
      </View>

      {/* Order Info Card */}
      <View style={styles.card}>
        <SkeletonLine width={120} height={20} style={styles.cardTitle} />
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.infoRow}>
            <SkeletonLine width={80} height={16} />
            <SkeletonLine width={100} height={16} />
          </View>
        ))}
      </View>

      {/* Order Items Card */}
      <View style={styles.card}>
        <SkeletonLine width={100} height={20} style={styles.cardTitle} />
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.orderItem}>
            <SkeletonBox width={60} height={60} borderRadius={dimensions.radius.md} />
            <View style={styles.itemContent}>
              <SkeletonLine width="80%" height={16} />
              <View style={styles.itemDetails}>
                <SkeletonLine width={50} height={14} />
                <SkeletonLine width={30} height={14} />
              </View>
              <SkeletonLine width={80} height={18} />
            </View>
          </View>
        ))}
      </View>

      {/* Payment Summary Card */}
      <View style={styles.card}>
        <SkeletonLine width={140} height={20} style={styles.cardTitle} />
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.paymentRow}>
            <SkeletonLine width={90} height={16} />
            <SkeletonLine width={70} height={16} />
          </View>
        ))}
        <View style={styles.totalRow}>
          <SkeletonLine width={80} height={20} />
          <SkeletonLine width={100} height={24} />
        </View>
      </View>

      {/* Action Buttons */}
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
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  orderIdSkeleton: {
    marginBottom: spacing.sm,
  },
  statusBadge: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  itemContent: {
    flex: 1,
    gap: spacing.xs,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});

export default OrderDetailSkeleton;
