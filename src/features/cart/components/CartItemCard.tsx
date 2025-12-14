import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, TextInput, Alert, Keyboard } from 'react-native';
import { Text } from '@/shared/components/base';
import { Close, Edit, Check } from '@/shared/assets/icons';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { formatVND } from '@/shared/utils/format';
import { useTranslation } from '@/shared/hooks/useTranslation';
import QuantityControl from './QuantityControl';
import type { CartItem } from '../types';
import HapticFeedback from 'react-native-haptic-feedback';

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (id: string, quantity: number) => void;
  onPriceEdit: (id: string, price: number) => void;
  onDelete: (id: string) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onQuantityChange,
  onPriceEdit,
  onDelete,
}) => {
  const { t } = useTranslation('cart');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPrice, setEditedPrice] = useState('');
  const [displayPrice, setDisplayPrice] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Round to nearest thousand (Vietnamese currency rounding)
  const roundToNearestThousand = (amount: number): number => {
    return Math.round(amount / 1000) * 1000;
  };

  // Calculate rounded total amount
  const totalAmount = roundToNearestThousand(item.price * item.quantity);

  // Format price for display with thousand separators
  const formatPriceInput = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    // Add thousand separators
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse formatted price back to number
  const parsePriceInput = (value: string) => {
    return parseInt(value.replace(/\./g, ''), 10);
  };

  useEffect(() => {
    if (isEditingPrice && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingPrice]);

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const handleDelete = () => {
    HapticFeedback.trigger('impactMedium', { enableVibrateFallback: true });
    Alert.alert(
      t('confirmDelete', 'Xác nhận xóa'),
      t('confirmDeleteMessage', 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?'),
      [
        {
          text: t('cancel', 'Hủy'),
          style: 'cancel',
        },
        {
          text: t('delete', 'Xóa'),
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ],
      { cancelable: true }
    );
  };

  const handlePriceEditPress = () => {
    HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
    setIsEditingPrice(true);
    const formattedPrice = formatPriceInput(item.price.toString());
    setEditedPrice(item.price.toString());
    setDisplayPrice(formattedPrice);
  };

  const handlePriceChange = (text: string) => {
    // Remove all non-digit characters
    const numbers = text.replace(/\D/g, '');
    setEditedPrice(numbers);
    setDisplayPrice(formatPriceInput(numbers));
  };

  const handlePriceSubmit = () => {
    const newPrice = parsePriceInput(displayPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      HapticFeedback.trigger('notificationError', { enableVibrateFallback: true });
      Alert.alert(
        t('error', 'Lỗi'),
        t('invalidPrice', 'Vui lòng nhập giá hợp lệ')
      );
      return;
    }

    HapticFeedback.trigger('impactMedium', { enableVibrateFallback: true });
    onPriceEdit(item.id, newPrice);
    setIsEditingPrice(false);
    setEditedPrice('');
    setDisplayPrice('');
    Keyboard.dismiss();
  };

  const handlePriceCancel = () => {
    HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
    setIsEditingPrice(false);
    setEditedPrice('');
    setDisplayPrice('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.card}>
      {/* Delete Button */}
      <Pressable
        onPress={handleDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.deleteButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('remove', 'Xóa')}
        hitSlop={8}
      >
        <Close width={16} height={16} color={colors.text.secondary} />
      </Pressable>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.abbreviation || item.name.substring(0, 2).toUpperCase()}
          </Text>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Product Name and Unit */}
          <View style={styles.nameRow}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
          </View>

          {/* Price with Edit */}
          <View style={styles.priceRow}>
            {isEditingPrice ? (
              <View style={styles.priceEditContainer}>
                <View style={styles.priceInputWrapper}>
                  <TextInput
                    ref={inputRef}
                    style={styles.priceInput}
                    value={displayPrice}
                    onChangeText={handlePriceChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.text.secondary}
                    selectTextOnFocus
                    returnKeyType="done"
                    onSubmitEditing={handlePriceSubmit}
                    blurOnSubmit={true}
                  />
                  <Text style={styles.priceInputCurrency}>đ</Text>
                </View>
                <Text style={styles.priceUnit}>/{item.unit || t('unit', 'Chai')}</Text>

                {/* Action Buttons */}
                <View style={styles.priceActionButtons}>
                  <Pressable
                    onPress={handlePriceCancel}
                    style={({ pressed }) => [
                      styles.priceActionButton,
                      styles.cancelButton,
                      pressed && styles.priceActionButtonPressed,
                    ]}
                    hitSlop={8}
                  >
                    <Close width={24} height={24} color={colors.text.secondary} />
                  </Pressable>

                  <Pressable
                    onPress={handlePriceSubmit}
                    style={({ pressed }) => [
                      styles.priceActionButton,
                      styles.saveButton,
                      pressed && styles.priceActionButtonPressed,
                    ]}
                    hitSlop={8}
                  >
                    <Check width={16} height={16} color={colors.light} />
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handlePriceEditPress}
                style={styles.priceEditButton}
                hitSlop={8}
              >
                <Text style={styles.price}>
                  {formatVND(item.price)}/{item.unit || t('unit', 'Chai')}
                </Text>
                <Edit width={14} height={14} color={colors.primary} />
              </Pressable>
            )}
          </View>

          {/* Quantity Control and Total */}
          <View style={styles.quantityRow}>
            <QuantityControl
              value={item.quantity}
              onDecrease={handleDecrease}
              onIncrease={handleIncrease}
              min={1}
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalAmount}>{formatVND(totalAmount)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  deleteButtonPressed: {
    opacity: 0.6,
    backgroundColor: colors.dangerSoft,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 16,

    color: colors.primary,
  },
  productInfo: {
    flex: 1,
    paddingRight: spacing.lg,
  },
  nameRow: {
    marginBottom: spacing.xs,
  },
  productName: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
  },
  priceRow: {
    marginBottom: spacing.sm,
  },
  priceEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  price: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.primary,
  },
  priceEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    height: 36,
  },
  priceInput: {
    minWidth: 80,
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    padding: 0,
  },
  priceInputCurrency: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  priceUnit: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
  priceActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  priceActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: colors.light,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  priceActionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    marginLeft: spacing.md,
  },
  totalAmount: {
    fontSize: 18,

    color: colors.primary,
  },
});

export default CartItemCard;
