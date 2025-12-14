import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatVND } from '@/shared/utils/format';

// Local deposit UI pieces
import { PresetAmounts, AmountInput, ContinueButton, TransferContentCard, DepositSkeleton, DepositError, BankSelectionModal, BankSelectionCard } from '../components';
import { useBankAccountData, useBankTypeManager } from '../hooks';
import type { VietQRBank } from '../types/bank';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';

const PRESETS = [200_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000];

const DepositContent: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('deposit');
  useStatusBarEffect('transparent', 'dark-content', true);

  const { currentBankType, isLoading: isBankTypeLoading } = useBankTypeManager();

  const { bankAccount, isLoading: isBankLoading, isError: isBankError, accountNumber, holderName } = useBankAccountData(currentBankType ?? undefined);

  // Local state for UI
  const [amount, setAmount] = useState<string>('');
  const [transferContent, setTransferContent] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<VietQRBank | undefined>();
  const [showBankModal, setShowBankModal] = useState(false);

  useEffect(() => {
    if (bankAccount) {
      const newContent = `Nap tien vao STK ${bankAccount.bankNumber} tai ENSOGO`;
      setTransferContent(newContent);
    }
  }, [bankAccount]);

  const errorMessage = useMemo(() => {
    if (!amount) return '';
    // Strip non-digits and parse
    const n = parseInt(amount.replace(/\D/g, '') || '0', 10);
    if (n <= 0) return t('errors.invalidAmount');
    if (n < 10_000) return t('errors.minAmount', { value: formatVND(10_000) });
    return '';
  }, [amount, t]);

  const onAmountChange = (newAmount: string) => {
    setAmount(newAmount);
  };

  const onAmountSelect = (value: number) => {
    setAmount(String(value));
    // Dismiss keyboard when preset is selected
    Keyboard.dismiss();
  };

  const handleBankSelect = (bank: VietQRBank) => {
    setSelectedBank(bank);
    setShowBankModal(false);
  };

  const handleBankModalClose = () => {
    setShowBankModal(false);
  };

  // Determine if continue button should be disabled
  const isContinueDisabled = !amount || !!errorMessage || !selectedBank;

  const onContinue = () => {
    if (errorMessage || !amount || !accountNumber) return;

    // Check if bank is selected, if not show bank selection modal
    if (!selectedBank) {
      setShowBankModal(true);
      return;
    }

    // Navigate to QR code deposit screen with the entered amount and transfer info
    navigation.navigate('QRCodeDeposit', {
      amount: parseInt(amount, 10),
      accountNumber,
      transferContent,
      selectedBank,
    });
  };

  if (isBankTypeLoading || isBankLoading) {
    return (
      <View style={styles.container}>
        <DepositSkeleton />
      </View>
    );
  }

  if (isBankError) {
    return (
      <View style={styles.container}>
        <DepositError errorMessage={t('errors.loadAccount')} onRetry={() => {
          // Trigger refetch will be handled by React Query
        }} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <AmountInput
        amount={amount}
        onAmountChange={onAmountChange}
        autoFocus={true}
        error={errorMessage}
      />

      <PresetAmounts
        presetAmounts={PRESETS}
        onAmountSelect={onAmountSelect}
        currentAmount={amount ? parseInt(amount, 10) : undefined}
      />

      <BankSelectionCard
        selectedBank={selectedBank}
        onPress={() => setShowBankModal(true)}
      />

      {/* <TransferContentCard transferContent={transferContent} /> */}

      <View style={styles.bottomSection}>
        <ContinueButton
          label={t('depositButton')}
          onPress={onContinue}
          disabled={isContinueDisabled}
        />
      </View>

      <BankSelectionModal
        visible={showBankModal}
        onClose={handleBankModalClose}
        onSelectBank={handleBankSelect}
        selectedBank={selectedBank}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  bottomSection: {
    flex: 1,
    // backgroundColor: colors.primary,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
});

export default DepositContent;
