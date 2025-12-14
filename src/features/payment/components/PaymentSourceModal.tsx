import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { colors, dimensions, FONT_WEIGHTS, getFontFamily, spacing } from '@/shared/themes';
import { Body, Button, BottomSheetFlatList, Input as TextInput } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useStoreBankAccountData, useBankTypeManager, useBankAccount } from '@/features/deposit/hooks';
import { usePostpaidData } from '@/features/account/hooks';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Wallet01Icon, CreditCardIcon } from '@hugeicons/core-free-icons';
import { formatVND } from '@/shared/utils/format';
import type { PaymentSource } from './PaymentSourceCard';
import type { EspayStatus } from '@/shared/types';

interface PaymentSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSource: (source: PaymentSource) => void;
  selectedSource?: PaymentSource;
}

const PaymentSourceModal: React.FC<PaymentSourceModalProps> = ({
  visible,
  onClose,
  onSelectSource,
  selectedSource,
}) => {
  const { t } = useTranslation('payment');
  const { t: homeT } = useTranslation('home');

  const [searchQuery, setSearchQuery] = useState('');

  // Get dynamic bank type from the app's context (USER or STORE)
  const { currentBankType } = useBankTypeManager();

  // PRIMARY METHOD: Fetch fresh data from API using useBankAccount
  const {
    data: apiBankData,
    isLoading: isApiFetching,
    error: apiError
  } = useBankAccount(currentBankType);

  console.log('PaymentSourceModal - API Bank Data:', apiBankData);

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
  const isBankError = !!apiError && !hasCachedAccount;

  // Get ESPay Later data
  const {
    data: postpaidData,
    isLoading: isPostpaidLoading,
    isError: isPostpaidError
  } = usePostpaidData();

  const espayStatus: EspayStatus = (postpaidData?.success && postpaidData?.data
    ? postpaidData.data.status as EspayStatus
    : 'INACTIVE');

  console.log('PaymentSourceModal - ESPay Later:', { postpaidData, isPostpaidError, hasAccount });

  // Get ESPay status translation
  const getEspayStatusText = (status: EspayStatus): string => {
    switch (status) {
      case 'ACTIVE':
        return homeT('espay.active');
      case 'PENDING':
        return homeT('espay.pending');
      case 'INACTIVE':
        return homeT('espay.inactive');
      case 'LOCKED':
        return homeT('espay.locked');
      default:
        return homeT('espay.inactive');
    }
  };

  // Build payment sources array
  const paymentSources = useMemo((): (PaymentSource & { disabled?: boolean })[] => {
    const sources: (PaymentSource & { disabled?: boolean })[] = [];

    // Add main account if available
    if (hasAccount) {
      sources.push({
        id: 'main_account',
        type: 'main_account',
        balance: bankBalance || 0,
        accountNumber: bankNumber || '--',
        isDefault: true, // Main account is usually default
        disabled: false,
      });
    }

    // Add ESPay Later if available and active
    if (postpaidData?.success && postpaidData?.data) {
      const availableCredit = postpaidData.data.creditLimit - postpaidData.data.spentCredit;
      sources.push({
        id: 'espay_later',
        type: 'espay_later',
        balance: availableCredit,
        status: getEspayStatusText(espayStatus),
        isDefault: false,
        disabled: availableCredit <= 0, // Disable if balance is 0 or negative
      });
    }

    return sources;
  }, [hasAccount, bankBalance, bankNumber, postpaidData]);

  const isLoading = isBankLoading || isPostpaidLoading;
  // Only show error if BOTH sources fail AND we have no cached account
  const hasError = isBankError && !hasAccount;

  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return paymentSources;

    const query = searchQuery.toLowerCase();
    return paymentSources.filter(source => {
      const label = source.type === 'espay_later' ? 'ESPay Later' : 'Main Account';
      const detail = source.type === 'espay_later' ? source.status : source.accountNumber;

      return (
        label.toLowerCase().includes(query) ||
        (detail && detail.toLowerCase().includes(query)) ||
        formatVND(source.balance).toLowerCase().includes(query)
      );
    });
  }, [paymentSources, searchQuery]);

  const handleSourceSelect = (source: PaymentSource) => {
    onSelectSource(source);
    onClose();
  };

  const getSourceIcon = (type: 'main_account' | 'espay_later') => {
    if (type === 'espay_later') {
      return <HugeiconsIcon icon={CreditCardIcon} size={32} color={colors.primary} />;
    }
    return <HugeiconsIcon icon={Wallet01Icon} size={32} color={colors.primary} />;
  };

  const getSourceLabel = (type: 'main_account' | 'espay_later') => {
    if (type === 'espay_later') {
      return t('paymentSource.espayLater') || 'ESPay Later';
    }
    return t('paymentSource.mainAccount') || 'Main Account';
  };

  const getSourceDetail = (source: PaymentSource) => {
    if (source.type === 'espay_later') {
      return `${source.status} • ${t('paymentSource.available') || 'available'}`;
    }
    return source.accountNumber || '--';
  };

  const renderSourceItem = ({ item }: { item: PaymentSource & { disabled?: boolean } }) => {
    const isSelected = selectedSource?.id === item.id;
    const isDisabled = item.disabled;
    const label = getSourceLabel(item.type);
    const detail = getSourceDetail(item);

    return (
      <Pressable
        style={[
          styles.sourceItem,
          isSelected && styles.selectedSourceItem,
          isDisabled && styles.disabledSourceItem
        ]}
        onPress={isDisabled ? undefined : () => handleSourceSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`${label} - ${detail}${isDisabled ? ' - Disabled' : ''}`}
        disabled={isDisabled}
      >
        <View style={styles.sourceItemContent}>
          <View style={[styles.iconContainer, isDisabled && styles.disabledIconContainer]}>
            {getSourceIcon(item.type)}
          </View>
          <View style={styles.sourceInfo}>
            <View style={styles.sourceHeader}>
              <Body style={[
                styles.sourceName,
                isSelected && styles.selectedText,
                isDisabled && styles.disabledText
              ]}>
                {label}
              </Body>
              {item.isDefault && !isDisabled && (
                <View style={styles.defaultBadge}>
                  <Body style={styles.defaultText}>
                    {t('paymentSource.default') || 'Default'}
                  </Body>
                </View>
              )}
            </View>
            <Body style={[
              styles.sourceDetails,
              isSelected && styles.selectedText,
              isDisabled && styles.disabledText
            ]}>
              {isDisabled && item.type === 'espay_later'
                ? t('paymentSource.espayLaterUnavailable') || 'ESPay Later unavailable (balance: 0đ)'
                : `${item.type === 'espay_later' ? item.status : item.accountNumber} • ${formatVND(item.balance)}`
              }
            </Body>
          </View>
        </View>
      </Pressable>
    );
  };

  if (hasError) {
    return (
      <BottomSheetFlatList
        visible={visible}
        onClose={onClose}
        title={t('paymentSource.title') || 'Select Payment Source'}
        data={[]}
        keyExtractor={(i) => (i as any)?.id || '0'}
        renderItem={() => null}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Body style={styles.errorText}>
              {t('paymentSource.loadError') || 'Failed to load payment sources'}
            </Body>
            <Button
              label={t('paymentSource.retry') || 'Retry'}
              variant="outline"
              onPress={() => {/* Retry logic can be added here */ }}
            />
          </View>
        }
      />
    );
  }

  return (
    <BottomSheetFlatList
      visible={visible}
      onClose={onClose}
      title={t('paymentSource.title') || 'Select Payment Source'}
      maxHeightRatio={0.4}
      fillToMaxHeight
      data={isLoading ? [] : filteredSources}
      keyExtractor={(item) => item.id}
      renderItem={renderSourceItem}
      ListHeaderComponent={
        <View>
          {/* <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('paymentSource.searchPlaceholder') || 'Search payment sources...'}
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View> */}
          {isLoading && (
            <View style={styles.loadingInline}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Body style={styles.loadingText}>
                {t('paymentSource.loading') || 'Loading payment sources...'}
              </Body>
            </View>
          )}
        </View>
      }
      ListEmptyComponent={!isLoading ? (
        <View style={styles.centerContainer}>
          <Body style={styles.emptyText}>
            {searchQuery
              ? (t('paymentSource.noSearchResults') || 'No payment sources found')
              : (t('paymentSource.noSources') || 'No payment sources available')
            }
          </Body>
        </View>
      ) : null}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingVertical: spacing.md,
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
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  sourceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    marginRight: spacing.md,
    borderRadius: dimensions.radius.xxl,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSourceItem: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sourceName: {
    fontSize: 16,

    color: colors.text.primary,
    flex: 1,
  },
  sourceDetails: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    color: colors.light,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  selectedText: {
    // color: colors.primary,
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
    margin: spacing.xs,
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
  disabledSourceItem: {
    opacity: 0.6,
    backgroundColor: colors.lightGray,
  },
  disabledIconContainer: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.text.secondary,
    opacity: 0.5,
  },
});

export default PaymentSourceModal;
