import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, dimensions, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { BottomSheetModal, Text, Heading } from '@/shared/components/base';

export interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export interface FilterOptions {
  selectedMonth?: string; // Format: 'YYYY-MM'
}

type FilterSection = {
  id: string;
  type: 'monthGrid';
  title?: string;
}

type MonthData = {
  month: number;
  year: number;
  label: string; // Just month name like "Tháng 9"
  value: string; // Format: 'YYYY-MM'
  isCurrentMonth: boolean;
};

type YearGroup = {
  year: number;
  months: MonthData[];
};

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilter,
  initialFilters = {}
}) => {
  const { t, i18n } = useTranslation('transactions');

  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialFilters.selectedMonth || ''
  );

  // Sync internal state when initialFilters changes externally (e.g., when clearing filter chips)
  useEffect(() => {
    setSelectedMonth(initialFilters.selectedMonth || '');
  }, [initialFilters.selectedMonth]);

  // Generate months for the recent 2 years grouped by year
  const yearGroups = useMemo((): YearGroup[] => {
    const groups: { [year: number]: MonthData[] } = {};
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Get current locale from i18n (e.g., 'vi', 'en')
    const currentLocale = i18n.language || 'vi';
    const locale = currentLocale === 'en' ? 'en-US' : 'vi-VN';

    // Generate months for current year and previous year
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const year = currentYear - yearOffset;

      if (!groups[year]) {
        groups[year] = [];
      }

      const maxMonth = yearOffset === 0 ? currentMonth : 11;

      for (let month = maxMonth; month >= 0; month--) {
        const monthDate = new Date(year, month, 1);
        const isCurrentMonth = year === currentYear && month === currentMonth;

        groups[year].push({
          month: month + 1,
          year,
          label: monthDate.toLocaleDateString(locale, {
            month: 'long'
          }),
          value: `${year}-${String(month + 1).padStart(2, '0')}`,
          isCurrentMonth,
        });
      }
    }

    // Convert to array and sort by year descending
    return Object.keys(groups)
      .map(year => ({
        year: parseInt(year, 10),
        months: groups[parseInt(year, 10)]
      }))
      .sort((a, b) => b.year - a.year);
  }, [i18n.language]);

  // Create sections data for FlatList
  const sections = useMemo((): FilterSection[] => [
    { id: 'monthGrid', type: 'monthGrid', title: t('selectMonth', 'Select month') },
  ], [t]);

  const renderHeader = () => (
    <View style={styles.header}>
      <Heading level={1} style={styles.headerTitle} numberOfLines={1}>
        {t('filterTransactions', 'Filter transactions')}
      </Heading>
    </View>
  );

  const handleMonthSelect = (monthValue: string) => {
    const newSelectedMonth = selectedMonth === monthValue ? '' : monthValue;
    setSelectedMonth(newSelectedMonth);

    // Automatically apply filter and close modal
    onApplyFilter({
      selectedMonth: newSelectedMonth || undefined,
    });
    onClose();
  };

  const renderMonthItem = (monthData: MonthData) => {
    const isSelected = selectedMonth === monthData.value;

    return (
      <Pressable
        key={monthData.value}
        onPress={() => handleMonthSelect(monthData.value)}
        style={[
          styles.monthItem,
          isSelected && styles.monthItemSelected,
        ]}
        accessibilityRole="button"
        accessibilityState={{ checked: isSelected }}
      >
        <Text
          style={[
            styles.monthLabel,
            isSelected && styles.monthLabelSelected,
          ]}
        >
          {monthData.label}
        </Text>
      </Pressable>
    );
  };

  const renderSectionItem = ({ item }: { item: FilterSection }) => {
    switch (item.type) {
      case 'monthGrid':
        return (
          <View style={styles.section}>
            {/* <Text variant="subtitle" style={styles.sectionTitle}>
              {item.title}
            </Text> */}
            <View style={styles.yearGroupsContainer}>
              {yearGroups.map((yearGroup) => (
                <View key={yearGroup.year} style={styles.yearGroup}>
                  <Text style={styles.yearTitle}>{yearGroup.year}</Text>
                  <View style={styles.monthGrid}>
                    {yearGroup.months.map((monthData) => renderMonthItem(monthData))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('filterTransactions', 'Filter transactions')}
      maxHeightRatio={0.7}
      fillToMaxHeight
    >
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderSectionItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  // Header styles - inspired by ScreenHeader design
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.light,
    justifyContent: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    color: colors.text.primary,

  },

  // FlatList styles
  flatListContent: {
    paddingBottom: spacing.xl,
  },

  // Section styles
  section: {
    paddingHorizontal: spacing.lg,
    // paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    // fontSize: 16,

    // color: colors.text.primary,
    // marginBottom: spacing.md,
  },

  // Month grid styles
  yearGroupsContainer: {
    gap: spacing.lg,
  },
  yearGroup: {
    gap: spacing.md,
  },
  yearTitle: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  monthItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    // minHeight: 56,
    justifyContent: 'center',
    width: '31%', // Approximately 1/3 width with gaps
  },
  monthItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  monthLabel: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
    textAlign: 'center',
  },
  monthLabelSelected: {
    color: colors.light,

  },
});

export default FilterModal;
