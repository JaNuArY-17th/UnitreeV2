import React, { useState } from 'react';
import { View, StyleSheet, Alert, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { Body, Button, BottomSheetModal } from '@/shared/components/base';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useTranslation } from 'react-i18next';
import { useLinkedBanks, useDeleteLinkedBank, useVietQRBanks } from '@/features/deposit/hooks';
import type { LinkedBank, VietQRBank } from '@/features/deposit/types/bank';
import { useQueryClient } from '@tanstack/react-query';
import { BANK_QUERY_KEYS } from '@/features/deposit/hooks/useBankAccount';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BankIcon, ArrowDown01Icon, Delete02Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { PlaceholderBank } from '@/shared/assets';
import { colors, dimensions, spacing, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import SetDefaultBankModal from './SetDefaultBankModal';

interface LinkedBankSectionProps {
  style?: any;
  showHeader?: boolean;
  maxHeight?: number;
  onBankPress?: (bank: LinkedBank) => void;
  showActions?: boolean;
  scrollable?: boolean; // New prop to control FlatList vs direct rendering
  onSetDefaultBank?: (bank: LinkedBank) => void; // Callback for setting default bank
}

const LinkedBankSection: React.FC<LinkedBankSectionProps> = ({
  style,
  showHeader = true,
  maxHeight,
  onBankPress,
  showActions = true,
  scrollable = true, // Default to true for backward compatibility
  onSetDefaultBank,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation(['account', 'deposit']);
  const queryClient = useQueryClient();

  // State
  const [deletingBankId, setDeletingBankId] = useState<string | null>(null);
  const [showDefaultBankModal, setShowDefaultBankModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Hooks
  const { data: linkedBanksResponse, isLoading: linkedBanksLoading, isError: linkedBanksError, refetch: refetchLinked } = useLinkedBanks();
  const { data: vietQRBanksResponse, isLoading: vietQRLoading, isError: vietQRError, refetch: refetchVietQR } = useVietQRBanks();
  const deleteLinkedBankMutation = useDeleteLinkedBank();

  const linkedBanks = linkedBanksResponse?.data || [];
  const vietQRBanks = vietQRBanksResponse?.data || [];
  const defaultBank = linkedBanks.find(bank => bank.isDefault);

  // Local bank.json (bundled) for offline/logo mapping

  const localBankJson = require('@/shared/types/bank.json');
  const localBanks: any[] = localBankJson?.data || [];
  const localByCode: Record<string, any> = React.useMemo(() => {
    const idx: Record<string, any> = {};
    localBanks.forEach(b => { if (b.code) idx[b.code.toUpperCase()] = b; });
    return idx;
  }, [localBanks]);
  const localByBin: Record<string, any> = React.useMemo(() => {
    const idx: Record<string, any> = {};
    localBanks.forEach(b => { if (b.bin) idx[b.bin] = b; });
    return idx;
  }, [localBanks]);
  const localByCitad: Record<string, any> = React.useMemo(() => {
    const idx: Record<string, any> = {};
    localBanks.forEach(b => { if (b.citad) idx[b.citad] = b; });
    return idx;
  }, [localBanks]);

  // Constants
  const MAX_LINKED_BANKS = 5;
  const hasReachedLimit = linkedBanks.length >= MAX_LINKED_BANKS;

  // Utility functions
  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    return `**** ${lastFour}`;
  };

  const resolveBankData = (code?: string, bin?: string, citad?: string) => {
    const normCode = code?.toUpperCase();
    let localMatch = null as any;
    if (citad && localByCitad[citad]) localMatch = localByCitad[citad];
    if (!localMatch && normCode && localByCode[normCode]) localMatch = localByCode[normCode];
    if (!localMatch && bin && localByBin[bin]) localMatch = localByBin[bin];
    const vietQRMatch = vietQRBanks.find(
      (b: VietQRBank) => (normCode && (b.code === normCode || b.bin === normCode)) || (bin && (b.code === bin || b.bin === bin))
    );
    const logo = localMatch?.logo || vietQRMatch?.logo || null;
    return {
      logo,
      name: localMatch?.name || vietQRMatch?.name || undefined,
      shortName: localMatch?.short_name || localMatch?.shortName || vietQRMatch?.short_name || vietQRMatch?.shortName || undefined,
    };
  };

  // Handlers
  const handleAddBank = () => {
    if (hasReachedLimit) {
      Alert.alert(
        t('deposit:linkBank.errors.title'),
        t('deposit:linkBank.errors.limitReached', { max: MAX_LINKED_BANKS })
      );
      return;
    }
    navigation.navigate('LinkBank');
  };

  const handleSetDefaultBank = (bank: LinkedBank) => {
    setShowDefaultBankModal(false);
    onSetDefaultBank?.(bank);
  };

  const handleDeleteBank = (bank: LinkedBank) => {
    Alert.alert(
      t('account:linkedBanks.deleteBank.title'),
      t('account:linkedBanks.deleteBank.message', {
        bankName: bank.shortname,
        accountNumber: maskAccountNumber(bank.number)
      }),
      [
        {
          text: t('account:linkedBanks.deleteBank.cancel'),
          style: 'cancel',
        },
        {
          text: t('account:linkedBanks.deleteBank.confirm'),
          style: 'destructive',
          onPress: () => confirmDeleteBank(bank.id),
        },
      ]
    );
  };

  const confirmDeleteBank = async (bankId: string) => {
    setDeletingBankId(bankId);

    try {
      await deleteLinkedBankMutation.mutateAsync(bankId);

      // Invalidate linked banks query to refresh the list
      await queryClient.invalidateQueries({
        queryKey: BANK_QUERY_KEYS.linkedBanks(),
      });

      Alert.alert(
        t('account:linkedBanks.deleteBank.successTitle'),
        t('account:linkedBanks.deleteBank.successMessage')
      );
    } catch (error: any) {
      console.error('Delete bank error:', error);

      let errorMessage = t('account:linkedBanks.deleteBank.errorMessage');
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert(
        t('account:linkedBanks.deleteBank.errorTitle'),
        errorMessage
      );
    } finally {
      setDeletingBankId(null);
    }
  };

  const renderBankItem = ({ item }: { item: LinkedBank }) => {
    const { logo: mappedLogo, name: mappedName, shortName: mappedShort } = resolveBankData(item.code, item.bin, item.citad);
    const bankLogo = mappedLogo;
    const maskedAccountNumber = maskAccountNumber(item.number);
    const isDeleting = deletingBankId === item.id;
    const displayShort = mappedShort || mappedName || item.shortname || 'Bank';
    const displayFull = mappedName || item.name || displayShort;
    const isDefault = !!item.isDefault;

    return (
      <Pressable
        style={styles.bankItem}
        onPress={() => onBankPress?.(item)}
      >
        <View style={styles.bankItemContent}>
          <View style={styles.logoContainer}>
            {bankLogo ? (
              <Image
                source={typeof bankLogo === 'string' ? { uri: bankLogo } : bankLogo}
                style={styles.bankLogo}
                resizeMode="contain"
              />
            ) : PlaceholderBank ? (
              <Image source={PlaceholderBank} style={styles.bankLogo} resizeMode="contain" />
            ) : (
              <HugeiconsIcon icon={BankIcon} size={40} color={colors.text.secondary} />
            )}
          </View>
          <View style={styles.bankInfo}>
            {displayFull !== displayShort && (
              <Body style={styles.fullBankName}>{displayFull}</Body>
            )}
            <View style={styles.accountDetailsRow}>
              <Body style={styles.accountDetails}>
                {maskedAccountNumber} • {item.holderName}
              </Body>
              {isDefault && (
                <View style={styles.defaultTag}>
                  <Body style={styles.defaultTagText}>{t('account:linkedBanks.default')}</Body>
                </View>
              )}
            </View>
          </View>
        </View>
        {showActions && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              style={[styles.deleteButton, isDeleting && styles.deletingButton]}
              onPress={() => handleDeleteBank(item)}
              disabled={isDeleting}
            >
              {/* <Body style={[styles.deleteButtonText, isDeleting && styles.deletingText]}>
                {isDeleting ? t('account:linkedBanks.deleting') : t('account:linkedBanks.delete')}
              </Body> */}
              <HugeiconsIcon icon={Delete02Icon} size={24} color={colors.danger} />
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Body style={styles.emptyText}>{t('account:linkedBanks.noLinkedBanks')}</Body>
      <Button
        label={t('account:linkedBanks.addFirstBank')}
        variant="outline"
        onPress={handleAddBank}
        style={styles.addFirstBankButton}
      />
    </View>
  );

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={styles.sectionHeader}>
        <Body style={styles.sectionTitle}>{t('account:linkedBanks.title')}</Body>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Body style={styles.bankCount}>{linkedBanks.length}/{MAX_LINKED_BANKS}</Body>
          <Pressable style={styles.colapseButton} onPress={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <HugeiconsIcon icon={ArrowDown01Icon} size={20} color={colors.text.secondary} /> : <HugeiconsIcon icon={ArrowUp01Icon} size={20} color={colors.text.secondary} />}
          </Pressable>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (linkedBanks.length === 0) return null;

    return (
      <View style={styles.footer}>
        <Button
          label={hasReachedLimit ? t('account:linkedBanks.limitReached') : t('account:linkedBanks.addBank')}
          variant="outline"
          onPress={handleAddBank}
          disabled={hasReachedLimit}
          style={[styles.addBankButton, hasReachedLimit && styles.disabledButton]}
        />
        <Button
          label={t('account:linkedBanks.setDefault')}
          variant="primary"
          onPress={() => setShowDefaultBankModal(true)}
          style={styles.setDefaultBankButton}
          size='md'
        />
      </View>
    );
  };

  if (linkedBanksLoading || vietQRLoading) {
    return (
      <View style={[styles.container, style]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary || '#0a7f5a'} />
          <Body style={styles.loadingText}>{t('account:linkedBanks.loading') || 'Loading...'}</Body>
        </View>
      </View>
    );
  }

  if (linkedBanksError || vietQRError) {
    return (
      <View style={[styles.container, style]}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Body style={styles.errorText}>{t('account:linkedBanks.loadError') || 'Failed to load banks.'}</Body>
          <Button
            label={t('account:linkedBanks.retry') || 'Retry'}
            variant="primary"
            onPress={() => {
              refetchLinked();
              refetchVietQR();
            }}
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style, maxHeight && { maxHeight }]}>
      <SetDefaultBankModal
        visible={showDefaultBankModal}
        onClose={() => setShowDefaultBankModal(false)}
        linkedBanks={linkedBanks}
        vietQRBanks={vietQRBanks}
        onSelectBank={handleSetDefaultBank}
        resolveBankData={resolveBankData}
      />
      {scrollable ? (
        // FlatList version for standalone use
        <FlatList
          data={isCollapsed ? (defaultBank ? [defaultBank] : []) : linkedBanks}
          keyExtractor={(item) => item.id}
          renderItem={renderBankItem}
          ItemSeparatorComponent={isCollapsed ? null : () => <View style={styles.separator} />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={isCollapsed ? null : renderFooter}
          showsVerticalScrollIndicator={false}
          style={styles.bankList}
          contentContainerStyle={linkedBanks.length === 0 ? styles.emptyListContent : styles.listContent}
          nestedScrollEnabled={true}
        />
      ) : (
        // Direct rendering version for use inside ScrollView
        <View style={styles.directContainer}>
          {renderHeader()}
          {isCollapsed ? (
            defaultBank ? renderBankItem({ item: defaultBank }) : renderEmptyState()
          ) : (
            linkedBanks.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                {linkedBanks.map((item, index) => (
                  <View key={item.id}>
                    {renderBankItem({ item })}
                    {index < linkedBanks.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
                {renderFooter()}
              </>
            )
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    // marginBottom: spacing.md,
  },
  directContainer: {
    backgroundColor: colors.light,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.danger || '#d32f2f',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    alignSelf: 'center',
    minWidth: 120,
  },
  bankList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  emptyListContent: {
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    // paddingTop: spacing.lg,
    // paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  bankCount: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    // backgroundColor: colors.background,
  },
  bankItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
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
  accountDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accountDetails: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  defaultTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: 4
  },
  defaultTagText: {
    fontSize: 11,
    color: colors.light,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  deleteButton: {
  },
  deletingButton: {
    backgroundColor: colors.text.secondary,
  },
  deleteButtonText: {
    color: colors.light,
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  deletingText: {
    color: colors.light,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontSize: 14,
  },
  footer: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  addFirstBankButton: {
    marginTop: spacing.md,
    alignSelf: 'center',
    width: '100%',
  },
  addBankButton: {
    marginBottom: spacing.sm,
  },
  setDefaultBankButton: {
    marginBottom: spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  colapseButton: {
    backgroundColor: colors.lightGray,
    borderRadius: dimensions.radius.round,
  },
});

export default LinkedBankSection;
