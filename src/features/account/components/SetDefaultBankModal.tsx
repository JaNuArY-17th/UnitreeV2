import React, { useState } from 'react';
import { View, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { Body, BottomSheetModal } from '@/shared/components/base';
import { useTranslation } from 'react-i18next';
import type { LinkedBank, VietQRBank } from '@/features/deposit/types/bank';
import BankIcon from '@/shared/assets/icons/BankIcon';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { useSetLinkedBankAsDefault } from '@/features/deposit/hooks/useBankAccount';
import { useCustomAlert } from '@/shared/hooks/useCustomAlert';

interface SetDefaultBankModalProps {
  visible: boolean;
  onClose: () => void;
  linkedBanks: LinkedBank[];
  vietQRBanks: VietQRBank[];
  onSelectBank: (bank: LinkedBank) => void;
  resolveBankData: (code?: string, bin?: string, citad?: string) => {
    logo: any;
    name?: string;
    shortName?: string;
  };
}

const SetDefaultBankModal: React.FC<SetDefaultBankModalProps> = ({
  visible,
  onClose,
  linkedBanks,
  onSelectBank,
  resolveBankData,
}) => {
  const { t } = useTranslation('account');
  const { showAlert } = useCustomAlert();
  const setDefaultMutation = useSetLinkedBankAsDefault();
  const [settingBankId, setSettingBankId] = useState<string | null>(null);

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    return `**** ${lastFour}`;
  };

  const handleSelectBank = async (bank: LinkedBank) => {
    try {
      setSettingBankId(bank.id);
      await setDefaultMutation.mutateAsync(bank.id);

      // Show success message
      showAlert({
        title: t('linkedBanks.setDefaultSuccess'),
        message: `${bank.name || bank.shortname} ${t('linkedBanks.setAsDefaultSuccess')}`,
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              onSelectBank(bank);
              onClose();
            },
          },
        ],
      });
    } catch (error: any) {
      console.error('Error setting default bank:', error);
      showAlert({
        title: t('linkedBanks.setDefaultError'),
        message: error?.message || t('linkedBanks.setDefaultErrorMessage'),
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setSettingBankId(null);
    }
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('linkedBanks.setDefault')}
      maxHeightRatio={0.6}
      fillToMaxHeight
    >
      <View style={styles.modalContent}>
        {linkedBanks.map((bank, index) => {
          const { logo: mappedLogo, name: mappedName, shortName: mappedShort } = resolveBankData(bank.code, bank.bin, bank.citad);
          const displayShort = mappedShort || mappedName || bank.shortname || 'Bank';
          const displayFull = mappedName || bank.name || displayShort;
          const isDefault = !!bank.isDefault;
          const isLoading = settingBankId === bank.id;

          return (
            <View key={bank.id}>
              <Pressable
                style={[styles.defaultBankOption, isDefault && styles.defaultBankOptionSelected]}
                onPress={() => handleSelectBank(bank)}
                disabled={setDefaultMutation.isPending || isLoading}
              >
                <View style={styles.defaultBankOptionContent}>
                  <View style={styles.logoContainer}>
                    {mappedLogo ? (
                      <Image
                        source={typeof mappedLogo === 'string' ? { uri: mappedLogo } : mappedLogo}
                        style={styles.bankLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <BankIcon width={40} height={40} color={colors.text.secondary} />
                    )}
                  </View>
                  <View style={styles.bankInfo}>
                    {displayFull !== displayShort && (
                      <Body style={styles.fullBankName}>{displayFull}</Body>
                    )}
                    <Body style={styles.accountDetails}>
                      {maskAccountNumber(bank.number)} • {bank.holderName}
                    </Body>
                  </View>
                </View>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : isDefault ? (
                  <View style={styles.checkmark}>
                    <Body style={styles.checkmarkText}>✓</Body>
                  </View>
                ) : null}
              </Pressable>
              {index < linkedBanks.length - 1 && <View style={styles.separator} />}
            </View>
          );
        })}
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    paddingVertical: spacing.md,
  },
  defaultBankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  defaultBankOptionSelected: {
  },
  defaultBankOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    marginRight: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankLogo: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  bankInfo: {
    flex: 1,
  },
  fullBankName: {
    fontSize: 13,

    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  accountDetails: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.light,
    fontSize: 14,

  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
});

export default SetDefaultBankModal;
