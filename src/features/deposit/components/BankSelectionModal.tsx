import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Pressable, FlatList } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { Body, Button, BottomSheetModal, Input as TextInput } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useVietQRBanks } from '../hooks';
import type { VietQRBank } from '../types/bank';

interface BankSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBank: (bank: VietQRBank) => void;
  selectedBank?: VietQRBank;
}

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({
  visible,
  onClose,
  onSelectBank,
  selectedBank,
}) => {
  const { t } = useTranslation('deposit');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: banksResponse, isLoading, isError } = useVietQRBanks();

  // Filter banks based on search query
  const filteredBanks = useMemo(() => {
    if (!banksResponse?.data) return [];
    const banks = banksResponse.data.filter(b => b.transferSupported === 1);
    if (!searchQuery.trim()) return banks;
    const q = searchQuery.toLowerCase().trim();
    return banks.filter(b => (
      (b.short_name || '').toLowerCase().includes(q) ||
      (b.name || '').toLowerCase().includes(q) ||
      (b.code || '').toLowerCase().includes(q)
    ));
  }, [banksResponse?.data, searchQuery]);

  const renderBankItem = ({ item: bank }: { item: VietQRBank }) => {
    const isSelected = selectedBank?.id === bank.id;

    return (
      <Pressable
        onPress={() => onSelectBank(bank)}
        style={({ pressed }) => [
          styles.bankItem,
          isSelected && styles.selectedBankItem,
          pressed && styles.pressedBankItem,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Select ${bank.short_name}`}
      >
        <View style={styles.bankItemContent}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: bank.logo }}
              style={styles.bankLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.bankInfo}>
            <Body style={[styles.bankShortName, isSelected && styles.selectedText]}>
              {bank.short_name}
            </Body>
            <Body style={[styles.bankFullName, isSelected && styles.selectedText]}>
              {bank.name}
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
  if (isError) {
    return (
      <BottomSheetModal visible={visible} onClose={onClose} title={t('bankSelection.title')}>
        <View style={styles.centerContainer}>
          <Body style={styles.errorText}>{t('bankSelection.error')}</Body>
          <Button
            label={t('bankSelection.retry')}
            variant="outline"
            onPress={() => { /* react-query retry via refetch on reopen */ }}
          />
        </View>
      </BottomSheetModal>
    );
  }

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('bankSelection.title')}
      maxHeightRatio={0.7}
      fillToMaxHeight
    >
      <FlatList
        data={isLoading ? [] : filteredBanks}
        keyExtractor={(item: VietQRBank) => item.id.toString()}
        renderItem={renderBankItem}
        ListHeaderComponent={
          <View>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder={t('bankSelection.searchPlaceholder')}
                placeholderTextColor={colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {isLoading && (
              <View style={styles.loadingInline}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Body style={styles.loadingText}>{t('bankSelection.loading')}</Body>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={!isLoading ? (
          <View style={styles.centerContainer}>
            <Body style={styles.emptyText}>{t('bankSelection.noResults')}</Body>
          </View>
        ) : null}
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
    // paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
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
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  bankItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 52,
    height: 52,
    marginRight: spacing.md,
    borderRadius: 4,
    // backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankLogo: {
    width: 60,
    height: 60,
    // borderRadius: 4,
  },
  selectedBankItem: {
    // backgroundColor: colors.primary + '10',
    // borderWidth: 1,
    // borderColor: colors.primary,
  },
  pressedBankItem: {
    backgroundColor: colors.gray + '20',
    opacity: 0.8,
  },
  bankInfo: {
    flex: 1,
  },
  bankShortName: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bankFullName: {
    fontSize: 14,
    color: colors.text.secondary,
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
    height: 0.5,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
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
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  loadingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
});

export default BankSelectionModal;
