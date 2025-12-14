import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, shadows, dimensions, typography } from '@/shared/themes';
import { Text as T } from '@/shared/components/base';
import { FONT_WEIGHTS, getFontFamily } from '@/shared/themes/fonts';
import { CheckCircleIcon, TrendingUp, ArrowCircleUp } from '@/shared/assets/icons';

interface StatRowProps {
  label: string;
  value: string;
  isTotal?: boolean;
  isHighlighted?: boolean;
  icon?: React.ReactNode;
  isLast?: boolean;
}

interface TransactionStatsCardProps {
  stats: StatRowProps[];
  style?: any;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, isTotal = false, isHighlighted = false, icon, isLast = false }) => {
  return (
    <View
      style={[
        styles.statRow,
        isTotal && styles.totalRow,
        isHighlighted && styles.highlightedRow,
        isLast && styles.lastRow
      ]}
    >
      <View style={styles.statLabelContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <T
          variant="body"
          style={[
            styles.statLabel,
            isTotal && styles.totalLabel,
            isHighlighted && styles.highlightedLabel
          ]}
        >
          {label}
        </T>
      </View>
      <T
        variant="body"
        // weight={isTotal ? FONT_WEIGHTS.BOLD : FONT_WEIGHTS.BOLD}
        style={[
          styles.statValue,
          isTotal && styles.totalValue,
          isHighlighted && styles.highlightedValue
        ]}
      >
        {value}
      </T>
    </View>
  );
};

const getStatIcon = (label: string, isHighlighted?: boolean, isTotal?: boolean) => {
  if (isHighlighted) {
    return <ArrowCircleUp width={16} height={16} color={colors.success} />;
  }

  // Icon mapping based on label content
  const labelLower = label.toLowerCase();
  if (labelLower.includes('interest') || labelLower.includes('profit')) {
    return <TrendingUp width={16} height={16} color={colors.success} />;
  }

  return null;
};

const TransactionStatsCard: React.FC<TransactionStatsCardProps> = ({
  stats,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.card}>
        {stats.map((stat, index) => (
          <StatRow
            key={index}
            label={stat.label}
            value={stat.value}
            isTotal={stat.isTotal}
            isHighlighted={stat.isHighlighted}
            icon={getStatIcon(stat.label, stat.isHighlighted, stat.isTotal)}
            isLast={index === stats.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    // paddingVertical: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.mutedLine,
  },
  totalRow: {
    borderBottomWidth: 0,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: dimensions.radius.lg,
  },
  highlightedRow: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: dimensions.radius.md,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  statLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: spacing.sm,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    color: colors.text.primary,
    lineHeight: 22,
    flex: 1,
  },
  statValue: {
    // lineHeight: 24,
    ...typography.subtitle,
    textAlign: 'right',

  },
  highlightedValue: {
    color: colors.success,
  },
  highlightedLabel: {
    color: colors.success,
  },
  totalLabel: {
    color: colors.text.primary,
  },
  totalValue: {
    color: colors.text.primary,
    textAlign: 'right',
  },
});

export default TransactionStatsCard;
