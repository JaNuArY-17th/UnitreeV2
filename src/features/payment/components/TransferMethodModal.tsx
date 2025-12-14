import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, ScrollView, StyleSheet, SectionList, Alert } from 'react-native';
import { Text, Input as TextInput } from '@/shared/components/base';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal, Body } from '@/shared/components/base';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { EnsogoFlowerLogo } from '@/shared/assets/images';
import type { TransferRecipient, RecentRecipient } from '../types/transfer';
import { bankTypeManager } from '../../deposit/utils/bankTypeManager';
import { RecipientService } from '../services/RecipientService';
import { TransferService } from '../services/TransferService';
import { useQuery } from '@tanstack/react-query';
import { useBankAccount } from '@/features/deposit/hooks';


type TransferMethodBottomSheetProps = {
  isVisible: boolean;
  onClose: (recipient?: TransferRecipient) => void;
  onManagePress?: () => void;
  preSelectedRecipient?: { name: string; accountNumber: string; isEzyWallet?: boolean };
};

export const TransferMethodModal: React.FC<TransferMethodBottomSheetProps> = ({
  isVisible,
  onClose,
  onManagePress,
  preSelectedRecipient,
}) => {
  const { t } = useTranslation('payment');

  const [accountNumberInput, setAccountNumberInput] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountError, setAccountError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Get both USER and STORE bank accounts to compare with entered account
  const { data: userBankData } = useBankAccount('USER');
  const { data: storeBankData } = useBankAccount('STORE');

  // Fetch recent recipients
  const { data: recentRecipientsData, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recentRecipients'],
    queryFn: () => RecipientService.getRecentRecipients({ limit: 10 }),
    enabled: isVisible,
  });

  const recentRecipients = recentRecipientsData?.data?.recentRecipients || [];

  // Sort and group recent recipients by first letter of last name
  const groupedRecentRecipients = React.useMemo(() => {
    // Sort recipients alphabetically by last name
    const sortedRecipients = [...recentRecipients].sort((a, b) => {
      const getLastName = (name: string) => {
        const parts = name.trim().split(/\s+/);
        return parts[parts.length - 1] || name;
      };

      const lastNameA = getLastName(a.bankHolder);
      const lastNameB = getLastName(b.bankHolder);

      return lastNameA.localeCompare(lastNameB);
    });

    // Group by first letter of last name
    const groups: { [key: string]: RecentRecipient[] } = {};
    sortedRecipients.forEach(recipient => {
      const nameParts = recipient.bankHolder.trim().split(/\s+/);
      const lastName = nameParts[nameParts.length - 1] || recipient.bankHolder;
      const firstLetter = lastName.charAt(0).toUpperCase();

      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(recipient);
    });

    // Convert to sections format
    return Object.keys(groups)
      .sort()
      .map(letter => ({
        title: letter,
        data: groups[letter],
      }));
  }, [recentRecipients]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      setAccountNumberInput('');
      setAccountNumber('');
      setAccountName('');
      setAccountError('');
      setIsVerifying(false);
      setAccountMessage('');
      setMessageType('');

      // Handle pre-selected recipient
      if (preSelectedRecipient?.isEzyWallet) {
        setAccountNumberInput(preSelectedRecipient.accountNumber);
        setAccountNumber(preSelectedRecipient.accountNumber);
        setAccountName(preSelectedRecipient.name);
      }
    }
  }, [isVisible, preSelectedRecipient]);

  const handleAccountVerify = async () => {
    if (!accountNumberInput.trim()) {
      setAccountError(t('transferMethod.errors.accountRequired'));
      return;
    }

    setIsVerifying(true);
    setAccountError('');
    setAccountMessage('');
    setMessageType('');

    try {
      // Transform account number to uppercase for API call
      const uppercaseAccountNumber = accountNumberInput.trim().toUpperCase();
      const response = await TransferService.searchAccountByNumber(uppercaseAccountNumber);

      // Always display the message from API response
      if (response.message) {
        setAccountMessage(response.message);
        setMessageType(response.success ? 'success' : 'error');
      }

      if (response.success && response.data) {
        // Get current user's bank account numbers
        const userAccountNumber = userBankData?.data?.bankNumber || '';
        const storeAccountNumber = storeBankData?.data?.bankNumber || '';
        const verifiedAccountNumber = uppercaseAccountNumber;

        console.log('🔍 [TransferMethodModal] Checking verified account:', {
          verifiedAccount: verifiedAccountNumber,
          userAccount: userAccountNumber,
          storeAccount: storeAccountNumber,
        });

        // Check if verified account matches current user's accounts
        if (verifiedAccountNumber &&
          (verifiedAccountNumber === userAccountNumber || verifiedAccountNumber === storeAccountNumber)) {
          console.warn('⚠️ [TransferMethodModal] Self-transfer detected - entered own account');

          // Show alert and clear the form
          Alert.alert(
            t('transferMethod.selfTransferTitle', 'Không thể chuyển tiền'),
            t('transferMethod.selfTransferMessage', 'Bạn không thể chuyển tiền cho chính mình. Vui lòng nhập số tài khoản của người nhận khác.'),
            [
              {
                text: t('transferMethod.ok', 'OK'),
                onPress: () => {
                  // Reset form
                  setAccountNumberInput('');
                  setAccountNumber('');
                  setAccountName('');
                  setAccountError('');
                  setAccountMessage('');
                  setMessageType('');
                }
              },
            ]
          );
          setIsVerifying(false);
          return;
        }

        setAccountName(response.data.accountName);
        setAccountNumber(uppercaseAccountNumber); // Set the verified account number
      } else {
        setAccountError(response.message || t('transferMethod.errors.accountNotFound'));
      }
    } catch (error) {
      console.error('Account verification error:', error);

      // Try to get message from API response if available
      const apiMessage = (error as any)?.message || (error as any)?.response?.data?.message;
      const errorMessage = apiMessage || t('transferMethod.errors.verificationFailed');

      setAccountError(errorMessage);
      setAccountMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = async () => {
    if (!accountNumber) {
      setAccountError(t('transferMethod.errors.accountRequired'));
      return;
    }

    const finalAccountName = accountName || `Account ${accountNumber}`;

    // Get current bank type
    const currentBankType = await bankTypeManager.getBankType();

    const recipient: TransferRecipient = {
      name: finalAccountName,
      accountNumber: accountNumber, // Already transformed to uppercase during verification
      bankName: 'ESPay Wallet',
      bankCode: 'ESPAY',
      isEzyWallet: true,
      bankType: currentBankType || 'USER',
    };

    onClose(recipient);
  };

  const handleRecentRecipientSelect = (recipient: RecentRecipient) => {
    // Get current user's bank account numbers
    const userAccountNumber = userBankData?.data?.bankNumber || '';
    const storeAccountNumber = storeBankData?.data?.bankNumber || '';
    const selectedAccountNumber = recipient.bankNumber;

    console.log('🔍 [TransferMethodModal] Checking selected recent recipient:', {
      selectedAccount: selectedAccountNumber,
      userAccount: userAccountNumber,
      storeAccount: storeAccountNumber,
    });

    // Check if selected account matches current user's accounts
    if (selectedAccountNumber &&
      (selectedAccountNumber === userAccountNumber || selectedAccountNumber === storeAccountNumber)) {
      console.warn('⚠️ [TransferMethodModal] Self-transfer detected - selected own account from recent');

      // Show alert
      Alert.alert(
        t('transferMethod.selfTransferTitle', 'Không thể chuyển tiền'),
        t('transferMethod.selfTransferMessage', 'Bạn không thể chuyển tiền cho chính mình. Vui lòng chọn người nhận khác.'),
        [
          {
            text: t('transferMethod.ok', 'OK')
          },
        ]
      );
      return;
    }

    const transferRecipient: TransferRecipient = {
      name: recipient.bankHolder,
      accountNumber: recipient.bankNumber,
      bankName: 'ESPay Wallet',
      bankCode: 'ESPAY',
      isEzyWallet: true,
      bankType: recipient.bankType,
    };

    onClose(transferRecipient);
  };

  const renderRecentRecipient = (recipient: RecentRecipient, index: number, isLast: boolean) => {
    const generateInitials = (name: string): string => {
      const words = name.trim().split(/\s+/);
      if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
      }
      const firstInitial = words[0].charAt(0).toUpperCase();
      const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
      return firstInitial + lastInitial;
    };

    const initials = generateInitials(recipient.bankHolder);

    return (
      <View style={styles.recentRecipientContainer}>
        <TouchableOpacity
          style={styles.recentRecipientItem}
          onPress={() => handleRecentRecipientSelect(recipient)}
          accessibilityRole="button"
          accessibilityLabel={`Select ${recipient.bankHolder}`}
        >
          <View style={styles.recentRecipientAvatar}>
            <Text style={styles.recentRecipientInitials}>{initials}</Text>
            <View style={styles.logoOverlay}>
              <View style={{ top: 0.5 }}>
                <EnsogoFlowerLogo width={12} height={12} color={colors.light} />
              </View>
            </View>
          </View>
          <View style={styles.recentRecipientInfo}>
            <Body style={styles.recentRecipientName} numberOfLines={1}>
              {recipient.bankHolder}
            </Body>
            <Body style={styles.recentRecipientAccount} numberOfLines={1}>
              {recipient.bankNumber}
            </Body>
          </View>
        </TouchableOpacity>
        {!isLast && <View style={styles.recentRecipientSeparator} />}
      </View>
    );
  };

  const renderWalletInput = () => (
    <View style={styles.inputFormContainer}>
      <View style={styles.walletInput}>
        <View style={styles.walletHeader}>
          <Body style={styles.walletTitle}>
            {t('transferMethod.enterAccountNumber') || 'Enter account number or phone number'}
          </Body>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            // style={[styles.accountInput, accountError ? styles.inputError : null]}
            value={accountNumberInput}
            onChangeText={setAccountNumberInput}
            keyboardType="default"
            maxLength={20}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('transferMethod.enterAccountNumber') || 'Enter account number or phone number'}
            placeholderTextColor={colors.text.secondary}
          />
          {accountError ? (
            <Body style={styles.errorText}>{accountError}</Body>
          ) : accountMessage && messageType === 'success' ? (
            <Body style={styles.successText}>{accountMessage}</Body>
          ) : accountMessage && messageType === 'error' ? (
            <Body style={styles.errorText}>{accountMessage}</Body>
          ) : null}
        </View>

        {accountName ? (
          <View style={styles.verifiedSection}>
            <Body style={styles.verifiedLabel}>
              {t('transferMethod.accountName') || 'Account Name'}
            </Body>
            <Body style={styles.verifiedName}>
              {accountName}
            </Body>
          </View>
        ) : null}

        <View style={styles.buttonSection}>
          {accountName && accountNumber ? (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                {t('transferMethod.continue') || 'Continue'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.verifyButton, isVerifying && styles.disabledButton]}
              onPress={handleAccountVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.verifyButtonText}>
                  {t('transferMethod.check') || 'Check'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Recipients Section */}
        <View style={styles.recentRecipientsSection}>
          <View style={styles.recentRecipientsHeader}>
            <Body style={styles.recentRecipientsTitle}>
              {t('transferMethod.recentRecipients') || 'Recent Recipients'}
            </Body>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => {
                onClose(); // Close the modal
                onManagePress?.(); // Navigate to saved recipients
              }}
            >
              <Body style={styles.manageButtonText}>
                {t('transferMethod.manage') || 'Manage'}
              </Body>
            </TouchableOpacity>
          </View>
          {isLoadingRecent ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Body style={styles.loadingText}>
                {t('transferMethod.loadingRecent') || 'Loading recent recipients...'}
              </Body>
            </View>
          ) : groupedRecentRecipients.length > 0 ? (
            <SectionList
              sections={groupedRecentRecipients}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index, section }) =>
                renderRecentRecipient(item, index, index === section.data.length - 1)
              }
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Body style={styles.sectionHeaderText}>{title}</Body>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sectionListContent}
              stickySectionHeadersEnabled={false}
            />
          ) : (
            <View style={styles.emptyRecentContainer}>
              <Body style={styles.emptyRecentText}>
                {t('transferMethod.noRecentRecipients') || 'No recent recipients'}
              </Body>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <BottomSheetModal
      visible={isVisible}
      onClose={() => onClose()}
      title={t('transferMethod.title')}
      maxHeightRatio={0.9}
      fillToMaxHeight
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {renderWalletInput()}
      </ScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
  },
  inputFormContainer: {
    minHeight: 400,
  },
  walletInput: {
    flex: 1,
    padding: spacing.lg,
  },
  walletHeader: {
    marginBottom: spacing.md,
  },
  walletTitle: {
    fontSize: 18,

    color: colors.text.primary,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  accountInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  verifiedSection: {
    backgroundColor: colors.success + '10',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  verifiedLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  verifiedName: {
    fontSize: 16,

    color: colors.success,
  },
  recentRecipientsSection: {
    marginTop: spacing.xxxl,
  },
  recentRecipientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recentRecipientsTitle: {
    fontSize: 18,

    color: colors.text.primary,
    lineHeight: 22,
  },
  manageButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  manageButtonText: {
    fontSize: 14,
    color: colors.primary,

  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  recentRecipientsScroll: {
    paddingVertical: spacing.sm,
  },
  recentRecipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    // paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
  },
  recentRecipientContainer: {
    flex: 1,
  },
  recentRecipientSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  recentRecipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 25,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    position: 'relative',
  },
  recentRecipientInitials: {
    fontSize: 18,

    color: colors.primary,
  },
  logoOverlay: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 3,
  },
  recentRecipientInfo: {
    flex: 1,
  },
  recentRecipientName: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: 2,
  },
  recentRecipientAccount: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyRecentContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyRecentText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  buttonSection: {
    gap: spacing.md,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,

    color: colors.background,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,

    color: colors.background,
  },
  sectionHeader: {
    backgroundColor: colors.light,
    // paddingVertical: spacing.xs,
    // paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  sectionHeaderText: {
    fontSize: 18,

    color: colors.primary,
  },
  sectionListContent: {
    paddingBottom: spacing.md,
  },
});
