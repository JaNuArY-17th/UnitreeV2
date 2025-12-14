import React, { useState, useCallback } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'

import { useTranslation } from 'react-i18next'

import { colors, spacing, typography } from '@/shared/themes'
import { Text, Button } from '@/shared/components/base'
import { formatVND } from '@/shared/utils/format'

import { useOrderVouchers } from '../hooks/useOrderVouchers'
import { voucherService } from '../services/voucherService'
import type {
  VoucherAvailabilityItem,
  UnusableVoucherItem,
  VoucherDiscountCalculateResponse,
} from '../types/voucherTypes'

interface VoucherListForOrderProps {
  orderId: string
  orderAmount: number
  onVoucherSelect?: (
    voucher: VoucherAvailabilityItem,
    discountInfo: VoucherDiscountCalculateResponse,
  ) => void
  selectedVoucherId?: string
}

const VoucherListForOrder: React.FC<VoucherListForOrderProps> = ({
  orderId,
  orderAmount,
  onVoucherSelect,
  selectedVoucherId,
}) => {
  const { t } = useTranslation('voucher')
  const [calculatingVoucherId, setCalculatingVoucherId] = useState<
    string | null
  >(null)
  const [discountCache, setDiscountCache] = useState<
    Record<string, VoucherDiscountCalculateResponse>
  >({})

  // Fetch available vouchers for order
  const {
    data: vouchersResponse,
    isLoading,
    isError,
    refetch,
  } = useOrderVouchers(orderId, !!orderId)

  console.log('🔍 [VoucherListForOrder] vouchersResponse:', vouchersResponse)
  console.log('🔍 [VoucherListForOrder] isLoading:', isLoading, 'isError:', isError)

  // Calculate discount for a voucher
  const calculateDiscount = useCallback(
    async (voucher: VoucherAvailabilityItem) => {
      // Check cache first
      if (discountCache[voucher.id]) {
        onVoucherSelect?.(voucher, discountCache[voucher.id])
        return
      }

      try {
        setCalculatingVoucherId(voucher.id)
        const response = await voucherService.calculateDiscount({
          voucherId: voucher.id,
          orderId,
          originalAmount: orderAmount,
        })

        if (response.success && response.data) {
          // Cache the result
          setDiscountCache(prev => ({
            ...prev,
            [voucher.id]: response.data,
          }))
          onVoucherSelect?.(voucher, response.data)
        }
      } catch (error) {
        console.error('❌ [VoucherListForOrder] Calculate discount error:', error)
      } finally {
        setCalculatingVoucherId(null)
      }
    },
    [orderId, orderAmount, onVoucherSelect, discountCache],
  )

  // Render usable voucher item
  const renderUsableVoucher = useCallback(
    ({ item }: { item: VoucherAvailabilityItem }) => {
      const isSelected = selectedVoucherId === item.id
      const isCalculating = calculatingVoucherId === item.id
      const cachedDiscount = discountCache[item.id]

      return (
        <TouchableOpacity
          style={[styles.voucherCard, isSelected && styles.voucherCardSelected]}
          onPress={() => calculateDiscount(item)}
          disabled={isCalculating}
        >
          <View style={styles.voucherHeader}>
            <Text style={styles.voucherName} numberOfLines={1}>
              {item.campaignName}
            </Text>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>
                  {t('selected') || 'Selected'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.voucherBody}>
            <View style={styles.voucherInfo}>
              <Text style={styles.voucherCode}>{item.code}</Text>
              <Text style={styles.voucherUsage}>
                {t('usageRemaining', {
                  remaining: item.remainingUsageCount,
                  max: item.maxUsagePerUser,
                }) || `${item.remainingUsageCount}/${item.maxUsagePerUser} uses left`}
              </Text>
            </View>

            {isCalculating ? (
              <View style={styles.calculatingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.calculatingText}>
                  {t('calculating') || 'Calculating...'}
                </Text>
              </View>
            ) : cachedDiscount ? (
              <View style={styles.discountContainer}>
                <Text style={styles.discountLabel}>
                  {t('youSave') || 'You save'}
                </Text>
                <Text style={styles.discountAmount}>
                  {formatVND(cachedDiscount.discountAmount)}
                </Text>
                <Text style={styles.finalAmount}>
                  {t('finalAmount') || 'Final'}:{' '}
                  {formatVND(cachedDiscount.finalAmount)}
                </Text>
              </View>
            ) : (
              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>
                  {t('select') || 'Select'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )
    },
    [
      selectedVoucherId,
      calculatingVoucherId,
      discountCache,
      calculateDiscount,
      t,
    ],
  )

  // Render unusable voucher item
  const renderUnusableVoucher = useCallback(
    ({ item }: { item: UnusableVoucherItem }) => {
      return (
        <View style={[styles.voucherCard, styles.voucherCardDisabled]}>
          <View style={styles.voucherHeader}>
            <Text style={[styles.voucherName, styles.textDisabled]} numberOfLines={1}>
              {item.voucher.campaignName}
            </Text>
          </View>

          <View style={styles.voucherBody}>
            <View style={styles.voucherInfo}>
              <Text style={[styles.voucherCode, styles.textDisabled]}>
                {item.voucher.code}
              </Text>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>
          </View>
        </View>
      )
    },
    [],
  )

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {t('loadingVouchers') || 'Loading vouchers...'}
        </Text>
      </View>
    )
  }

  // Error state
  if (isError || !vouchersResponse?.success || !vouchersResponse?.data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {t('errorLoadingVouchers') || 'Failed to load vouchers'}
        </Text>
        <Button
          label={t('retry') || 'Retry'}
          onPress={() => refetch()}
          variant="outline"
        />
      </View>
    )
  }

  const usableVouchers = vouchersResponse.data.usableVouchers || []
  const unusableVouchers = vouchersResponse.data.unusableVouchers || []

  console.log('🔍 [VoucherListForOrder] usableVouchers:', usableVouchers)
  console.log('🔍 [VoucherListForOrder] unusableVouchers:', unusableVouchers)
  console.log('🔍 [VoucherListForOrder] usableVouchers.length:', usableVouchers.length)
  console.log('🔍 [VoucherListForOrder] vouchersResponse.data structure:', JSON.stringify(vouchersResponse.data, null, 2))

  // No vouchers state
  if (usableVouchers.length === 0 && unusableVouchers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          {t('noVouchersAvailable') || 'No vouchers available for this order'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Usable Vouchers Section */}
      {usableVouchers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('availableVouchers') || 'Available Vouchers'} (
            {usableVouchers.length})
          </Text>
          <FlatList
            data={usableVouchers}
            renderItem={renderUsableVoucher}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      {/* Unusable Vouchers Section */}
      {unusableVouchers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('unavailableVouchers') || 'Unavailable Vouchers'} (
            {unusableVouchers.length})
          </Text>
          <FlatList
            data={unusableVouchers}
            renderItem={renderUnusableVoucher}
            keyExtractor={item => item.voucher.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  separator: {
    height: spacing.sm,
  },
  voucherCard: {
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  voucherCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.light,
  },
  voucherCardDisabled: {
    opacity: 0.6,
    backgroundColor: colors.light,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  voucherName: {
    ...typography.body,
    flex: 1,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    marginLeft: spacing.sm,
  },
  selectedBadgeText: {
    ...typography.caption,
    color: colors.light,
    fontWeight: '600',
  },
  voucherBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherCode: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  voucherUsage: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  calculatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  calculatingText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  discountContainer: {
    alignItems: 'flex-end',
  },
  discountLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  discountAmount: {
    ...typography.body,
    color: colors.success,
    fontWeight: '700',
  },
  finalAmount: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  selectButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
  },
  selectButtonText: {
    ...typography.body,
    color: colors.light,
    fontWeight: '600',
  },
  textDisabled: {
    color: colors.text.secondary,
  },
  reasonText: {
    ...typography.caption,
    color: colors.danger,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})

export default VoucherListForOrder
