import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, colors } from '@/shared/themes';
import { SkeletonBlock, SkeletonLine } from '@/shared/components/skeleton';

// Skeleton layout mirroring the interactive Deposit screen to avoid layout shift
const DepositSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Amount + account number placeholder */}
      <View style={styles.amountWrapper}>
        <SkeletonBlock width={200} height={34} borderRadius={10} style={styles.centerSelf} />
        <SkeletonLine width={140} height={14} style={[styles.centerSelf, styles.mtXs]} />
      </View>

      {/* Transfer content card */}
      <View style={styles.transferCard}>
        <SkeletonLine width={160} height={16} />
        <SkeletonLine width={'75%'} height={14} style={styles.mtXs} />
        <SkeletonLine width={'55%'} height={14} style={styles.mtXs} />
      </View>

      {/* Bank selection card */}
      <View style={styles.bankCard}>
        <SkeletonBlock width={48} height={48} borderRadius={12} />
        <View style={styles.bankText}>
          <SkeletonLine width={'70%'} height={16} />
          <SkeletonLine width={'45%'} height={12} style={styles.mtXs} />
        </View>
        <SkeletonBlock width={24} height={24} borderRadius={12} />
      </View>

      <View style={styles.flexGrow} />

      {/* Continue button placeholder (shows even if real button may be hidden when no amount yet) */}
      <SkeletonBlock height={48} width={'90%'} borderRadius={12} style={styles.continueBtn} />

      {/* Preset amount chips single row (mirror Deposit & Withdraw visible row) */}
      <View style={styles.chipsRow}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} height={40} width={90} borderRadius={spacing.md} style={styles.chip} />
        ))}
      </View>

      {/* Number pad (3 cols x 4 rows) */}
      <View style={styles.padGrid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={styles.padCell}>
            <SkeletonBlock height={56} borderRadius={16} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  amountWrapper: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  centerSelf: { alignSelf: 'center' },
  mtXs: { marginTop: spacing.xs },
  transferCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: spacing.lg,
  },
  bankCard: {
    marginTop: spacing.md,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bankText: { flex: 1 },
  flexGrow: { flex: 1 },
  continueBtn: { marginHorizontal: spacing.xl },
  chipsRow: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {},
  padGrid: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: spacing.lg,
  },
  padCell: { width: '33.33%', padding: 8 },
});

export default DepositSkeleton;
