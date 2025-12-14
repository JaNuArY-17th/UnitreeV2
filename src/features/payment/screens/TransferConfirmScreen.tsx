import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, getFontFamily, FONT_WEIGHTS, spacing } from '@/shared/themes';
import { formatVND } from '@/shared/utils/format';
import { Body, Button, Heading, BackgroundPattern } from '@/shared/components/base';
import { ScreenHeader, TransactionStatsCard } from '@/shared/components';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useTransferInitiate } from '../hooks/useTransfer';
import type { TransferRecipient, TransactionType } from '../types/transfer';
import type { PaymentSource } from '../components/PaymentSourceCard';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type TransferConfirmScreenRouteProp = RouteProp<any, any>;
type TransferConfirmScreenNavigationProp = NativeStackNavigationProp<any>;

interface VoucherInfo {
  voucherCode: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

interface RouteParams {
  amount: string;
  note: string;
  recipient: TransferRecipient;
  paymentSource: PaymentSource;
  orderId?: string;
  voucherInfo?: VoucherInfo;
}

export const TransferConfirmScreen: React.FC = () => {
  const { t } = useTranslation('payment');
  const navigation = useNavigation<TransferConfirmScreenNavigationProp>();
  const route = useRoute<TransferConfirmScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const params = route.params as RouteParams;
  const { amount, note, recipient, paymentSource, orderId, voucherInfo } = params;

  const [isConfirming, setIsConfirming] = useState(false);

  // Calculate display amount (use voucher final amount if available)
  const displayAmount = voucherInfo ? voucherInfo.finalAmount : parseInt(amount, 10);

  // Transfer initiate mutation
  const transferInitiateMutation = useTransferInitiate();

  // Determine transaction type based on payment source
  const getTransactionType = (source: PaymentSource): TransactionType => {
    return source.type === 'espay_later' ? 'CREDIT' : 'REAL';
  };

  const handleConfirmTransfer = async () => {
    if (!amount || !recipient.accountNumber) {
      Alert.alert(
        t('transfer.errors.title') || 'Error',
        t('transfer.missingData') || 'Missing required transfer data'
      );
      return;
    }

    setIsConfirming(true);

    try {
      const transactionType = getTransactionType(paymentSource);

      const result = await transferInitiateMutation.mutateAsync({
        destinationAccountNumber: recipient.accountNumber,
        amount: amount,
        description: note || `Transfer to ${recipient.name}`,
        transactionType,
        ...(orderId && { orderId })
      });

      if (result.success && result.data) {
        // Navigate to OTP verification screen
        navigation.navigate('TransferOtp' as any, {
          transferData: {
            amount,
            recipient,
            paymentSource,
            tempTransactionId: result.data.requestId,
            phoneNumber: result.data.phoneNumber,
            expireInSeconds: result.data.expireInSeconds,
          }
        });
      } else {
        Alert.alert(
          t('transfer.errors.title') || 'Transfer Error',
          result.message || t('transfer.initiateFailed') || 'Failed to initiate transfer'
        );
      }
    } catch (error: any) {
      console.error('Transfer initiation error:', error);
      Alert.alert(
        t('transfer.errors.title') || 'Transfer Error',
        error.message || t('transfer.networkError') || 'Network error occurred'
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formattedAmount = formatVND(displayAmount);
  const formattedOriginalAmount = voucherInfo ? formatVND(voucherInfo.originalAmount) : null;
  const formattedDiscount = voucherInfo ? formatVND(voucherInfo.discountAmount) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />

      <ScreenHeader
        title={t('transfer.confirmTitle') || 'Xác nhận chuyển tiền'}
        showBack
        onBackPress={handleGoBack}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Body style={styles.amountLabel}>
            {voucherInfo ? (t('transfer.finalAmount') || 'Tổng tiền thanh toán') : (t('transfer.transferAmount') || 'Số tiền chuyển')}
          </Body>
          <Heading style={styles.amountText}>{formattedAmount}</Heading>

          {/* Voucher Discount Info */}
          {voucherInfo && (
            <View style={styles.discountInfo}>
              <View style={styles.discountRow}>
                <Body style={styles.discountLabel}>{t('transfer.originalAmount') || 'Số tiền gốc'}:</Body>
                <Body style={styles.discountValue}>{formattedOriginalAmount}</Body>
              </View>
              <View style={styles.discountRow}>
                <Body style={styles.discountLabel}>{t('voucher.discount') || 'Giảm giá'}:</Body>
                <Body style={styles.discountAmount}>-{formattedDiscount}</Body>
              </View>
              <View style={styles.voucherBadge}>
                <Body style={styles.voucherCode}>🎟️ {voucherInfo.voucherCode}</Body>
              </View>
            </View>
          )}
        </View>

        {/* Transfer Details Card */}
        <TransactionStatsCard
          stats={[
            {
              label: t('transfer.recipient') || 'Người nhận',
              value: recipient.name
            },
            {
              label: t('transfer.accountNumber') || 'Số tài khoản',
              value: recipient.accountNumber
            },
            {
              label: t('transfer.paymentSource') || 'Nguồn tiền',
              value: paymentSource.type === 'espay_later' ? t('paymentSource.espayLater') : t('paymentSource.mainAccount')
            },
            {
              label: t('transfer.availableBalance') || 'Số dư khả dụng',
              value: formatVND(paymentSource.balance)
            },
            ...(note ? [{
              label: t('transfer.note') || 'Ghi chú',
              value: note
            }] : []),
            {
              label: t('transfer.totalAmount') || 'Tổng tiền',
              value: formattedAmount,
              isTotal: true
            },
          ]}
          style={styles.statsCard}
        />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.buttonContainer}>
        <Button
          label={isConfirming ?
            (t('transfer.confirming') || 'Đang xử lý...') :
            (t('transfer.confirmTransfer') || 'Xác nhận chuyển tiền')
          }
          onPress={handleConfirmTransfer}
          disabled={isConfirming}
          loading={isConfirming}
          size='lg'
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  amountText: {
    fontSize: 40,
    color: colors.primary,
    lineHeight: 48,
  },
  discountInfo: {
    marginTop: spacing.md,
    width: '100%',
    backgroundColor: colors.light,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  discountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  discountValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  discountAmount: {
    fontSize: 14,
    color: colors.success,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  voucherBadge: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  voucherCode: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  statsCard: {},
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
});

export default TransferConfirmScreen;
