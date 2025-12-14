import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, dimensions, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { BackgroundPattern, BackgroundPatternSolid } from '../../../shared/components';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { getUserTypeColor } from '@/shared/themes/colors';

interface FilterBarProps {
  typeFilter: 'all' | 'in' | 'out';
  dateSort: 'asc' | 'desc';
  onTypeFilterChange: (filter: 'all' | 'in' | 'out') => void;
  onDateSortChange: (sort: 'asc' | 'desc') => void;
  totalAmount?: string;
  transactionCount?: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  typeFilter,
  dateSort,
  onTypeFilterChange,
  onDateSortChange,
  totalAmount = '100.000.000 đ',
  transactionCount = 100,
}) => {
  const { t } = useTranslation('transactions');

  const typeOptions = [
    { value: 'all' as const, label: t('filter.all') },
    { value: 'in' as const, label: t('filter.moneyIn') },
    { value: 'out' as const, label: t('filter.moneyOut') },
  ];

  const dateOptions = [
    { value: 'desc' as const, label: t('filter.newest') },
    { value: 'asc' as const, label: t('filter.oldest') },
  ];

  return (
    <View style={styles.container}>
      {/* Type Filter */}
      <View style={styles.filterSection}>
        {/* <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
          <BackgroundPatternSolid borderRadius={dimensions.radius.md} backgroundColor={colors.primary} patternColor={colors.light} patternOpacity={0.5}/>
            <Text style={styles.summaryItemTitle}>{t('filter.totalTransactionAmount')}</Text>
            <Text style={styles.summaryItemValue}>{totalAmount}</Text>
          </View>
          <View style={styles.summaryItem}>
          <BackgroundPatternSolid borderRadius={dimensions.radius.md} backgroundColor={colors.primary} patternColor={colors.light} patternOpacity={0.5}/>
            <Text style={styles.summaryItemTitle}>{t('filter.transactionCount')}</Text>
            <Text style={styles.summaryItemValue}>{transactionCount}</Text>
          </View>
        </View> */}

        {/* <Text style={styles.sectionTitle}>{t('filter.type')}</Text> */}
        <View style={styles.filterOptions}>
          {typeOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.filterChip,
                typeFilter === option.value && [styles.filterChipActive, { backgroundColor: getUserTypeColor() }],
              ]}
              onPress={() => onTypeFilterChange(option.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  typeFilter === option.value && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Date Sort */}
      {/* <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>{t('filter.date')}</Text>
        <View style={styles.filterOptions}>
          {dateOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.filterChip,
                dateSort === option.value && styles.filterChipActive,
              ]}
              onPress={() => onDateSortChange(option.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  dateSort === option.value && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: colors.light,
    // borderRadius: dimensions.radius.lg,
    // paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
    // borderWidth: 1,
    // borderColor: colors.border,
  },
  filterSection: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: spacing.md,
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    borderRadius: dimensions.radius.md,
    // backgroundColor: colors.primary,
    padding: spacing.sm,
    maxWidth: '50%',
    alignItems: 'center',
  },
  summaryItemTitle: {
    fontSize: dimensions.fontSize.md,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.light,
  },
  summaryItemValue: {
    fontSize: dimensions.fontSize.lg,

    color: colors.text.light,
  },
  sectionTitle: {
    fontSize: dimensions.fontSize.lg,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  filterChip: {
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '30%',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: dimensions.fontSize.md,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.light,

  },
});

export default FilterBar;
