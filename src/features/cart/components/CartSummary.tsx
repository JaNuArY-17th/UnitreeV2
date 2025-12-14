import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { Text, Button } from '@/shared/components/base';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { formatVND } from '@/shared/utils/format';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { PaymentMethod } from '../types';

interface CartSummaryProps {
  total: number;
  discount: number;
  onDiscountChange: (amount: number) => void;
  onCheckout: () => void;
  disabled?: boolean;
  isCheckingOut?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  total,
  discount,
  onDiscountChange,
  onCheckout,
  disabled = false,
  isCheckingOut = false,
}) => {
  const { t } = useTranslation('cart');
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState('');

  const finalTotal = Math.max(0, total - discount);

  const handleDiscountPress = () => {
    setIsEditingDiscount(true);
    setDiscountInput(discount > 0 ? discount.toString() : '');
  };

  const handleDiscountSubmit = () => {
    const newDiscount = parseInt(discountInput, 10);
    if (!isNaN(newDiscount) && newDiscount >= 0) {
      onDiscountChange(newDiscount);
    } else {
      onDiscountChange(0);
    }
    setIsEditingDiscount(false);
  };

  const handleDiscountCancel = () => {
    setDiscountInput('');
    setIsEditingDiscount(false);
  };

  return (
    <View style={styles.container}>
      {/* Total Row */}
      <View style={styles.row}>
        <Text style={styles.label}>{t('summary.total', 'Tổng tiền')}</Text>
        <Text style={styles.totalValue}>{formatVND(total)}</Text>
      </View>

      {/* Discount Row */}
      {/* <View style={styles.row}>
        <Text style={styles.label}>{t('summary.discount', 'Giảm giá')}</Text>
        {isEditingDiscount ? (
          <TextInput
            style={styles.discountInput}
            value={discountInput}
            onChangeText={setDiscountInput}
            keyboardType="numeric"
            placeholder="0"
            autoFocus
            onBlur={handleDiscountCancel}
            onSubmitEditing={handleDiscountSubmit}
            selectTextOnFocus
          />
        ) : (
          <Pressable onPress={handleDiscountPress} hitSlop={8}>
            <Text style={styles.discountLink}>
              {discount > 0
                ? formatVND(discount)
                : t('summary.enterDiscount', 'Nhập số tiền giảm giá')}
            </Text>
          </Pressable>
        )}
      </View> */}

      {/* Payment Methods */}
      {/* <View style={styles.paymentSection}>
        <PaymentMethodSelector
          methods={paymentMethods}
          selectedId={selectedPaymentMethod}
          onSelect={onPaymentMethodSelect}
        />
      </View> */}

      {/* Checkout Button */}
      <Button
        label={
          isCheckingOut
            ? t('checkingOut', 'Đang xử lý...')
            : t('checkout', 'Thanh toán {{amount}}', {
              amount: formatVND(finalTotal),
            })
        }
        variant="primary"
        size="lg"
        onPress={onCheckout}
        disabled={disabled || finalTotal <= 0 || isCheckingOut}
        loading={isCheckingOut}
        fullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    // Soft shadow upwards
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 18,

    color: colors.text.primary,
  },
  discountLink: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  discountInput: {
    minWidth: 100,
    height: 32,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
    textAlign: 'right',
  },
  // paymentSection: {
  //   marginBottom: spacing.lg,
  // },
});

export default CartSummary;
