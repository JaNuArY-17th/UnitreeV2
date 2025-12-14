import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, dimensions, spacing, typography } from '@/shared/themes';
import { ModernBackgroundPattern } from '../../../shared/components';

interface BalanceCardSkeletonProps {
  backgroundColor?: string;
  showWithdrawable?: boolean;
  showAccountNumber?: boolean;
}

const BalanceCardSkeleton: React.FC<BalanceCardSkeletonProps> = ({
  backgroundColor = colors.primary,
  showWithdrawable = false,
  showAccountNumber = false,
}) => {
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
    outputRange: [0.3, 0.6],
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

  return (
    <View style={[styles.totalAssetsCard, { backgroundColor }]}>
      <ModernBackgroundPattern primaryColor={colors.light} />

      <View style={styles.cardContentWrapper}>
        <View style={styles.totalAssetsHeader}>
          {/* Account type title skeleton */}
          <View style={styles.accountTypeTitle}>
            <SkeletonBox width={100} height={14} />
          </View>

          {/* Account Number Section skeleton */}
          {showAccountNumber && (
            <View style={styles.accountSelector}>
              <SkeletonBox width={80} height={12} />
            </View>
          )}
        </View>

        {/* Balance amount skeleton */}
        <View style={styles.totalAssetsContent}>
          <SkeletonBox width={180} height={32} />
          <SkeletonBox width={20} height={20} style={{ borderRadius: 10 }} />
        </View>

        {/* Withdrawable balance skeleton */}
        {showWithdrawable && (
          <View style={styles.withdrawableSection}>
            <View style={styles.withdrawableHeader}>
              <SkeletonBox width={120} height={12} />
            </View>
            <View style={styles.totalAssetsContent}>
              <SkeletonBox width={150} height={24} />
              <SkeletonBox width={20} height={20} style={{ borderRadius: 10 }} />
            </View>
          </View>
        )}
      </View>

      {/* Check now button skeleton */}
      <View style={styles.checkContainer}>
        <SkeletonBox width={80} height={16} style={styles.checkTextSkeleton} />
        <SkeletonBox width={16} height={16} style={styles.checkIconSkeleton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  totalAssetsCard: {
    width: 300,
    marginHorizontal: spacing.sm,
    marginBottom: 12,
    gap: 8,
    borderRadius: 12,
    flexDirection: 'column',
    padding: 0,
  },
  cardContentWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  totalAssetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  accountTypeTitle: {
    flex: 1,
  },
  accountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.31)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  totalAssetsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: spacing.md,
  },
  withdrawableSection: {
    paddingHorizontal: 16,
    marginBottom: spacing.sm,
  },
  withdrawableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  checkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomLeftRadius: dimensions.radius.lg,
    borderBottomRightRadius: dimensions.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 30,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  checkTextSkeleton: {
    marginLeft: 0,
  },
  checkIconSkeleton: {
    marginRight: 0,
  },
  skeletonBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
});

export default BalanceCardSkeleton;
