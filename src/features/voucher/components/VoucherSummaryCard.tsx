import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { Ticket } from '@/shared/assets/icons';
import { t } from 'i18next';

interface VoucherSummaryCardProps {
  totalVouchers?: number;
  activeVouchers?: number;
  onPress?: () => void;
}

const VoucherSummaryCard: React.FC<VoucherSummaryCardProps> = ({
  totalVouchers = 4,
  activeVouchers = 3,
  onPress
}) => {
  const { t } = useTranslation('voucher');

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ticket width={12} height={12} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('enterPromo')}</Text>
          </View>
            <Text style={styles.subTitle}>{t('enterPromoSubtitle')}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalVouchers}</Text>
          <Text style={styles.statLabel}>{t('summary.total')}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeVouchers}</Text>
          <Text style={styles.statLabel}>{t('summary.active')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 22,
    height: 22,
    borderRadius: dimensions.radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flexDirection: 'row',
  },
  title: {
    ...typography.subtitle,
  },
  subTitle: {
    ...typography.caption,
    color: colors.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...typography.h1,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.gray,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
});

export default VoucherSummaryCard;