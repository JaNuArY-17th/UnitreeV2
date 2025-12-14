import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useTranslation } from 'react-i18next';
import { colors, dimensions, spacing, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface OrderDetailsCardProps {
  orderId?: string | number;
  orderData?: any;
  isOrderLoading: boolean;
  onOrderPress: (order: any) => void;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({
  orderId,
  orderData,
  isOrderLoading,
  onOrderPress,
}) => {
  const { t } = useTranslation('transactions');

  if (!orderId) {
    return null;
  }

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return colors.warning;
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

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return t('transactionDetail.statusPending', 'Đang xử lý');
      case 'COMPLETED':
        return t('transactionDetail.statusCompleted', 'Hoàn thành');
      case 'CANCELLED':
        return t('transactionDetail.statusCancelled', 'Đã hủy');
      case 'REFUNDED':
        return t('transactionDetail.statusRefunded', 'Đã hoàn tiền');
      default:
        return status;
    }
  };

  // Get payment method label
  const getPaymentMethodLabel = (method: string): string => {
    return method === 'CASH' ? t('transactionDetail.paymentCash', 'Tiền mặt') : t('transactionDetail.paymentTransfer', 'Chuyển khoản');
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isOrderLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('transactionDetail.orderDetails')}</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {t('transactionDetail.loadingOrder')}
          </Text>
        </View>
      </View>
    );
  }

  if (!orderData?.success || !orderData?.data) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('transactionDetail.orderDetails')}</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t('transactionDetail.orderNotFound')}
          </Text>
        </View>
      </View>
    );
  }

  const order = orderData.data;

  const details = [
    { label: t('transactionDetail.orderId'), value: order.orderSequence },
    { label: t('transactionDetail.itemsCount'), value: order.items?.length?.toString() || '0' },
    // { label: t('transactionDetail.totalAmount'), value: formatVND(order.finalAmount) },
    { label: t('transactionDetail.orderDate'), value: formatDate(order.createdAt || order.orderDate) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('transactionDetail.orderDetails')}</Text>
        <Pressable
          style={styles.viewMoreButton}
          onPress={() => onOrderPress(order)}
        >
          <Text style={styles.viewMoreText}>{t('transactionDetail.viewMore')}</Text>
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.primary} />
        </Pressable>
      </View>

      {details.map((detail, index) => (
        <React.Fragment key={detail.label}>
          <View style={[
            styles.detailRow,
            styles.statusRow
          ]}>
            <Text style={styles.detailLabel}>{detail.label}</Text>
            <Text style={[
              styles.detailValue
            ]}>
              {detail.value}
            </Text>
          </View>
          {index < details.length - 1 && (
            <View style={styles.dashSeparator} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    // paddingTop: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs
  },
  viewMoreText: {
    ...typography.subtitle,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statusRow: {
    // Special styling for status row if needed
  },
  detailLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  dashSeparator: {
    height: 1,
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 0,
  },
});

export default OrderDetailsCard;
