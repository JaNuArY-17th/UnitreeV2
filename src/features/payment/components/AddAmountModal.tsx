import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal, Button } from '@/shared/components/base';
import { KeyboardDismissWrapper } from '@/shared/components/base';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { AmountInput, PresetAmounts } from '@/features/deposit/components';
import { NoteInput } from './NoteInput';
import type { QuickNote } from '../types/transfer';

interface AddAmountModalProps {
  isVisible: boolean;
  onClose: (amount?: string, note?: string) => void;
  initialAmount?: string;
  initialNote?: string;
}

// Preset amounts for quick selection (as numbers)
const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

// Quick notes for suggestions
const QUICK_NOTES: QuickNote[][] = [
  [
    { id: '1', text: 'Tiền ăn' },
    { id: '2', text: 'Tiền cafe' },
    { id: '3', text: 'Chi phí đi lại' },
  ],
  [
    { id: '4', text: 'Chia tiền nhà hàng' },
    { id: '5', text: 'Tiền xăng' },
    { id: '6', text: 'Mua sắm' },
  ],
];

export const AddAmountModal: React.FC<AddAmountModalProps> = ({
  isVisible,
  onClose,
  initialAmount = '',
  initialNote = '',
}) => {
  const { t } = useTranslation('payment');
  const [amount, setAmount] = useState(initialAmount);
  const [note, setNote] = useState(initialNote);
  const [isNoteInputFocused, setIsNoteInputFocused] = useState(false);
  const noteInputRef = useRef<TextInput>(null);

  // Validate amount and create error message
  const errorMessage = useMemo(() => {
    if (!amount || amount === '0') return '';

    const numAmount = parseInt(amount, 10);
    if (numAmount < 1000) {
      return t('addAmount.errors.minimumAmount', 'Số tiền tối thiểu là 1,000 VNĐ');
    }
    if (numAmount > 500000000) {
      return t('addAmount.errors.maximumAmount', 'Số tiền tối đa là 500,000,000 VNĐ');
    }
    return '';
  }, [amount, t]);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isVisible) {
      setAmount(initialAmount);
      setNote(initialNote);
    }
  }, [isVisible, initialAmount, initialNote]);

  const handleAmountChange = useCallback((newAmount: string) => {
    if (!newAmount) {
      setAmount('0');
      return;
    }

    const numAmount = parseInt(newAmount, 10);

    // Limit to reasonable amount (500M VND)
    if (numAmount > 500000000) return;

    setAmount(newAmount);
  }, []);

  const handleAmountSelect = useCallback((selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  }, []);

  const handleConfirm = useCallback(() => {
    if (!amount || amount === '0') {
      Alert.alert(
        t('addAmount.error', 'Lỗi'),
        t('addAmount.errors.enterAmount', 'Vui lòng nhập số tiền')
      );
      return;
    }

    if (errorMessage) {
      Alert.alert(
        t('addAmount.error', 'Lỗi'),
        errorMessage
      );
      return;
    }

    onClose(amount, note);
  }, [amount, note, errorMessage, onClose, t]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleNoteInputFocus = useCallback((focused: boolean) => {
    setIsNoteInputFocused(focused);
  }, []);

  const handleNoteChange = useCallback((newNote: string) => {
    setNote(newNote);
  }, []);

  return (
    <BottomSheetModal
      visible={isVisible}
      onClose={handleCancel}
      title={t('addAmount.title', 'Thêm số tiền')}
      maxHeightRatio={0.4}
      fillToMaxHeight
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <KeyboardDismissWrapper style={styles.container}>
          {/* Amount Input */}
          <View style={styles.amountInputSection}>
            <AmountInput
              amount={amount === '0' ? '' : amount}
              onAmountChange={handleAmountChange}
              autoFocus={true}
            />
          </View>

          {/* Preset Amounts */}
          <View style={styles.presetSection}>
            <PresetAmounts
              presetAmounts={PRESET_AMOUNTS}
              currentAmount={amount ? parseInt(amount, 10) : undefined}
              onAmountSelect={handleAmountSelect}
            />
          </View>

          {/* Note Input */}
          {/* <View style={styles.noteSection}>
            <NoteInput
              note={note}
              onNoteChange={handleNoteChange}
              placeholder={t('addAmount.notePlaceholder', 'Thêm ghi chú (tùy chọn)')}
              quickNotes={QUICK_NOTES}
              isNoteInputFocused={isNoteInputFocused}
              onNoteInputFocus={handleNoteInputFocus}
              noteInputRef={noteInputRef}
              showQuickNotes={false}
            />
          </View> */}

          {/* Action Buttons - Fixed at bottom */}
          <View style={styles.actionButtons}>
            <Button
              label={t('addAmount.cancel', 'Hủy')}
              variant="outline"
              onPress={handleCancel}
              style={styles.cancelButton}
              size="lg"
            />
            <Button
              label={t('addAmount.confirm', 'Xác nhận')}
              variant="primary"
              onPress={handleConfirm}
              style={styles.confirmButton}
              size="lg"
              disabled={!amount || amount === '0' || !!errorMessage}
            />
          </View>
        </KeyboardDismissWrapper>
      </ScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  container: {
    flex: 1,
  },
  amountSection: {
    // paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  noteSection: {
    marginTop: spacing.md,
  },
  presetSection: {
    // marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  amountInputSection: {
    // marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    // paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});
