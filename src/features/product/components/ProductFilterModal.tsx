import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetModal } from '@/shared/components/base';
import { Input, Button, Text } from '@/shared/components/base';
import { colors, spacing, typography } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { FilterOptions } from '../types';

// Constants for validation limits
const MAX_PRICE = 10_000_000_000; // 10 billion VND
const MAX_STOCK = 10_000_000_000; // 10 billion units

// Format number to currency string (e.g., 1000000 -> "1.000.000")
const formatCurrency = (value: string | number, maxValue: number = MAX_PRICE): string => {
  if (!value && value !== 0) return '';
  const numericValue = typeof value === 'string'
    ? value.replace(/[^0-9]/g, '')
    : value.toString();
  if (!numericValue) return '';
  let number = parseInt(numericValue, 10);
  if (Number.isNaN(number)) return '';
  // Apply max limit
  if (number > maxValue) number = maxValue;
  return number.toLocaleString('vi-VN');
};

// Parse currency string to number (e.g., "1.000.000" -> 1000000)
const parseCurrency = (value: string): number | undefined => {
  if (!value) return undefined;
  const numericValue = value.replace(/[^0-9]/g, '');
  if (!numericValue) return undefined;
  const number = parseInt(numericValue, 10);
  return Number.isNaN(number) ? undefined : number;
};

interface ProductFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const ProductFilterModal: React.FC<ProductFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}) => {
  const { t } = useTranslation('product');

  const [priceMin, setPriceMin] = useState<string>(
    formatCurrency(initialFilters.priceMin || '')
  );
  const [priceMax, setPriceMax] = useState<string>(
    formatCurrency(initialFilters.priceMax || '')
  );
  const [stockMin, setStockMin] = useState<string>(
    formatCurrency(initialFilters.stockMin || '', MAX_STOCK)
  );
  const [stockMax, setStockMax] = useState<string>(
    formatCurrency(initialFilters.stockMax || '', MAX_STOCK)
  );
  const [priceError, setPriceError] = useState<string>('');
  const [stockError, setStockError] = useState<string>('');

  // Reset form when modal opens with new initial filters
  useEffect(() => {
    if (visible) {
      setPriceMin(formatCurrency(initialFilters.priceMin || ''));
      setPriceMax(formatCurrency(initialFilters.priceMax || ''));
      setStockMin(formatCurrency(initialFilters.stockMin || '', MAX_STOCK));
      setStockMax(formatCurrency(initialFilters.stockMax || '', MAX_STOCK));
      setPriceError('');
      setStockError('');
    }
  }, [visible, initialFilters]);

  // Handle price input change with currency formatting
  const handlePriceMinChange = (value: string) => {
    setPriceMin(formatCurrency(value, MAX_PRICE));
    setPriceError('');
  };

  const handlePriceMaxChange = (value: string) => {
    setPriceMax(formatCurrency(value, MAX_PRICE));
    setPriceError('');
  };

  // Handle stock input change with formatting
  const handleStockMinChange = (value: string) => {
    setStockMin(formatCurrency(value, MAX_STOCK));
    setStockError('');
  };

  const handleStockMaxChange = (value: string) => {
    setStockMax(formatCurrency(value, MAX_STOCK));
    setStockError('');
  };

  const handleApply = () => {
    const parsedPriceMin = parseCurrency(priceMin);
    const parsedPriceMax = parseCurrency(priceMax);
    const parsedStockMin = parseCurrency(stockMin);
    const parsedStockMax = parseCurrency(stockMax);

    // Validate price range: max must be >= min
    if (parsedPriceMin !== undefined && parsedPriceMax !== undefined && parsedPriceMax < parsedPriceMin) {
      setPriceError(t('priceMaxError', 'Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu'));
      return;
    }

    // Validate stock range: max must be >= min
    if (parsedStockMin !== undefined && parsedStockMax !== undefined && parsedStockMax < parsedStockMin) {
      setStockError(t('stockMaxError', 'Tồn tối đa phải lớn hơn hoặc bằng tồn tối thiểu'));
      return;
    }

    const filters: FilterOptions = {};

    if (parsedPriceMin !== undefined) filters.priceMin = parsedPriceMin;
    if (parsedPriceMax !== undefined) filters.priceMax = parsedPriceMax;
    if (parsedStockMin !== undefined) filters.stockMin = parsedStockMin;
    if (parsedStockMax !== undefined) filters.stockMax = parsedStockMax;

    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setPriceMin('');
    setPriceMax('');
    setStockMin('');
    setStockMax('');
    setPriceError('');
    setStockError('');
    onApply({});
    onClose();
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('filterTitle', 'Lọc sản phẩm')}
      maxHeightRatio={0.8}
      fillToMaxHeight
    >
      <View style={styles.container}>
        {/* Price Range Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('priceRange', 'Khoảng giá')} (đ)</Text>
          <View style={styles.row}>
            <View style={styles.inputWrapper}>
              <Input
                value={priceMin}
                onChangeText={handlePriceMinChange}
                placeholder={t('minPrice', 'Giá tối thiểu')}
                keyboardType="numeric"
                containerStyle={styles.input}
                autoFocus
              />
            </View>
            <Text style={styles.separator}>-</Text>
            <View style={styles.inputWrapper}>
              <Input
                value={priceMax}
                onChangeText={handlePriceMaxChange}
                placeholder={t('maxPrice', 'Giá tối đa')}
                keyboardType="numeric"
                containerStyle={styles.input}
              />
            </View>
          </View>
          {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
        </View>

        {/* Stock Range Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('stockRange', 'Khoảng tồn kho')}</Text>
          <View style={styles.row}>
            <View style={styles.inputWrapper}>
              <Input
                value={stockMin}
                onChangeText={handleStockMinChange}
                placeholder={t('minStock', 'Tồn tối thiểu')}
                keyboardType="numeric"
                containerStyle={styles.input}
              />
            </View>
            <Text style={styles.separator}>-</Text>
            <View style={styles.inputWrapper}>
              <Input
                value={stockMax}
                onChangeText={handleStockMaxChange}
                placeholder={t('maxStock', 'Tồn tối đa')}
                keyboardType="numeric"
                containerStyle={styles.input}
              />
            </View>
          </View>
          {stockError ? <Text style={styles.errorText}>{stockError}</Text> : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Button
            label={t('clear', 'Xóa bộ lọc')}
            onPress={handleClear}
            variant="outline"
            style={styles.button}
          />
          <Button
            label={t('apply', 'Áp dụng')}
            onPress={handleApply}
            style={styles.button}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    // color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    // flex: 1,
  },
  separator: {
    ...typography.body,
    color: colors.text.secondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
  },
});

export default ProductFilterModal;
