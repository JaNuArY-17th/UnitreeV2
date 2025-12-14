import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/shared/components/base';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions, typography } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { Order } from '../types/order';
import Clock from '@/shared/assets/icons/Clock';
import InvoiceIcon from '@/shared/assets/icons/InvoiceIcon';
import CheckSuccess from '@/shared/assets/icons/CheckSuccess';

interface OrderCardProps {
  order: Order;
  onPress?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const { t } = useTranslation('order');

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return colors.warning;
      case 'PAID':
        return colors.success;
      case 'COMPLETED':
        return colors.success;
      case 'CANCELLED':
        return colors.danger;
      case 'REFUNDED':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  // Get status background color
  const getStatusBackgroundColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return colors.warningSoft;
      case 'PAID':
        return colors.successSoft;
      case 'COMPLETED':
        return colors.successSoft;
      case 'CANCELLED':
        return colors.dangerSoft;
      case 'REFUNDED':
        return colors.secondary;
      default:
        return colors.secondary;
    }
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return t('statusPending');
      case 'PAID':
        return t('statusPaid'); // In design: "CQT đã chấp nhận" could be mapped here if needed
      case 'COMPLETED':
        return t('statusCompleted');
      case 'CANCELLED':
        return t('statusCancelled');
      case 'REFUNDED':
        return t('statusRefunded');
      default:
        return status;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress?.(order)}
    >
      <View style={styles.mainContent}>
        <View style={styles.infoSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor(order.orderStatus) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.orderStatus) }]}>
              {getStatusLabel(order.orderStatus)}
            </Text>
          </View>

          <Text style={styles.orderCode}>
            {t('orderCode')} #{order.orderSequence}
          </Text>

          <Text style={styles.totalAmount}>
            {t('totalAmount')} <Text style={styles.amountValue}>{formatCurrency(order.finalAmount)}</Text>
          </Text>
        </View>

        <View style={styles.illustrationSection}>
          {/* Using InvoiceIcon with a checkmark overlay simulation or just the icon */}
          <View style={styles.iconContainer}>
            <InvoiceIcon width={48} height={48} color={colors.warning} />
            {['PAID', 'COMPLETED'].includes(order.orderStatus) && (
              <View style={styles.checkBadge}>
                <CheckSuccess width={16} height={16} />
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.dashedLine} />
      </View>

      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Clock width={16} height={16} color={colors.text.secondary} />
          <Text style={styles.dateText}>
            {new Date(order.createdAt || order.orderDate).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })} - {new Date(order.createdAt || order.orderDate).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <Pressable
          style={styles.viewButton}
          onPress={() => onPress?.(order)}
        >
          <Text style={styles.viewButtonText}>{t('viewInvoice')}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    // elevation: 3,
    // marginBottom: spacing.sm,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoSection: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  illustrationSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: dimensions.radius.sm,
    marginBottom: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  orderCode: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: 4,
  },
  totalAmount: {
    ...typography.body,
    color: colors.text.secondary,
  },
  amountValue: {
    ...typography.body,
    color: colors.text.primary,
  },
  iconContainer: {
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.light,
    borderRadius: 10,
    padding: 2,
  },
  dividerContainer: {
    height: 1,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: colors.text.secondary,
  },
  viewButton: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: dimensions.radius.md,
  },
  viewButtonText: {
    ...typography.bodySmall,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.light,
  },
});

export default OrderCard;
