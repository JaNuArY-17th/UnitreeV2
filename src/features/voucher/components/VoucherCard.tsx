import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useTranslation } from '@/shared/hooks/useTranslation'
import { colors, spacing, dimensions, typography, getFontFamily, FONT_WEIGHTS } from '@/shared/themes'
import { Text } from '@/shared/components/base'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Ticket01Icon, Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'
import type { VoucherCampaignResponse } from '../types/voucherTypes'

interface VoucherCardProps {
  voucher: VoucherCampaignResponse
  onPress?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  onPress,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation('voucher')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {}).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getStatusConfig = () => {
    switch (voucher.status) {
      case 'ACTIVE':
        return {
          style: styles.activeStatus,
          text: t('status.active', 'Đang hoạt động'),
          color: colors.success,
        }
      case 'INACTIVE':
        return {
          style: styles.inactiveStatus,
          text: t('status.inactive', 'Không hoạt động'),
          color: colors.text.secondary,
        }
      case 'EXPIRED':
        return {
          style: styles.expiredStatus,
          text: t('status.expired', 'Đã hết hạn'),
          color: colors.danger,
        }
      case 'COMPLETED':
        return {
          style: styles.completedStatus,
          text: t('status.completed', 'Đã hết'),
          color: colors.warning,
        }
      default:
        return {
          style: styles.inactiveStatus,
          text: t('status.inactive', 'Không hoạt động'),
          color: colors.text.secondary,
        }
    }
  }

  const statusConfig = getStatusConfig()
  const remainingQuantity = voucher.totalQuantity - voucher.usedQuantity
  const usagePercentage = (voucher.usedQuantity / voucher.totalQuantity) * 100

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <HugeiconsIcon icon={Ticket01Icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.voucherName} numberOfLines={1}>
            {voucher.name}
          </Text>
          <Text style={styles.voucherCode}>
            {t('code', 'Mã')}: {voucher.code}
          </Text>
        </View>
        <View style={[styles.statusBadge, statusConfig.style]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.text}
          </Text>
        </View>
      </View>

      <View style={styles.discountContainer}>
        <Text style={styles.discountValue}>
          {voucher.discountType === 'PERCENTAGE'
            ? `${voucher.discountValue}%`
            : `${formatCurrency(voucher.discountValue)}đ`}
        </Text>
        <Text style={styles.discountLabel}>
          {t('discount', 'Giảm giá')}
        </Text>
      </View>

      {voucher.description && (
        <Text style={styles.description} numberOfLines={2}>
          {voucher.description}
        </Text>
      )}

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>
          {t('minOrder', 'Đơn tối thiểu')}:
        </Text>
        <Text style={styles.infoValue}>
          {voucher.minOrderValue ? `${formatCurrency(voucher.minOrderValue)}đ` : t('noLimit', 'Không giới hạn')}
        </Text>
      </View>

      {voucher.maxDiscount && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            {t('maxDiscount', 'Giảm tối đa')}:
          </Text>
          <Text style={styles.infoValue}>
            {formatCurrency(voucher.maxDiscount)}đ
          </Text>
        </View>
      )}

      <View style={styles.quantityContainer}>
        <View style={styles.quantityHeader}>
          <Text style={styles.quantityLabel}>
            {t('used', 'Đã dùng')}: {voucher.usedQuantity}/{voucher.totalQuantity}
          </Text>
          <Text style={styles.quantityRemaining}>
            {t('remaining', 'Còn lại')}: {remainingQuantity}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${usagePercentage}%` }]} />
        </View>
      </View>

      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>
          {t('validFrom', 'Từ')}: {formatDate(voucher.validFrom)}
        </Text>
        <Text style={styles.dateLabel}>
          {t('validTo', 'Đến')}: {formatDate(voucher.validTo)}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <HugeiconsIcon icon={Edit02Icon} size={20} color={colors.primary} />
          <Text style={styles.actionText}>{t('edit', 'Sửa')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <HugeiconsIcon icon={Delete02Icon} size={20} color={colors.danger} />
          <Text style={[styles.actionText, styles.deleteText]}>{t('delete', 'Xóa')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  voucherName: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  voucherCode: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.sm,
  },
  activeStatus: {
    backgroundColor: colors.successSoft,
  },
  inactiveStatus: {
    backgroundColor: colors.lightGray,
  },
  expiredStatus: {
    backgroundColor: colors.dangerSoft,
  },
  completedStatus: {
    backgroundColor: colors.warningSoft,
  },
  statusText: {
    fontSize: dimensions.fontSize.sm,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  discountContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  discountValue: {
    ...typography.h1,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  discountLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  quantityContainer: {
    marginVertical: spacing.md,
  },
  quantityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  quantityLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  quantityRemaining: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: dimensions.radius.md,
    gap: spacing.xs,
  },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
  },
  actionText: {
    ...typography.body,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  deleteText: {
    color: colors.danger,
  },
})

export default VoucherCard
