import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, dimensions } from '@/shared/themes';
import { SkeletonBox } from '@/shared/components/skeleton';

export const QRCardSkeleton: React.FC = () => {
  return (
    <View style={styles.qrCard}>
      {/* User Info Skeleton */}
      <View style={styles.userInfo}>
        {/* User Name Skeleton */}
        <SkeletonBox style={styles.userNameSkeleton} />
        
        {/* User ID Container Skeleton */}
        <View style={styles.userIdContainer}>
          <SkeletonBox style={styles.userIdSkeleton} />
          <SkeletonBox style={styles.copyButtonSkeleton} />
        </View>
      </View>

      {/* QR Card Content Skeleton */}
      <View style={styles.qrCardContent}>
        {/* Payment Methods Text Skeleton */}
        <View style={styles.paymentMethods}>
          <SkeletonBox style={styles.paymentMethodsTextSkeleton} />
        </View>

        {/* QR Code Container Skeleton */}
        <View style={styles.qrImageContainer}>
          <SkeletonBox style={styles.qrCodeSkeleton} />
        </View>

        {/* Add Amount Button Skeleton */}
        <View style={styles.addAmountButton}>
          <SkeletonBox style={styles.addAmountIconSkeleton} />
          <SkeletonBox style={styles.addAmountTextSkeleton} />
        </View>
      </View>

      {/* Action Buttons Skeleton */}
      <View style={styles.actionButtons}>
        <View style={styles.actionButton}>
          <SkeletonBox style={styles.actionIconSkeleton} />
          <SkeletonBox style={styles.actionTextSkeleton} />
        </View>
        
        <View style={styles.verticalDivider} />
        
        <View style={styles.actionButton}>
          <SkeletonBox style={styles.actionIconSkeleton} />
          <SkeletonBox style={styles.actionTextSkeleton} />
        </View>
        
        <View style={styles.verticalDivider} />
        
        <View style={styles.actionButton}>
          <SkeletonBox style={styles.actionIconSkeleton} />
          <SkeletonBox style={styles.actionTextSkeleton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  qrCard: {
    margin: spacing.lg,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    overflow: 'hidden',
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  userNameSkeleton: {
    width: 150,
    height: 24,
    borderRadius: dimensions.radius.sm,
    marginTop: spacing.sm,
  },
  userIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  userIdSkeleton: {
    width: 100,
    height: 18,
    borderRadius: dimensions.radius.sm,
    marginRight: spacing.sm,
  },
  copyButtonSkeleton: {
    width: 24,
    height: 24,
    borderRadius: dimensions.radius.sm,
  },
  qrCardContent: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  paymentMethods: {
    marginBottom: spacing.sm,
    width: '70%',
    alignItems: 'center',
  },
  paymentMethodsTextSkeleton: {
    width: '100%',
    height: 14,
    borderRadius: dimensions.radius.sm,
  },
  qrImageContainer: {
    width: 230,
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  qrCodeSkeleton: {
    width: 220,
    height: 220,
    borderRadius: dimensions.radius.md,
  },
  addAmountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addAmountIconSkeleton: {
    width: 20,
    height: 20,
    borderRadius: dimensions.radius.round,
    marginRight: spacing.sm,
  },
  addAmountTextSkeleton: {
    width: 100,
    height: 16,
    borderRadius: dimensions.radius.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  actionIconSkeleton: {
    width: 20,
    height: 20,
    borderRadius: dimensions.radius.sm,
  },
  actionTextSkeleton: {
    width: 50,
    height: 12,
    borderRadius: dimensions.radius.sm,
    marginTop: spacing.xs,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
});
