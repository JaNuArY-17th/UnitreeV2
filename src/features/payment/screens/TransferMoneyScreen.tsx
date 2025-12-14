import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, dimensions, typography } from '@/shared/themes';
import { formatVND } from '@/shared/utils/format'
import {
  KeyboardDismissWrapper,
  ScreenHeader,
  Button,
  Text,
} from '@/shared/components'
import { HugeiconsIcon } from '@hugeicons/react-native'
import {
  ArrowRight02Icon,
  QrCodeIcon,
  Add01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons'
import { AmountInput, PresetAmounts, TransferContentCard } from '@/features/deposit/components';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';
import { useVietQRBanks, useBankAccount } from '@/features/deposit/hooks/useBankAccount';
import { useStoreBankAccountData, useBankTypeManager } from '@/features/deposit/hooks';
import { usePostpaidData } from '@/features/account/hooks';
import { NoteInput, TransferMethods, TransferMethodModal, PaymentSourceCard, PaymentSourceModal } from '../components';
import { bankTypeManager } from '../../deposit/utils/bankTypeManager';
import { useRecentRecipients } from '../hooks/useRecentRecipients';
import type {
  TransferRecipient,
  QuickNote,
  RecentRecipient,
  TransferMethod,
  Bank
} from '../types/transfer';
import type { PaymentSource } from '../components/PaymentSourceCard';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActiveRequiredOverlay from '@/shared/components/ActiveRequiredOverlay';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { VoucherSelectionModal } from '@/features/voucher/components';
import type {
  VoucherAvailabilityItem,
  VoucherDiscountCalculateResponse,
} from '@/features/voucher/types/voucherTypes';

type TransferMoneyScreenNavigationProp = NativeStackNavigationProp<any>;
type TransferMoneyScreenRouteProp = RouteProp<any, any>;

interface RouteParams {
  recipient?: TransferRecipient;
  amount?: string;
  note?: string;
  transferMode?: 'bank' | 'wallet';
  autoSelectedRecipient?: boolean;
  orderId?: string;
}

const MAX_AMOUNT = 5000000000; // 50 tỷ đồng
const MIN_AMOUNT = 5000; // 5 nghìn đồng

// Preset amounts for quick selection (same as deposit screen)
const PRESET_AMOUNTS = [200_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000];

export const TransferMoneyScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('payment');
  const { t: commonT } = useTranslation('common');
  const navigation = useNavigation<TransferMoneyScreenNavigationProp>();
  const route = useRoute<TransferMoneyScreenRouteProp>();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isNoteInputFocused, setIsNoteInputFocused] = useState(false);
  const noteInputRef = useRef<TextInput | null>(null);
  const [isTransferMethodModalVisible, setIsTransferMethodModalVisible] = useState(false);
  const [selectedTransferMethod, setSelectedTransferMethod] = useState<'bank' | 'wallet'>('bank');

  // Check if amount and note are from external screen (should be read-only)
  const [isAmountFromExternal, setIsAmountFromExternal] = useState(false);
  const [isNoteFromExternal, setIsNoteFromExternal] = useState(false);
  const [orderId, setOrderId] = useState<string | undefined>(undefined);

  const [selectedRecipient, setSelectedRecipient] = useState<TransferRecipient | null>(null);
  const [selectedPaymentSource, setSelectedPaymentSource] = useState<PaymentSource | null>(null);
  const [isPaymentSourceModalVisible, setIsPaymentSourceModalVisible] = useState(false);

  // Voucher state
  const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherAvailabilityItem | null>(null);
  const [voucherDiscountInfo, setVoucherDiscountInfo] = useState<VoucherDiscountCalculateResponse | null>(null);

  // Error modal state
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Fetch banks using React Query (same as deposit screen)
  const { data: banksResponse, isLoading: isLoadingBanks, isError: isBankError, refetch: refetchBanks } = useVietQRBanks();

  // Get dynamic bank type from the app's context (USER or STORE)
  const { currentBankType } = useBankTypeManager();

  // PRIMARY METHOD: Fetch fresh data from API using useBankAccount
  // Note: Convert null to undefined since useBankAccount expects BankType | undefined, not null
  const {
    data: apiBankData,
    isLoading: isApiFetching,
  } = useBankAccount(currentBankType ?? undefined);

  // FALLBACK: Get cached bank data from persistent storage
  const {
    bankBalance: cachedBalance,
    bankNumber: cachedAccountNumber,
    isLoading: cachedIsLoading,
    hasAccount: hasCachedAccount,
  } = useStoreBankAccountData();

  // Data priority logic: API → Cached → Default
  const apiBalance = apiBankData?.data?.bankBalance;
  const apiAccountNumber = apiBankData?.data?.bankNumber;
  const hasApiData = !!apiBankData?.data;

  // Determine which data source to use
  const bankBalance = hasApiData && apiBalance !== undefined
    ? apiBalance
    : (hasCachedAccount && cachedBalance !== undefined)
      ? cachedBalance
      : 0;

  const bankNumber = hasApiData && apiAccountNumber
    ? apiAccountNumber
    : (hasCachedAccount && cachedAccountNumber)
      ? cachedAccountNumber
      : '--';

  const hasAccount = hasApiData || hasCachedAccount;

  // Combine loading states
  const isBankLoading = isApiFetching || (!hasApiData && cachedIsLoading);

  const {
    data: postpaidData,
    isLoading: isPostpaidLoading,
  } = usePostpaidData();

  // Fetch recent recipients
  const { data: recentRecipientsResponse, isLoading: isLoadingRecentRecipients } = useRecentRecipients();

  // Amount validation and formatting
  const errorMessage = React.useMemo(() => {
    if (!amount) return '';
    const numericAmount = parseInt(amount);
    if (numericAmount <= 0) return t('transfer.errors.invalidAmount');
    if (numericAmount < MIN_AMOUNT) return t('transfer.minimumAmountDescription');
    if (numericAmount > MAX_AMOUNT) return t('transfer.maximumAmountDescription', { maxAmount: '5.000.000.000' });
    return '';
  }, [amount, t]);

  // Balance validation
  const balanceWarning = React.useMemo(() => {
    if (!amount || !selectedPaymentSource) return '';
    const numericAmount = parseInt(amount);
    const availableBalance = selectedPaymentSource.balance;

    if (numericAmount > availableBalance) {
      const sourceLabel = selectedPaymentSource.type === 'espay_later'
        ? t('paymentSource.espayLater') || 'ESPay Later'
        : t('paymentSource.mainAccount') || 'Main Account';

      return t('transfer.errors.balanceExceeded', {
        amount: formatVND(numericAmount),
        balance: formatVND(availableBalance),
        source: sourceLabel
      }) || `Transfer amount ${formatVND(numericAmount)} exceeds available balance ${formatVND(availableBalance)} in ${sourceLabel}.`;
    }
    return '';
  }, [amount, selectedPaymentSource, t]);


  // Get banks list from API response
  const banks = React.useMemo(() => {
    if (!banksResponse?.data) return [];
    // Filter banks that support transfers (same as deposit screen)
    return banksResponse.data.filter(bank => bank.transferSupported === 1);
  }, [banksResponse?.data]);

  // Bank error message
  const bankError = React.useMemo(() => {
    if (isBankError) return t('transferMethod.errorLoadingBanks');
    return null;
  }, [isBankError, t]);

  // Retry function for bank loading
  const handleRetryBanks = React.useCallback(() => {
    refetchBanks();
  }, [refetchBanks]);

  // Set default payment source when data is available
  useEffect(() => {
    if (!selectedPaymentSource && hasAccount && !isBankLoading) {
      // Default to main account if available
      setSelectedPaymentSource({
        id: 'main_account',
        type: 'main_account',
        balance: bankBalance || 0,
        accountNumber: bankNumber || '--',
        isDefault: true,
      });
    }
  }, [hasAccount, bankBalance, bankNumber, isBankLoading, selectedPaymentSource]);

  // Update selected payment source balance when fresh data arrives
  useEffect(() => {
    if (selectedPaymentSource && selectedPaymentSource.type === 'main_account') {
      // Update main account balance with latest data
      if (bankBalance !== selectedPaymentSource.balance || bankNumber !== selectedPaymentSource.accountNumber) {
        setSelectedPaymentSource(prev => prev ? {
          ...prev,
          balance: bankBalance || 0,
          accountNumber: bankNumber || '--',
        } : null);
      }
    }
  }, [bankBalance, bankNumber, selectedPaymentSource]);

  // Handle ESPay Later becoming unavailable (balance = 0)
  useEffect(() => {
    if (selectedPaymentSource?.type === 'espay_later' && postpaidData?.success && postpaidData?.data) {
      const availableCredit = postpaidData.data.creditLimit - postpaidData.data.spentCredit;
      if (availableCredit <= 0 && hasAccount) {
        // Switch to main account if ESPay Later becomes unavailable
        setSelectedPaymentSource({
          id: 'main_account',
          type: 'main_account',
          balance: bankBalance || 0,
          accountNumber: bankNumber || '--',
          isDefault: true,
        });
      }
    }
  }, [selectedPaymentSource, postpaidData, hasAccount, bankBalance, bankNumber]);

  // Handle navigation parameters from QR scan
  useEffect(() => {
    const params = route.params as RouteParams | undefined;
    const r = params?.recipient;
    if (r && (r.name || r.accountNumber || r.bankName || r.bankCode)) {
      setSelectedRecipient(r);
    } else {
      setSelectedRecipient(null);
    }
    if (params?.amount) {
      setAmount(params.amount);
      setIsAmountFromExternal(true);
    }
    if (params?.note && !params?.orderId) {
      setNote(params.note);
      setIsNoteFromExternal(true);
    }
    if (params?.orderId) {
      console.log('🔍 [TransferMoneyScreen] OrderId from params:', params.orderId);
      setOrderId(params.orderId);
    }
    // Set transfer method based on transferMode parameter
    if (params?.transferMode) {
      setSelectedTransferMethod(params.transferMode);

      // If it's a wallet transfer with auto-selected recipient, don't open the modal
      // The recipient is already set above
      if (params.transferMode === 'wallet' && !params.autoSelectedRecipient) {
        setIsTransferMethodModalVisible(true);
      }
    }
  }, [route.params]);

  // Khi nhận recipient từ modal
  const handleRecipientFromModal = (recipient?: TransferRecipient) => {
    if (recipient) {
      setSelectedRecipient({
        ...recipient,
        logoUrl: recipient.isEzyWallet ? undefined : (recipient.logoUrl || (recipient.bankCode ? `https://api.vietqr.io/image/${recipient.bankCode}.png` : undefined)),
      });
    }
    setIsTransferMethodModalVisible(false);
  };

  const recentRecipients: RecentRecipient[] = recentRecipientsResponse?.data?.recentRecipients || [];

  const transferMethods: TransferMethod[] = [
    // Temporarily commented out bank option
    // {
    //   id: 'bank',
    //   icon: <View style={[styles.methodIconContainer, styles.bankIconContainer]}>
    //     <BankIcon width={30} height={30} />
    //   </View>,
    //   text: t('transfer.methods.bank'),
    //   onPress: () => handleTransferMethodPress('bank')
    // },
    {
      id: 'wallet',
      icon: <View style={[styles.methodIconContainer, styles.walletIconContainer]}>
        {/* <Wallet width={32} height={32} color={colors.primary} /> */}
        <HugeiconsIcon icon={Add01Icon} size={16} color={colors.primary} />
      </View>,
      text: '',
      onPress: () => handleTransferMethodPress('wallet')
    }
  ];

  const quickNotes: QuickNote[][] = [
    // Row 1
    [
      { id: 'rent', text: t('transfer.quickNotes.rent') },
      { id: 'payment', text: t('transfer.quickNotes.payment') },
      { id: 'food', text: t('transfer.quickNotes.food') },
      { id: 'shopping', text: t('transfer.quickNotes.shopping') },
      { id: 'monthly', text: t('transfer.quickNotes.monthly') },
      { id: 'tuition', text: t('transfer.quickNotes.tuition') },
      { id: 'bill', text: t('transfer.quickNotes.bill') },
      { id: 'travel', text: t('transfer.quickNotes.travel') },
      { id: 'deposit', text: t('transfer.quickNotes.deposit') },
      { id: 'salary', text: t('transfer.quickNotes.salary') },
      { id: 'debt', text: t('transfer.quickNotes.debt') },
    ],
  ];


  const handleAmountChange = (newAmount: string) => {
    if (newAmount.length <= 10) { // Max 10 digits for 50,000,000,000
      setAmount(newAmount);
    }
  };

  const handleAmountSelect = (value: number) => {
    setAmount(String(value));
  };

  const handleVoucherPress = () => {
    if (!orderId) {
      console.log('⚠️ [TransferMoneyScreen] No orderId available for voucher selection');
      return;
    }
    console.log('🔄 [TransferMoneyScreen] Opening voucher modal for order:', orderId);
    setIsVoucherModalVisible(true);
  };

  const handleVoucherApply = (
    voucher: VoucherAvailabilityItem,
    discountInfo: VoucherDiscountCalculateResponse,
  ) => {
    console.log('✅ [TransferMoneyScreen] Voucher applied:', voucher.code);
    console.log('✅ [TransferMoneyScreen] Discount amount:', discountInfo.discountAmount);
    console.log('✅ [TransferMoneyScreen] Final amount:', discountInfo.finalAmount);
    setSelectedVoucher(voucher);
    setVoucherDiscountInfo(discountInfo);
    setIsVoucherModalVisible(false);
  };

  const handleRemoveVoucher = () => {
    console.log('🔄 [TransferMoneyScreen] Removing voucher');
    setSelectedVoucher(null);
    setVoucherDiscountInfo(null);
  };

  const handleContinue = async () => {
    if (!amount) {
      // Show error for empty amount
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền chuyển khoản');
      return;
    }

    if (errorMessage) {
      // Show error if validation fails
      Alert.alert('Lỗi', errorMessage);
      return;
    }

    // Check balance validation
    if (selectedPaymentSource && amount) {
      const transferAmount = parseInt(amount, 10);
      const availableBalance = selectedPaymentSource.balance;

      if (transferAmount > availableBalance) {
        const sourceLabel = selectedPaymentSource.type === 'espay_later'
          ? t('paymentSource.espayLater') || 'ESPay Later'
          : t('paymentSource.mainAccount') || 'Main Account';

        Alert.alert(
          t('transfer.errors.insufficientBalance') || 'Insufficient Balance',
          t('transfer.errors.balanceExceeded', {
            amount: formatVND(transferAmount),
            balance: formatVND(availableBalance),
            source: sourceLabel
          }) || `Transfer amount ${formatVND(transferAmount)} exceeds available balance ${formatVND(availableBalance)} in ${sourceLabel}.`
        );
        return;
      }
    }

    if (selectedRecipient) {
      // Get current bank type
      const currentBankType = await bankTypeManager.getBankType();

      // Navigate to confirmation screen
      navigation.navigate('TransferConfirm' as any, {
        amount,
        note,
        recipient: {
          name: selectedRecipient.name,
          accountNumber: selectedRecipient.accountNumber,
          bankName: selectedRecipient.isEzyWallet ? 'ESPay Wallet' : selectedRecipient.bankName,
          bankCode: selectedRecipient.bankCode,
          logoUrl: selectedRecipient.isEzyWallet ? undefined : (selectedRecipient.logoUrl || (selectedRecipient.bankCode ? `https://api.vietqr.io/image/${selectedRecipient.bankCode}.png` : undefined)),
          isEzyWallet: selectedRecipient.isEzyWallet,
          bankType: selectedRecipient.bankType || currentBankType || 'USER',
        },
        paymentSource: selectedPaymentSource,
        orderId,
        ...(selectedVoucher && voucherDiscountInfo && {
          voucherInfo: {
            voucherCode: selectedVoucher.code,
            originalAmount: voucherDiscountInfo.originalAmount,
            discountAmount: voucherDiscountInfo.discountAmount,
            finalAmount: voucherDiscountInfo.finalAmount,
          },
        }),
      });
    } else {
      // Open the appropriate transfer method modal based on selectedTransferMethod
      setIsTransferMethodModalVisible(true);
    }
  };

  const handleTransferMethodPress = (method: 'bank' | 'wallet') => {
    setSelectedTransferMethod(method);
    setIsTransferMethodModalVisible(true);
  };

  const handlePaymentSourcePress = () => {
    setIsPaymentSourceModalVisible(true);
  };

  const handlePaymentSourceSelect = (source: PaymentSource) => {
    setSelectedPaymentSource(source);
    setIsPaymentSourceModalVisible(false);
  };

  const handleScanQRCode = () => {
    navigation.replace('ScanQRScreen');
  };

  const handleRecipientSelect = (recipient: RecentRecipient) => {
    const transferRecipient: TransferRecipient = {
      id: recipient.id,
      name: recipient.bankHolder,
      accountNumber: recipient.bankNumber,
      bankName: recipient.bankType === 'USER' ? 'ESPay Wallet' : 'Bank Account',
      bankCode: recipient.bankType === 'USER' ? 'ESPAY' : '',
      isEzyWallet: recipient.bankType === 'USER',
      bankType: recipient.bankType,
    };
    setSelectedRecipient(transferRecipient);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <VerificationRequiredOverlay>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor='transparent' />
        <KeyboardDismissWrapper style={styles.container}>
          {/* Header */}
          <ScreenHeader
            title={t('transfer.title')}
            onBackPress={handleGoBack}
            centerTitle
            actions={[
              {
                key: 'qr',
                icon: <HugeiconsIcon icon={QrCodeIcon} size={24} color={colors.primary} />,
                onPress: handleScanQRCode,
              }
            ]}
          />

          <View style={styles.content}>
            {/* Payment Source Selection */}
            <View style={styles.paymentSourceSection}>
              <PaymentSourceCard
                selectedSource={selectedPaymentSource || undefined}
                onPress={handlePaymentSourcePress}
              />
            </View>

            {/* Transfer Options and Recent Recipients - Hidden when from external unless orderId exists */}
            {(!isAmountFromExternal && !isNoteFromExternal) || !!orderId ? (
              <TransferMethods
                sectionTitle={t('transfer.receiver')}
                transferMethods={transferMethods}
                selectedRecipient={selectedRecipient}
                recentRecipients={recentRecipients}
                onRecipientRemove={() => setSelectedRecipient(null)}
                onTransferMethodPress={handleTransferMethodPress}
                onRecipientSelect={handleRecipientSelect}
                disabled={isAmountFromExternal}
              />
            ) : null}

            {/* Amount Input */}
            <AmountInput
              amount={amount}
              onAmountChange={handleAmountChange}
              autoFocus={true}
              editable={!isAmountFromExternal}
              error={balanceWarning ? t('transfer.errors.insufficientBalanceHelper') : errorMessage}
            />

            {/* Preset Amounts - Hidden when amount is from external */}
            <View style={styles.paymentSourceSection}>
              {!isAmountFromExternal && (
                <PresetAmounts
                  presetAmounts={PRESET_AMOUNTS}
                  onAmountSelect={handleAmountSelect}
                  currentAmount={amount ? parseInt(amount, 10) : undefined}
                />
              )}
            </View>

            {/* Voucher Selection - Only show when orderId exists */}
            {orderId && (
              <View style={styles.voucherSection}>
                <TouchableOpacity
                  style={[
                    styles.voucherCard,
                    selectedVoucher && styles.voucherCardSelected,
                  ]}
                  onPress={handleVoucherPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.voucherCardContent}>
                    <View style={styles.voucherIcon}>
                      <HugeiconsIcon
                        icon={Add01Icon}
                        size={24}
                        color={selectedVoucher ? colors.success : colors.primary}
                      />
                    </View>
                    <View style={styles.voucherInfo}>
                      {selectedVoucher && voucherDiscountInfo ? (
                        <>
                          <Text style={styles.voucherCode}>
                            {selectedVoucher.code}
                          </Text>
                          <Text style={styles.voucherDiscount}>
                            -{formatVND(voucherDiscountInfo.discountAmount)}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.voucherTitle}>
                            {t('voucher.selectVoucher', 'Select Voucher')}
                          </Text>
                          <Text style={styles.voucherSubtitle}>
                            {t('voucher.tapToSelect', 'Tap to select a voucher')}
                          </Text>
                        </>
                      )}
                    </View>
                    {selectedVoucher ? (
                      <TouchableOpacity
                        onPress={handleRemoveVoucher}
                        style={styles.removeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          size={20}
                          color={colors.text.secondary}
                        />
                      </TouchableOpacity>
                    ) : (
                      <HugeiconsIcon
                        icon={ArrowRight02Icon}
                        size={20}
                        color={colors.text.secondary}
                      />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Display final amount with discount */}
                {voucherDiscountInfo && (
                  <View style={styles.discountSummary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        {t('transfer.originalAmount', 'Original Amount')}:
                      </Text>
                      <Text style={styles.summaryValue}>
                        {formatVND(parseInt(amount || '0'))}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, styles.discountLabel]}>
                        {t('transfer.discount', 'Discount')}:
                      </Text>
                      <Text style={[styles.summaryValue, styles.discountValue]}>
                        -{formatVND(voucherDiscountInfo.discountAmount)}
                      </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.finalRow]}>
                      <Text style={[styles.summaryLabel, styles.finalLabel]}>
                        {t('transfer.finalAmount', 'Final Amount')}:
                      </Text>
                      <Text style={[styles.summaryValue, styles.finalValue]}>
                        {formatVND(voucherDiscountInfo.finalAmount)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Note Input */}
            {!orderId && (
              <NoteInput
                label={t('transfer.note')}
                note={note}
                onNoteChange={setNote}
                placeholder={t('transfer.notePrefix.placeholder')}
                quickNotes={quickNotes}
                isNoteInputFocused={isNoteInputFocused}
                onNoteInputFocus={setIsNoteInputFocused}
                noteInputRef={noteInputRef}
                editable={!isNoteFromExternal}
              />
            )}

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              {/* Button Row - Back and Continue */}
              <View style={styles.buttonRow}>
                <Button
                  label={commonT('common.back')}
                  onPress={handleGoBack}
                  variant="outline"
                  size="lg"
                  style={styles.backButton}
                />
                <Button
                  label={t('transfer.continue')}
                  onPress={handleContinue}
                  variant="primary"
                  size="lg"
                  style={styles.continueButton}
                  disabled={!amount || !!(errorMessage || balanceWarning)}
                />
              </View>
            </View>
          </View>

          <TransferMethodModal
            isVisible={isTransferMethodModalVisible}
            onClose={handleRecipientFromModal}
            onManagePress={() => navigation.navigate('Contact')}
            preSelectedRecipient={
              selectedRecipient && selectedRecipient.isEzyWallet
                ? {
                  name: selectedRecipient.name,
                  accountNumber: selectedRecipient.accountNumber,
                  isEzyWallet: true
                }
                : undefined
            }
          />

          <PaymentSourceModal
            visible={isPaymentSourceModalVisible}
            onClose={() => setIsPaymentSourceModalVisible(false)}
            onSelectSource={handlePaymentSourceSelect}
            selectedSource={selectedPaymentSource || undefined}
          />

          {/* Voucher Selection Modal */}
          {orderId && (
            <VoucherSelectionModal
              visible={isVoucherModalVisible}
              onClose={() => setIsVoucherModalVisible(false)}
              orderId={orderId}
              orderAmount={parseInt(amount || '0', 10)}
              onVoucherApply={handleVoucherApply}
              currentSelectedVoucherId={selectedVoucher?.id}
            />
          )}

          {/* Error Modal for Amount */}
          {errorModalVisible && (
            <View style={styles.errorModal}>
              {/* Add your error modal implementation here */}
            </View>
          )}
        </KeyboardDismissWrapper>
      </View>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: dimensions.radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 8,
  },
  bankIconContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    width: 52,
    height: 52,
    borderRadius: dimensions.radius.xl * 1.3,
  },
  walletIconContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    // width: 52,
    // height: 52,
    borderRadius: dimensions.radius.round,
    borderStyle: 'dashed',
  },
  continueButtonContainer: {
    // paddingHorizontal: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
  paymentSourceSection: {
    // paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  voucherSection: {
    marginBottom: spacing.lg,
  },
  voucherCard: {
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  voucherCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.light,
  },
  voucherCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherIcon: {
    width: 40,
    height: 40,
    borderRadius: spacing.sm,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  voucherSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  voucherCode: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  voucherDiscount: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  removeButton: {
    padding: spacing.xs,
  },
  discountSummary: {
    backgroundColor: colors.light,
    borderRadius: spacing.sm,
    padding: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  discountLabel: {
    color: colors.success,
  },
  discountValue: {
    color: colors.success,
  },
  finalRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 0,
  },
  finalLabel: {
    fontWeight: '700',
  },
  finalValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
  },
  errorModal: {
    // Add error modal styles
  },
});
