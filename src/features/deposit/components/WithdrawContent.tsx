import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatVND } from '@/shared/utils/format';

// Reuse deposit UI components for withdraw functionality
import { PresetAmounts, AmountInput, ContinueButton, TransferContentCard, DepositSkeleton, DepositError, LinkedBankSelectionModal, LinkedBankSelectionCard } from '../components';
import { useBankAccountData, useLinkedBanks, useBankAccount, useBankTypeManager, useStoreBankAccountData } from '../hooks';
import { useWithdrawInitiate } from '../hooks/withdraw';
import type { LinkedBank } from '../types/bank';
import ActiveRequiredOverlay, { useIsOverlayDisabled } from '@/shared/components/ActiveRequiredOverlay';

const PRESETS = [200_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000];

const WithdrawContent: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('withdraw');

  // Get dynamic bank type from the app's context (USER or STORE)
  const { currentBankType } = useBankTypeManager();

  // PRIMARY METHOD: Fetch fresh data from API using useBankAccount
  const {
    data: apiBankData,
    isLoading: isApiFetching,
    error: apiError
  } = useBankAccount(currentBankType ?? undefined);

  // FALLBACK: Get cached bank data from persistent storage
  const {
    bankBalance: cachedBalance,
    bankNumber: cachedAccountNumber,
    isLoading: cachedIsLoading,
    hasAccount: hasCachedAccount,
  } = useStoreBankAccountData();

  // Data priority logic: API → Cached → useBankAccountData hook
  const apiBalance = apiBankData?.data?.bankBalance;
  const apiAccountNumber = apiBankData?.data?.bankNumber;
  const hasApiData = !!apiBankData?.data;

  // Determine which data source to use
  const balance = hasApiData && apiBalance !== undefined
    ? apiBalance
    : (hasCachedAccount && cachedBalance !== undefined)
      ? cachedBalance
      : 0;

  const accountNumber = hasApiData && apiAccountNumber
    ? apiAccountNumber
    : (hasCachedAccount && cachedAccountNumber)
      ? cachedAccountNumber
      : undefined;

  // Combine loading states
  const isBankLoading = isApiFetching || (!hasApiData && cachedIsLoading);
  const isBankError = !!apiError && !hasCachedAccount;

  // Keep old useBankAccountData for bankAccount object compatibility (if needed elsewhere)
  const { bankAccount } = useBankAccountData();

  // Fetch linked banks to auto-select default
  const { data: linkedBanksResponse } = useLinkedBanks();
  const linkedBanks = linkedBanksResponse?.data || [];

  // Local state for UI
  const [amount, setAmount] = useState<string>('');
  const [transferContent, setTransferContent] = useState<string>('');
  const [selectedLinkedBank, setSelectedLinkedBank] = useState<LinkedBank | undefined>();
  const [showLinkedBankModal, setShowLinkedBankModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const withdrawInitiate = useWithdrawInitiate();

  useEffect(() => {
    if (bankAccount) {
      // Set transfer content based on bank account data
      setTransferContent(`Rut tien tu STK ${bankAccount.bankNumber} tai ENSOGO`);
    }
  }, [bankAccount]);

  // Auto-select default linked bank (runs when linked banks load and none selected yet)
  useEffect(() => {
    if (!selectedLinkedBank && linkedBanks.length) {
      const defaultBank = linkedBanks.find(b => b.isDefault);
      setSelectedLinkedBank(defaultBank || linkedBanks[0]);
    }
  }, [linkedBanks, selectedLinkedBank]);

  const errorMessage = useMemo(() => {
    if (!amount) return '';
    // Strip non-digits and parse
    const n = parseInt(amount.replace(/\D/g, '') || '0', 10);
    if (n <= 0) return t('errors.invalidAmount');
    if (n < 10_000) return t('errors.minAmount', { value: formatVND(10_000) });
    if (balance && n > balance) return t('errors.insufficientBalance', { value: formatVND(balance) });
    return '';
  }, [amount, t, balance]);

  const onAmountChange = (newAmount: string) => {
    setAmount(newAmount);
  };

  const onAmountSelect = (value: number) => {
    setAmount(String(value));
  };

  const handleLinkedBankSelect = (bank: LinkedBank) => {
    setSelectedLinkedBank(bank);
    setShowLinkedBankModal(false);
  };

  const handleLinkedBankModalClose = () => {
    setShowLinkedBankModal(false);
  };

  const handleLinkNewBank = () => {
    setShowLinkedBankModal(false);
    navigation.navigate('LinkBank');
  };

  const onContinue = async () => {
    if (errorMessage || !amount) return;
    if (!accountNumber || !balance) {
      // Provide feedback instead of silent fail
      Alert.alert(
        t('errors.error', 'Lỗi'),
        t('errors.loadAccount', 'Không thể tải thông tin tài khoản')
      );
      return;
    }

    // Check if linked bank is selected, if not show linked bank selection modal
    if (!selectedLinkedBank) {
      setShowLinkedBankModal(true);
      return;
    }

    // Prevent duplicate submissions
    if (isProcessing) return;

    setIsProcessing(true);

    // Initiate withdraw to get temp transaction + OTP
    try {
      const numericAmount = parseInt(amount, 10);
      const res = await withdrawInitiate.mutateAsync({
        request: {
          amount: numericAmount,
          linkedAccountId: selectedLinkedBank.id,
        },
        // params can be omitted to use current bank type
      });

      if (res?.success && res?.data) {
        // Navigate to withdraw confirmation / OTP screen (assuming route exists)
        // Some route param types may not yet include tempTransactionId / otpExpirySeconds; cast to any to extend payload
        navigation.navigate('WithdrawConfirmation', {
          amount: numericAmount,
          accountNumber,
          transferContent,
          availableBalance: balance,
          linkedBank: selectedLinkedBank ? {
            name: selectedLinkedBank.name,
            number: selectedLinkedBank.number,
            holderName: selectedLinkedBank.holderName,
            code: selectedLinkedBank.code,
            shortname: selectedLinkedBank.shortname,
          } : undefined,
          // Extended fields for OTP phase
          requestId: res.data.requestId,
          phoneNumber: res.data.phoneNumber,
          otpExpirySeconds: res.data.expireInSeconds,
        } as any);
      } else {
        // Handle unsuccessful response
        Alert.alert(
          t('errors.error', 'Lỗi'),
          res?.message || t('errors.withdrawInitiateFailed', 'Không thể khởi tạo giao dịch rút tiền')
        );
      }
    } catch (e: any) {
      console.warn('Withdraw initiate failed', e);
      // Show user-friendly error message
      Alert.alert(
        t('errors.error', 'Lỗi'),
        e?.message || t('errors.networkError', 'Đã xảy ra lỗi mạng. Vui lòng thử lại.')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isBankLoading) {
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
    <ActiveRequiredOverlay backgroundColor={colors.background} showHeader={false}>
      <WithdrawContentInner
        amount={amount}
        onAmountChange={onAmountChange}
        presets={PRESETS}
        onAmountSelect={onAmountSelect}
        selectedLinkedBank={selectedLinkedBank}
        onShowLinkedBankModal={() => setShowLinkedBankModal(true)}
        transferContent={transferContent}
        isProcessing={isProcessing}
        errorMessage={errorMessage}
        onContinue={onContinue}
        showLinkedBankModal={showLinkedBankModal}
        onLinkedBankModalClose={handleLinkedBankModalClose}
        onLinkedBankSelect={handleLinkedBankSelect}
        onLinkNewBank={handleLinkNewBank}
        t={t}
      />
    </ActiveRequiredOverlay>
  );
};

/**
 * Inner component that can access the overlay disabled context
 */
const WithdrawContentInner: React.FC<{
  amount: string;
  onAmountChange: (amount: string) => void;
  presets: number[];
  onAmountSelect: (value: number) => void;
  selectedLinkedBank: LinkedBank | undefined;
  onShowLinkedBankModal: () => void;
  transferContent: string;
  isProcessing: boolean;
  errorMessage: string;
  onContinue: () => void;
  showLinkedBankModal: boolean;
  onLinkedBankModalClose: () => void;
  onLinkedBankSelect: (bank: LinkedBank) => void;
  onLinkNewBank: () => void;
  t: any;
}> = ({
  amount,
  onAmountChange,
  presets,
  onAmountSelect,
  selectedLinkedBank,
  onShowLinkedBankModal,
  transferContent,
  isProcessing,
  errorMessage,
  onContinue,
  showLinkedBankModal,
  onLinkedBankModalClose,
  onLinkedBankSelect,
  onLinkNewBank,
  t,
}) => {
    // Check if overlay is disabling this content
    const isDisabled = useIsOverlayDisabled();

    // Determine if continue button should be disabled
    const isContinueDisabled = !amount || !!errorMessage || !selectedLinkedBank || isProcessing;

    const handleAmountSelect = (value: number) => {
      onAmountSelect(value);
      // Dismiss keyboard when preset is selected
      Keyboard.dismiss();
    };

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
          autoFocus={!isDisabled}
          error={errorMessage}
        />

        <PresetAmounts
          presetAmounts={presets}
          onAmountSelect={handleAmountSelect}
          currentAmount={amount ? parseInt(amount, 10) : undefined}
        />

        <LinkedBankSelectionCard
          selectedBank={selectedLinkedBank}
          onPress={onShowLinkedBankModal}
        />

        {/* <TransferContentCard transferContent={transferContent} /> */}

        <View style={styles.bottomSection}>
          <ContinueButton
            label={isProcessing ? t('processingButton', 'Processing...') : t('withdrawButton')}
            onPress={onContinue}
            disabled={isContinueDisabled}
          />
        </View>

        <LinkedBankSelectionModal
          visible={showLinkedBankModal}
          onClose={onLinkedBankModalClose}
          onSelectBank={onLinkedBankSelect}
          selectedBank={selectedLinkedBank}
          onLinkNewBank={onLinkNewBank}
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
});

export default WithdrawContent;
