import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { BottomSheetModal } from '@/shared/components/base';
import { PresetAmounts, AmountInput, ContinueButton } from '../components';

interface AmountEditModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  initialAmount: number;
  minAmount?: number;
}

const AmountEditModal: React.FC<AmountEditModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialAmount,
  minAmount = 20000,
}) => {
  const { t } = useTranslation('deposit');
  const [amount, setAmount] = useState<string>('');

  // Initialize amount when modal opens
  useEffect(() => {
    if (visible) {
      setAmount(initialAmount.toString());
    }
  }, [visible, initialAmount]);

  const onAmountChange = (newAmount: string) => {
    setAmount(newAmount);
  };

  const onAmountSelect = (value: number) => {
    setAmount(String(value));
  };

  // Preset amounts for quick selection
  const presetAmounts = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

  const onContinue = () => {
    const numericAmount = parseInt(amount || '0', 10);

    // Validate amount
    if (numericAmount < minAmount) {
      return;
    }

    onConfirm(numericAmount);
    onClose();
  };

  const handleCancel = () => {
    // Reset to initial amount
    setAmount(initialAmount.toString());
    onClose();
  };


  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleCancel}
      title={t('qr.editAmount')}
      maxHeightRatio={0.6}
      fillToMaxHeight
      footerContent={null}
      showClose={true}
    >
      <View style={styles.content}>
        <View style={styles.bottomSection}>
          <AmountInput
            amount={amount}
            onAmountChange={onAmountChange}
            autoFocus={true}
          />

          <PresetAmounts presetAmounts={presetAmounts} onAmountSelect={onAmountSelect} />

          <ContinueButton label={t('continue')} onPress={onContinue} />
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  bottomSection: {
    flex: 1,
    paddingTop: spacing.sm,
    justifyContent: 'flex-end',
  },
});

export default AmountEditModal;
