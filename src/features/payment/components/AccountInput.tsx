import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, getFontFamily, FONT_WEIGHTS, spacing } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { Body } from '@/shared/components/base';
import type { Bank } from '../types/transfer';

interface AccountInputProps {
  selectedBank: Bank;
  accountNumber: string;
  accountName: string;
  accountError: string;
  isVerifying: boolean;
  onBackPress: () => void;
  onAccountNumberChange: (text: string) => void;
  onVerifyAccount: () => void;
  onContinue: () => void;
}

export const AccountInput: React.FC<AccountInputProps> = ({
  selectedBank,
  accountNumber,
  accountName,
  accountError,
  isVerifying,
  onBackPress,
  onAccountNumberChange,
  onVerifyAccount,
  onContinue,
}) => {
  const { t } = useTranslation('payment');

  return (
    <View style={styles.content}>
      {/* Selected Bank Display */}
      <View style={styles.selectedBankContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.bankItem}>
          <View style={styles.bankItemContent}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: selectedBank.logo }}
                style={styles.bankLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.bankInfo}>
              <Body style={styles.bankShortName}>
                {selectedBank.short_name || selectedBank.name}
              </Body>
              <Body style={styles.bankFullName}>
                {selectedBank.name}
              </Body>
            </View>
          </View>
          <View style={styles.selectedIndicator}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color={colors.light} />
          </View>
        </View>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{t('transferMethod.accountNumber')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.accountInput}
            placeholder={t('transferMethod.enterAccountNumber')}
            value={accountNumber}
            onChangeText={onAccountNumberChange}
            keyboardType="default"
            placeholderTextColor={colors.text.secondary}
          />
          {/* Temporarily hidden verify button */}
          {/* <TouchableOpacity
            style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
            onPress={onVerifyAccount}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={styles.verifyButtonText}>{t('transferMethod.check')}</Text>
            )}
          </TouchableOpacity> */}
        </View>

        {accountError ? (
          <Text style={styles.errorMessage}>{accountError}</Text>
        ) : null}

        {/* Temporarily hidden account verification result */}
        {/* {accountName ? (
          <View style={styles.accountResult}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} color={colors.success} />
            <Text style={styles.accountName}>{accountName}</Text>
          </View>
        ) : null} */}
      </View>

      {accountNumber && (
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>{t('transferMethod.continue')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  selectedBankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  bankItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  bankItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    marginRight: spacing.md,
    borderRadius: 4,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankLogo: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
  bankInfo: {
    flex: 1,
  },
  bankShortName: {
    fontSize: 16,

    color: colors.primary,
    marginBottom: spacing.xs,
  },
  bankFullName: {
    fontSize: 14,
    color: colors.primary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: colors.light,
    fontSize: 14,

  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: colors.text.secondary,
  },
  verifyButtonText: {
    fontSize: 14,

    color: colors.background,
  },
  errorMessage: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.danger,
  },
  accountResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.successSoft,
    borderRadius: 8,
  },
  accountName: {
    marginLeft: spacing.sm,
    fontSize: 16,

    color: colors.success,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  continueButtonText: {
    fontSize: 16,

    color: colors.background,
  },
});
