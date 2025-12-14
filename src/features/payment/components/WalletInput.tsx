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
import { ChevronLeft, CheckCircleIcon } from '@/shared/assets/icons';
import { Body } from '@/shared/components/base';

export interface WalletProvider {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logo: string;
  description: string;
}

interface WalletInputProps {
  selectedWallet: WalletProvider;
  accountNumber: string;
  accountName: string;
  accountError: string;
  isVerifying: boolean;
  onBackPress: () => void;
  onAccountNumberChange: (text: string) => void;
  onVerifyAccount: () => void;
  onContinue: () => void;
}

export const WalletInput: React.FC<WalletInputProps> = ({
  selectedWallet,
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
      {/* Selected Wallet Display */}
      <View style={styles.selectedWalletContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <ChevronLeft width={20} height={20} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.walletItem}>
          <View style={styles.walletItemContent}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: selectedWallet.logo }}
                style={styles.walletLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.walletInfo}>
              <Body style={styles.walletShortName}>
                {selectedWallet.shortName}
              </Body>
              <Body style={styles.walletFullName}>
                {selectedWallet.description}
              </Body>
            </View>
          </View>
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        </View>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{t('transferMethod.walletNumber')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.accountInput}
            placeholder={t('transferMethod.enterWalletNumber')}
            value={accountNumber}
            onChangeText={onAccountNumberChange}
            keyboardType="default"
            placeholderTextColor={colors.text.secondary}
          />
          <TouchableOpacity
            style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
            onPress={onVerifyAccount}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={styles.verifyButtonText}>{t('transferMethod.check')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {accountError ? (
          <Text style={styles.errorMessage}>{accountError}</Text>
        ) : null}

        {accountName ? (
          <View style={styles.accountResult}>
            <CheckCircleIcon width={20} height={20} color={colors.success} />
            <Text style={styles.accountName}>{accountName}</Text>
          </View>
        ) : null}
      </View>

      {accountName && (
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
  selectedWalletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  walletItem: {
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
  walletItemContent: {
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
  walletLogo: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
  walletInfo: {
    flex: 1,
  },
  walletShortName: {
    fontSize: 16,

    color: colors.primary,
    marginBottom: spacing.xs,
  },
  walletFullName: {
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
