import React from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useTranslation } from '@/shared/hooks/useTranslation'
import { colors, spacing, dimensions, typography, getFontFamily, FONT_WEIGHTS } from '@/shared/themes'
import { Text } from '@/shared/components/base'
import type { VoucherStatus } from '../types/voucherTypes'

interface VoucherFilterBarProps {
  activeFilter: VoucherStatus | 'ALL'
  onFilterChange: (filter: VoucherStatus | 'ALL') => void
}

const VoucherFilterBar: React.FC<VoucherFilterBarProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const { t } = useTranslation('voucher')

  const filters: { key: VoucherStatus | 'ALL'; label: string }[] = [
    { key: 'ALL', label: t('filter.all', 'Tất cả') },
    { key: 'ACTIVE', label: t('filter.active', 'Đang hoạt động') },
    { key: 'INACTIVE', label: t('filter.inactive', 'Không hoạt động') },
    { key: 'EXPIRED', label: t('filter.expired', 'Đã hết hạn') },
    { key: 'COMPLETED', label: t('filter.completed', 'Đã hết') },
  ]

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.activeFilterButton,
            ]}
            onPress={() => onFilterChange(filter.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.key && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: dimensions.radius.md,
    backgroundColor: colors.lightGray,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.body,
    color: colors.text.secondary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  activeFilterText: {
    color: colors.light,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
})

export default VoucherFilterBar
