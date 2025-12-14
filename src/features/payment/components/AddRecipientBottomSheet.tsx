import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { Body, Button, Input, BottomSheetModal, KeyboardDismissWrapper } from '@/shared/components';
import { TransferService } from '../services/TransferService';
import { RecipientService } from '../services/RecipientService';
import type { TransferRecipient } from '../types/transfer';

type AddRecipientBottomSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  onRecipientAdded?: (recipient: TransferRecipient) => void;
};

export const AddRecipientBottomSheet: React.FC<AddRecipientBottomSheetProps> = ({
  isVisible,
  onClose,
  onRecipientAdded,
}) => {
  const { t } = useTranslation('payment');
  const { t: commonT } = useTranslation('common');
  const [accountNumberInput, setAccountNumberInput] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountError, setAccountError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [note, setNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      setAccountNumberInput('');
      setAccountNumber('');
      setAccountName('');
      setAccountError('');
      setNote('');
      setIsVerifying(false);
      setIsAdding(false);
    }
  }, [isVisible]);

  // Account number input handler
  const handleAccountNumberChange = useCallback((text: string) => {
    setAccountNumberInput(text);
  }, []);

  const handleAccountVerify = async () => {
    const accountToVerify = accountNumberInput.trim();

    if (!accountToVerify) {
      setAccountError(t('transferMethod.errors.accountRequired'));
      return;
    }

    setIsVerifying(true);
    setAccountError('');

    try {
      // Convert to uppercase for API call
      const uppercaseAccountNumber = accountToVerify.toUpperCase();
      const response = await TransferService.searchAccountByNumber(uppercaseAccountNumber);

      if (response.success && response.data) {
        setAccountName(response.data.accountName);
        setAccountNumber(uppercaseAccountNumber);
      } else {
        setAccountError(response.message || t('transferMethod.errors.accountNotFound'));
      }
    } catch (error) {
      console.error('Account verification error:', error);

      // Try to get message from API response if available
      const apiMessage = (error as any)?.message || (error as any)?.response?.data?.message;
      const errorMessage = apiMessage || t('transferMethod.errors.verificationFailed');

      setAccountError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddRecipient = async () => {
    if (!accountName || !accountNumber) {
      Alert.alert(
        t('savedRecipients.errorAdding') || 'Error',
        t('savedRecipients.verifyFirst') || 'Please verify the account first'
      );
      return;
    }

    setIsAdding(true);
    try {
      const response = await RecipientService.addRecentRecipient({
        bankNumber: accountNumber,
        notes: note.trim() || undefined,
      });

      if (response.success) {
        const newRecipient: TransferRecipient = {
          name: accountName,
          accountNumber: accountNumber,
          bankName: '', // Would need to be populated from bank data
          bankCode: '',
          bankType: 'USER', // Default to USER
        };

        onRecipientAdded?.(newRecipient);
        onClose();

        Alert.alert(
          t('savedRecipients.addSuccess') || 'Success',
          response.message || t('savedRecipients.addSuccessMessage') || 'Recipient added successfully'
        );
      } else {
        Alert.alert(
          t('savedRecipients.errorAdding') || 'Error',
          response.message || t('savedRecipients.errorAddingMessage') || 'Failed to add recipient'
        );
      }
    } catch (error) {
      console.error('Error adding recipient:', error);
      const errorMessage = (error as any)?.message || (error as any)?.response?.data?.message || t('savedRecipients.errorAddingMessage') || 'Failed to add recipient';
      Alert.alert(
        t('savedRecipients.errorAdding') || 'Error',
        errorMessage
      );
    } finally {
      setIsAdding(false);
    }
  };

  const renderContent = () => (
    <KeyboardDismissWrapper>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          {/* Account Number Input */}
          <View style={styles.inputSection}>
            <Body style={styles.label}>
              {t('transferMethod.accountNumber') || 'Account Number'}
            </Body>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Input
                  value={accountNumberInput}
                  onChangeText={handleAccountNumberChange}
                  placeholder={t('transferMethod.enterAccountNumber') || 'Enter account number'}
                  keyboardType="default"
                  autoCapitalize="characters"
                  autoFocus={true}
                />
              </View>
              <TouchableOpacity
                style={[styles.verifyButton, isVerifying && styles.disabledButton]}
                onPress={() => handleAccountVerify()}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Body style={styles.verifyButtonText}>
                    {t('transferMethod.check') || 'Check'}
                  </Body>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Name Display */}
          {accountName && !accountError ? (
            <View style={styles.verifiedSection}>
              <Body style={styles.verifiedLabel}>
                {t('transferMethod.accountName') || 'Account Name'}
              </Body>
              <Body style={styles.verifiedName}>{accountName}</Body>
            </View>
          ) : null}

          {/* Error Display */}
          {accountError ? (
            <View style={styles.errorSection}>
              <Body style={styles.errorDisplayMessage}>{accountError}</Body>
            </View>
          ) : null}

          {/* Note Input
          {accountName ? (
            <View style={styles.inputSection}>
              <Body style={styles.label}>
                {t('transfer.note') || 'Note'} ({commonT('common.optional') || 'Optional'})
              </Body>
              <Input
                value={note}
                onChangeText={setNote}
                placeholder={t('transfer.notePrefix.placeholder') || 'Enter transfer note'}
                maxLength={50}
              />
            </View>
          ) : null} */}

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <Button
              label={commonT('common.cancel') || 'Cancel'}
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              label={t('savedRecipients.addRecipient') || 'Add Recipient'}
              onPress={handleAddRecipient}
              disabled={!accountName || isAdding}
              loading={isAdding}
              style={styles.addButton}
            />
          </View>
        </View>
      </View>
    </KeyboardDismissWrapper>
  );

  return (
    <BottomSheetModal
      visible={isVisible}
      onClose={onClose}
      title={t('savedRecipients.addRecipient')}
      maxHeightRatio={0.7}
      fillToMaxHeight
    >
      {renderContent()}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 20,

    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  formContainer: {
    flex: 1,
  },
  inputSection: {
    // marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputContainer: {
    flex: 1,
  },
  inputError: {
    borderColor: colors.danger,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 14,

    color: colors.background,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  verifiedSection: {
    backgroundColor: colors.success + '10',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
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
  errorSection: {
    backgroundColor: colors.danger + '10',
    padding: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.md,
  },
  errorLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  errorDisplayMessage: {
    fontSize: 14,

    color: colors.danger,
  },
  messageSection: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  successMessage: {
    backgroundColor: colors.success + '10',
  },
  errorMessage: {
    backgroundColor: colors.danger + '10',
  },
  messageText: {
    fontSize: 14,
  },
  successText: {
    color: colors.success,
  },
  buttonSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
});

export default AddRecipientBottomSheet;
