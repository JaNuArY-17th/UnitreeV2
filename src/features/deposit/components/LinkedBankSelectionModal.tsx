import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Pressable, FlatList } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CheckmarkCircle02Icon, BankIcon } from '@hugeicons/core-free-icons';
import { Body, Button, BottomSheetModal, Input as TextInput } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useLinkedBanks, useVietQRBanks } from '../hooks';
import type { LinkedBank, VietQRBank } from '../types/bank';

interface LinkedBankSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBank: (bank: LinkedBank) => void;
  selectedBank?: LinkedBank;
  onLinkNewBank?: () => void;
}

const LinkedBankSelectionModal: React.FC<LinkedBankSelectionModalProps> = ({
  visible,
  onClose,
  onSelectBank,
  selectedBank,
  onLinkNewBank,
}) => {
  const { t } = useTranslation('deposit');
  const [searchQuery, setSearchQuery] = useState('');

  // Get VietQR banks for fallback lookup
  const { data: vietQRBanksResponse } = useVietQRBanks();
  const vietQRBanks = vietQRBanksResponse?.data || [];

  // Local bank.json for primary mapping (logo + names)

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

  const resolveBankData = (bank: LinkedBank) => {
    const normCode = bank.code?.toUpperCase();
    let match: any = null;
    if (bank.citad && localByCitad[bank.citad]) match = localByCitad[bank.citad];
    if (!match && normCode && localByCode[normCode]) match = localByCode[normCode];
    if (!match && bank.bin && localByBin[bank.bin]) match = localByBin[bank.bin];
    const vietQRMatch = vietQRBanks.find(
      (b: VietQRBank) => (normCode && (b.code === normCode || b.bin === normCode)) || (bank.bin && (b.code === bank.bin || b.bin === bank.bin))
    );
    const logo = match?.logo || vietQRMatch?.logo || null;
    const shortName = match?.short_name || match?.shortName || vietQRMatch?.short_name || vietQRMatch?.shortName || bank.shortname;
    const fullName = match?.name || vietQRMatch?.name || bank.name;
    return { logo, shortName, fullName };
  };

  // Utility function to mask account number
  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    return `**** ${lastFour}`;
  };

  // NOTE: VietQR-specific getter now superseded by resolveBankData

  const { data: linkedBanksResponse, isLoading, error } = useLinkedBanks();
  const linkedBanks = linkedBanksResponse?.data || [];

  // Maximum linked banks limit
  const MAX_LINKED_BANKS = 5;
  const hasReachedLimit = linkedBanks.length >= MAX_LINKED_BANKS;

  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return linkedBanks;

    const query = searchQuery.toLowerCase();
    return linkedBanks.filter(bank => {
      const { shortName, fullName } = resolveBankData(bank);
      const maskedNumber = maskAccountNumber(bank.number);

      return (
        (fullName && fullName.toLowerCase().includes(query)) ||
        (shortName && shortName.toLowerCase().includes(query)) ||
        bank.name.toLowerCase().includes(query) ||
        bank.shortname.toLowerCase().includes(query) ||
        bank.number.toLowerCase().includes(query) ||
        maskedNumber.includes(query) ||
        bank.holderName.toLowerCase().includes(query) ||
        bank.code.toLowerCase().includes(query)
      );
    });
  }, [linkedBanks, searchQuery]);

  const handleBankSelect = (bank: LinkedBank) => {
    onSelectBank(bank);
    onClose(); // maintain previous behavior of closing after selection
  };

  const renderBankItem = ({ item }: { item: LinkedBank }) => {
    const isSelected = selectedBank?.id === item.id;
    const { logo, shortName, fullName } = resolveBankData(item);
    const bankLogo = logo;
    const displayName = shortName || fullName || item.shortname;
    const maskedAccountNumber = maskAccountNumber(item.number);
    const isDefault = !!item.isDefault;

    return (
      <Pressable
        style={[styles.bankItem, isSelected && styles.selectedBankItem]}
        onPress={() => handleBankSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`${displayName} - ${maskedAccountNumber}`}
      >
        <View style={styles.bankItemContent}>
          <View style={styles.logoContainer}>
            {bankLogo ? (
              <Image
                source={typeof bankLogo === 'string' ? { uri: bankLogo } : bankLogo}
                style={styles.bankLogo}
                resizeMode="contain"
              />
            ) : <HugeiconsIcon icon={BankIcon} size={24} color={colors.text.secondary} />}
          </View>
          <View style={styles.bankInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Body style={[styles.bankName, isSelected && styles.selectedText]}>
                {displayName}
              </Body>
              {/* {isDefault && (
                <Body style={styles.defaultIndicator}>
                  {'  ' + (t('linkedBanks.defaultShort') || t('linkedBanks.default') || 'Default')}
                </Body>
              )} */}
            </View>
            <Body style={[styles.accountDetails, isSelected && styles.selectedText]}>
              {maskedAccountNumber} • {item.holderName}
            </Body>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color={colors.light} />
          </View>
        )}
      </Pressable>
    );
  };

  if (error) {
    return (
      <BottomSheetModal visible={visible} onClose={onClose} title={t('linkedBanks.title')}>
        <View style={styles.centerContainer}>
          <Body style={styles.errorText}>{t('linkedBanks.loadError')}</Body>
          <Button
            label={t('linkedBanks.retry')}
            variant="outline"
            onPress={() => { /* rely on refetch on reopen */ }}
          />
        </View>
      </BottomSheetModal>
    );
  }

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('linkedBanks.title')}
      maxHeightRatio={0.6}
      fillToMaxHeight
    >
      <FlatList
        data={isLoading ? [] : filteredBanks}
        keyExtractor={(item: LinkedBank) => item.id}
        renderItem={renderBankItem}
        ListEmptyComponent={
          <View style={styles.emptyComponentContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Body style={styles.loadingText}>{t('linkedBanks.loading')}</Body>
              </View>
            ) : (
              <View style={styles.centerContainer}>
                <Body style={styles.emptyText}>
                  {searchQuery ? t('linkedBanks.noSearchResults') : t('linkedBanks.noLinkedBanks')}
                </Body>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.listFooter}>
            <View style={styles.limitInfo}>
              <Body style={styles.limitText}>
                {t('linkedBanks.bankLimit', { current: linkedBanks.length, max: MAX_LINKED_BANKS })}
              </Body>
            </View>
            <Button
              label={hasReachedLimit ? t('linkedBanks.limitReached') : t('linkedBanks.linkNewBank')}
              variant="outline"
              onPress={hasReachedLimit ? undefined : onLinkNewBank}
              disabled={hasReachedLimit}
              style={[styles.linkNewBankButton, hasReachedLimit && styles.disabledButton]}
            />
          </View>}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />

    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingVertical: spacing.md,
    // paddingHorizontal: spacing.md,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  bankList: {
    flex: 1,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
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
  logoText: {
    fontSize: 24,
  },
  bankLogo: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
  selectedBankItem: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  accountDetails: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  defaultIndicator: {
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  selectedText: {
    color: colors.primary,
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
    // height: 1,
    // backgroundColor: colors.border,
    // marginHorizontal: spacing.lg,
  },
  emptyComponentContainer: {
    flex: 1,
    minHeight: 300,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyState: {},
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  limitInfo: {
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  limitText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  linkNewBankButton: {
    marginBottom: spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  listFooter: {
    paddingTop: spacing.lg,
  },
});

export default LinkedBankSelectionModal;
