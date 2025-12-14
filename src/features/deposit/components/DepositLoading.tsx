import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { SkeletonBlock, SkeletonLine } from '@/shared/components/skeleton';

// Skeleton layout to mirror DepositScreen while data is loading
const DepositLoading = () => (
  <View style={styles.container}>
    {/* Amount + account number */}
    <View style={styles.amountSection}>
      <SkeletonBlock width={220} height={32} style={styles.centerSelf} />
      <SkeletonLine width={160} style={[styles.centerSelf, styles.mtXs]} />
    </View>

    {/* Transfer content card */}
    <View style={styles.card}>
      <SkeletonLine width={140} />
      <SkeletonLine width={'85%'} style={styles.mtXs} />
      <SkeletonLine width={'60%'} style={styles.mtXs} />
    </View>

    <View style={styles.bottomSection}>
      {/* Continue button placeholder */}
      <SkeletonBlock height={48} style={styles.continue} />

      {/* Preset amount chips (2 rows x 3) */}
      <View style={styles.chipsRow}>
        <SkeletonBlock height={40} style={styles.chip} />
        <SkeletonBlock height={40} style={styles.chip} />
        <SkeletonBlock height={40} style={styles.chip} />
      </View>
      <View style={[styles.chipsRow, styles.mtSm]}>
        <SkeletonBlock height={40} style={styles.chip} />
        <SkeletonBlock height={40} style={styles.chip} />
        <SkeletonBlock height={40} style={styles.chip} />
      </View>

      {/* Number pad grid (3 columns x 4) */}
      <View style={styles.padGrid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={styles.padCell}>
            <SkeletonBlock height={56} borderRadius={16} />
          </View>
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  amountSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  centerSelf: { alignSelf: 'center' },
  mtXs: { marginTop: spacing.xs },
  mtSm: { marginTop: spacing.sm },
  card: {
    marginTop: spacing.md,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: spacing.lg,
  },
  bottomSection: { marginTop: 'auto', paddingBottom: spacing.lg },
  continue: { marginHorizontal: spacing.xl, borderRadius: 12 },
  chipsRow: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: { flex: 1, borderRadius: spacing.md },
  padGrid: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  padCell: {
    width: '33.33%',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
});

export default DepositLoading;
