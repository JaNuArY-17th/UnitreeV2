import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native'

import { useTranslation } from 'react-i18next'

import { colors, spacing, typography } from '@/shared/themes'
import { Text, Button } from '@/shared/components/base'
// import { HugeiconsIcon } from '@hugeicons/react-native'
import { Cancel01Icon } from '@hugeicons/core-free-icons'

import VoucherListForOrder from './VoucherListForOrder'
import type {
  VoucherAvailabilityItem,
  VoucherDiscountCalculateResponse,
} from '../types/voucherTypes'

interface VoucherSelectionModalProps {
  visible: boolean
  onClose: () => void
  orderId: string
  orderAmount: number
  onVoucherApply: (
    voucher: VoucherAvailabilityItem,
    discountInfo: VoucherDiscountCalculateResponse,
  ) => void
  currentSelectedVoucherId?: string
}

const VoucherSelectionModal: React.FC<VoucherSelectionModalProps> = ({
  visible,
  onClose,
  orderId,
  orderAmount,
  onVoucherApply,
  currentSelectedVoucherId,
}) => {
  const { t } = useTranslation('voucher')
  const [selectedVoucher, setSelectedVoucher] =
    useState<VoucherAvailabilityItem | null>(null)
  const [selectedDiscountInfo, setSelectedDiscountInfo] =
    useState<VoucherDiscountCalculateResponse | null>(null)

  const handleVoucherSelect = (
    voucher: VoucherAvailabilityItem,
    discountInfo: VoucherDiscountCalculateResponse,
  ) => {
    console.log('🔄 [VoucherSelectionModal] Voucher selected:', voucher.code)
    setSelectedVoucher(voucher)
    setSelectedDiscountInfo(discountInfo)
  }

  const handleApply = () => {
    if (selectedVoucher && selectedDiscountInfo) {
      console.log('✅ [VoucherSelectionModal] Applying voucher:', selectedVoucher.code)
      onVoucherApply(selectedVoucher, selectedDiscountInfo)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedVoucher(null)
    setSelectedDiscountInfo(null)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {t('selectVoucher') || 'Select Voucher'}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {/* <HugeiconsIcon
              name={Cancel01Icon}
              size={24}
              color={colors.text.primary}
            /> */}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <VoucherListForOrder
            orderId={orderId}
            orderAmount={orderAmount}
            onVoucherSelect={handleVoucherSelect}
            selectedVoucherId={selectedVoucher?.id || currentSelectedVoucherId}
          />
        </ScrollView>

        {/* Footer */}
        {selectedVoucher && selectedDiscountInfo && (
          <View style={styles.footer}>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t('selectedVoucher') || 'Selected'}:
                </Text>
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {selectedVoucher.code}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t('discount') || 'Discount'}:
                </Text>
                <Text style={styles.discountValue}>
                  -{selectedDiscountInfo.discountAmount.toLocaleString('vi-VN')} đ
                </Text>
              </View>
            </View>
            <Button
              label={t('apply') || 'Apply'}
              onPress={handleApply}
              fullWidth
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: spacing.md,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  summaryContainer: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.sm,
  },
  discountValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.success,
  },
})

export default VoucherSelectionModal
