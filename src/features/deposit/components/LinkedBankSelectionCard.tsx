import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { Body, Text } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useVietQRBanks } from '../hooks';
import type { LinkedBank, VietQRBank } from '../types/bank';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon, BankIcon } from '@hugeicons/core-free-icons';

interface LinkedBankSelectionCardProps {
  selectedBank?: LinkedBank;
  onPress: () => void;
}

const LinkedBankSelectionCard: React.FC<LinkedBankSelectionCardProps> = ({
  selectedBank,
  onPress,
}) => {
  const { t } = useTranslation('deposit');

  // Get VietQR banks for fallback logo lookup
  const { data: vietQRBanksResponse } = useVietQRBanks();
  const vietQRBanks = vietQRBanksResponse?.data || [];

  // Local bank.json for primary logo + shortname mapping
  const localBankJson = require('@/shared/types/bank.json');
  const localBanks: any[] = localBankJson?.data || [];
  const localByCitad = React.useMemo(() => {
    const idx: Record<string, any> = {};
    localBanks.forEach(b => { if (b.citad) idx[b.citad] = b; });
    return idx;
  }, [localBanks]);
  const localByCode = React.useMemo(() => {
    const idx: Record<string, any> = {};
    localBanks.forEach(b => { if (b.code) idx[b.code.toUpperCase()] = b; });
    return idx;
  }, [localBanks]);
  const localByBin = React.useMemo(() => {
    const idx: Record<string, any> = {};
    localBanks.forEach(b => { if (b.bin) idx[b.bin] = b; });
    return idx;
  }, [localBanks]);

  const resolveLocalBank = (bank?: LinkedBank) => {
    if (!bank) return { logo: null as any, short: undefined as string | undefined };
    const normCode = bank.code?.toUpperCase();
    let match: any = null;
    if (bank.citad && localByCitad[bank.citad]) match = localByCitad[bank.citad];
    if (!match && normCode && localByCode[normCode]) match = localByCode[normCode];
    if (!match && bank.bin && localByBin[bank.bin]) match = localByBin[bank.bin];
    const vietQRMatch = vietQRBanks.find((b: VietQRBank) => (normCode && (b.code === normCode || b.bin === normCode)) || (bank.bin && (b.code === bank.bin || b.bin === bank.bin)));
    const logo = match?.logo || vietQRMatch?.logo || null;
    const short = match?.short_name || match?.shortName || vietQRMatch?.short_name || vietQRMatch?.shortName || bank.shortname;
    return { logo, short };
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    return `**** ${lastFour}`;
  };

  const getBankLogo = (bankCode: string): string | null => {
    const vietQRBank = vietQRBanks.find(
      (bank: VietQRBank) => bank.code === bankCode || bank.bin === bankCode
    );
    return vietQRBank?.logo || null;
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={selectedBank ?
        `${t('linkedBanks.selectedBank')}: ${selectedBank.shortname || selectedBank.name} - ${maskAccountNumber(selectedBank.number)}` :
        t('linkedBanks.selectBank')
      }
      style={[styles.container, selectedBank && styles.containerSelected]}
    >
      <View style={styles.content}>
        {selectedBank ? (
          <View style={styles.bankRow}>
            <View style={[styles.logoContainer, selectedBank && styles.logoContainerSelected]}>
              {(() => {
                const { logo } = resolveLocalBank(selectedBank);
                if (logo) {
                  return (
                    <Image
                      source={typeof logo === 'string' ? { uri: logo } : logo}
                      style={styles.bankLogo}
                      resizeMode="contain"
                      onError={() => { /* silent */ }}
                    />
                  );
                }
                const fallback = getBankLogo(selectedBank.code);
                if (fallback) {
                  return (
                    <Image
                      source={{ uri: fallback }}
                      style={styles.bankLogo}
                      resizeMode="contain"
                      onError={() => { /* silent */ }}
                    />
                  );
                }
                return <HugeiconsIcon icon={BankIcon} size={24} color={selectedBank ? colors.primary : colors.text.secondary} />;
              })()}
            </View>
            <View style={styles.bankDetails}>
              <Text style={[styles.bankName, selectedBank && styles.bankNameSelected]}>
                {resolveLocalBank(selectedBank).short || selectedBank.shortname || selectedBank.name}
              </Text>
              <Body style={[styles.accountDetails, selectedBank && styles.accountDetailsSelected]}>
                {maskAccountNumber(selectedBank.number)} • {selectedBank.holderName}
              </Body>
              {selectedBank.isDefault && (
                <View style={styles.defaultBadge}>
                  <Body style={styles.defaultText}>{t('linkedBanks.default') || 'Default'}</Body>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.placeholderRow}>
            <HugeiconsIcon icon={BankIcon} size={24} color={colors.primary} />
            <Body style={styles.placeholder}>
              {t('linkedBanks.selectBank')}
            </Body>
          </View>
        )}
      </View>

      <View style={[styles.arrow, selectedBank && styles.arrowSelected]}>
        <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={colors.primary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerSelected: {
    backgroundColor: colors.primaryLight,
  },
  content: {
    flex: 1,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainerSelected: {
    backgroundColor: colors.light,
  },
  bankLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  bankNameSelected: {
    color: colors.primary,
  },
  accountDetails: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  accountDetailsSelected: {
    color: colors.primary,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: spacing.xs,
  },
  defaultText: {
    fontSize: 10,
    color: colors.light,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeholder: {
    ...typography.body,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  arrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    marginLeft: spacing.sm,
  },
  arrowSelected: {
    backgroundColor: colors.light,
  },
});

export default LinkedBankSelectionCard;
