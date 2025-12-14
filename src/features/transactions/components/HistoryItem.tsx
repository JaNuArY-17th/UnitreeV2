import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useTranslation } from 'react-i18next';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS, typography } from '../../../shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowDownLeft01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

interface HistoryItemProps {
  description: string;
  transactionTime: string;
  amount: string;
  type: 'in' | 'out';
  state: 'success' | 'failed';
  lastItem?: boolean;
  lastItemInSection?: boolean;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ description, transactionTime, amount, type, state, lastItem, lastItemInSection }) => {
  const { t } = useTranslation('transactions');

  const getAmountColor = () => {
    if (type === 'in') return colors.success;
    if (type === 'out') return colors.danger;
    return colors.text.primary;
  };

  const getStateColor = () => {
    return state === 'success' ? colors.success : colors.danger;
  };

  const formatAmount = () => {
    // Add "+" prefix for money in, "-" prefix for money out
    const prefix = type === 'in' ? '+' : '-';
    return `${prefix}${amount}đ`;
  };

  return (
    <View>
      <View style={[styles.item, lastItem && styles.lastItem]}>
        <View style={styles.iconContainer}>
          {type === 'in' ? (
            <HugeiconsIcon icon={ArrowDownLeft01Icon} size={24} color={colors.success} />
          ) : (
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={24} color={colors.danger} />
          )}
        </View>
        <View style={styles.itemContent}>
          <View style={styles.leftContent}>
            <Text style={styles.itemDescription} numberOfLines={2} ellipsizeMode="tail">{description}</Text>
            <Text style={styles.itemTime}>{transactionTime}</Text>
          </View>
          <View style={styles.rightContent}>
            <Text style={[styles.itemAmount, { color: getAmountColor() }]}>{formatAmount()}</Text>
            <Text style={[styles.itemState, { color: getStateColor() }]}>
              {state === 'success' ? `` : `${t('transactionDetail.failed')}`}
            </Text>
          </View>
        </View>
      </View>
      {!lastItemInSection && <View style={styles.separator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  separator: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginLeft: spacing.sm * 2 + 24, // Icon width + margins
    opacity: 0.3,
  },
  iconContainer: {
    marginRight: spacing.md,
    paddingTop: spacing.xs / 2, // Align icon with first line of text
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
  itemDescription: {
    ...typography.body,
    width: '95%',
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    color: colors.text.primary,
    lineHeight: 20,
  },
  itemTime: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  itemAmount: {
    ...typography.subtitle,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    lineHeight: 20,
  },
  itemState: {
    ...typography.caption,
    lineHeight: 16,
  },
  lastItem: {
    marginBottom: spacing.lg * 7,
  },
});

export default HistoryItem;
