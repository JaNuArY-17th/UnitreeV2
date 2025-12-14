import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform, Animated } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, dimensions, spacing, typography } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ViewIcon, ViewOffSlashIcon, ArrowRight01Icon, Copy01Icon } from '@hugeicons/core-free-icons';
import { BackgroundPatternSolid, ModernBackgroundPattern } from '../../../shared/components';
import LinearGradient from 'react-native-linear-gradient';
import { useStoreBankAccountData, useBankAccount, useBankTypeManager } from '@/features/deposit/hooks';
import { useVerificationStatus } from '@/features/authentication/hooks/useVerificationStatus';
import BalanceCardSkeleton from './BalanceCardSkeleton';

interface BalanceCardProps {
  balance?: number; // Made optional since we can use cached data
  currency?: string;
  accountType?: string;
  accountNumber?: string; // Made optional since we can use cached data
  isLoading?: boolean;
  onPress?: () => void;
  onAccountSelect?: () => void;
  onAccountTypeChange?: (accountType: string) => void;
  onCheckNowPress?: () => void;
  backgroundColor?: string;
  showCheckNow?: boolean;
  isBalanceVisible?: boolean;
  onBalanceVisibilityChange?: (visible: boolean) => void;
  useCachedData?: boolean; // New prop to enable cached data usage
  usePropBalance?: boolean; // New prop to force use prop balance
  title?: string; // New prop for custom title
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance: propBalance,
  currency = 'đ',
  accountType = 'main_account',
  accountNumber: propAccountNumber,
  isLoading: propIsLoading = false,
  onPress,
  onAccountSelect,
  onAccountTypeChange,
  onCheckNowPress,
  backgroundColor = colors.primary,
  showCheckNow = true,
  isBalanceVisible: externalIsBalanceVisible,
  onBalanceVisibilityChange,
  useCachedData = false,
  usePropBalance = false,
  title,
}) => {
  const { t } = useTranslation('home');
  const { verificationStatus } = useVerificationStatus();
  const [internalIsBalanceVisible, setInternalIsBalanceVisible] = useState(false);
  const chevronAnimValue = useRef(new Animated.Value(0)).current;

  // Get dynamic bank type from the app's context (USER or STORE)
  const { currentBankType } = useBankTypeManager();

  // Only fetch from API for main_account, NOT for espay_later
  const shouldFetchFromApi = accountType === 'main_account';

  // PRIMARY METHOD: Fetch fresh data from API using useBankAccount (only for main_account)
  const {
    data: apiBankData,
    isLoading: isApiFetching,
    error: apiError
  } = useBankAccount(shouldFetchFromApi ? currentBankType : undefined);

  // FALLBACK 1: Get cached bank data from persistent storage
  const {
    bankBalance: cachedBalance,
    bankNumber: cachedAccountNumber,
    bankCurrency: cachedCurrency,
    isLoading: cachedIsLoading,
    hasAccount: hasCachedAccount,
  } = useStoreBankAccountData();

  // Data priority logic for MAIN_ACCOUNT: API → Cached → Props
  // For ESPAY_LATER: Props only (no API fetch)

  // Extract API data (only available for main_account)
  const apiBalance = apiBankData?.data?.bankBalance;
  const apiAccountNumber = apiBankData?.data?.bankNumber;
  const apiCurrency = apiBankData?.data?.bankCurrency;
  const hasApiData = shouldFetchFromApi && !!apiBankData?.data;

  // Determine which data source to use
  const balance = usePropBalance && propBalance !== undefined
    ? propBalance
    : shouldFetchFromApi
      ? (hasApiData && apiBalance !== undefined
        ? apiBalance
        : (hasCachedAccount && cachedBalance !== undefined)
          ? cachedBalance
          : (propBalance || 0))
      : (propBalance || 0); // ESPay Later uses props only

  const accountNumber = usePropBalance && propAccountNumber !== undefined
    ? propAccountNumber
    : shouldFetchFromApi
      ? (hasApiData && apiAccountNumber
        ? apiAccountNumber
        : (hasCachedAccount && cachedAccountNumber)
          ? cachedAccountNumber
          : propAccountNumber)
      : propAccountNumber; // ESPay Later uses props only

  const effectiveCurrency = shouldFetchFromApi
    ? (hasApiData && apiCurrency
      ? apiCurrency
      : (hasCachedAccount && cachedCurrency)
        ? cachedCurrency
        : currency)
    : currency; // ESPay Later uses props only

  // Combine loading states - only for main_account
  const isLoading = shouldFetchFromApi
    ? (isApiFetching || (!hasApiData && cachedIsLoading) || (!hasApiData && !hasCachedAccount && propIsLoading))
    : propIsLoading; // ESPay Later uses prop loading state

  // Use external state if provided, otherwise use internal state
  const isBalanceVisible = externalIsBalanceVisible !== undefined ? externalIsBalanceVisible : internalIsBalanceVisible;
  const setIsBalanceVisible = onBalanceVisibilityChange || setInternalIsBalanceVisible;

  // Chevron left-right animation
  useEffect(() => {
    const chevronAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(chevronAnimValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(chevronAnimValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    chevronAnimation.start();

    return () => {
      chevronAnimation.stop();
    };
  }, [chevronAnimValue]);

  const accountTypeOptions = [
    { label: t('accountType.mainAccount'), value: 'main_account' },
    { label: t('accountType.esPayLater'), value: 'espay_later' },
  ];

  const getCurrentAccountLabel = () => {
    return accountTypeOptions.find(option => option.value === accountType)?.label || accountTypeOptions[0].label;
  };

  const formatBalance = (amount: number) => {
    if (effectiveCurrency === 'VND') {
      // Use Vietnamese formatting for VND
      return new Intl.NumberFormat('vi-VN').format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDisplayCurrency = () => {
    if (effectiveCurrency === 'VND') {
      return 'đ';
    }
    return currency;
  };

  const toggleBalanceVisibility = () => {
    const newVisibility = !isBalanceVisible;
    setIsBalanceVisible(newVisibility);
  };

  // Get gradient colors based on account type
  const getGradientColors = () => {
    if (accountType === 'espay_later') {
      return [colors.blue, colors.blueSoft];
    }
    return [colors.primary, colors.primarySoft];
  };

  // Determine check now text based on verification status
  let checkNowText = t('balance.checkNow');
  if (verificationStatus === 'NOT_VERIFIED') {
    checkNowText = t('verification.ekyc');
  } else if (verificationStatus === 'CARD_VERIFIED') {
    checkNowText = t('verification.bank');
  }

  // Show skeleton when loading
  if (isLoading) {
    return (
      <BalanceCardSkeleton
        backgroundColor={backgroundColor}
        showAccountNumber={accountType === 'main_account'}
      />
    );
  }

  return (
    <View style={[styles.totalAssetsCard, { backgroundColor }]}>
      {/* <BackgroundPatternSolid borderRadius={dimensions.radius.lg} backgroundColor={backgroundColor} patternColor={colors.light} /> */}
      <ModernBackgroundPattern primaryColor={colors.light} />

      <View style={styles.cardContentWrapper}>
        <View style={styles.totalAssetsHeader}>
          {/* Account type title */}
          <View style={styles.accountTypeTitle}>
            <Text style={styles.accountTypeTitleText}>
              {title || getCurrentAccountLabel()}
            </Text>
          </View>

          {/* Account Number Section */}
          <View style={styles.accountSelector}>
            {accountNumber && (
              <Text style={styles.accountNumber}>{accountNumber}</Text>
            )}
            {accountType === 'main_account' && accountNumber && (
              <Pressable
                style={styles.copyIcon}
                onPress={() => {
                  if (accountNumber) {
                    // Use Clipboard API if available
                    // Clipboard.setString(accountNumber);
                    // Optionally show a toast/alert
                  }
                }}
              >
              </Pressable>
            )}
          </View>
        </View>
        {/* <View style={styles.totalAssetsLabelContainer}>
        <Text style={styles.totalAssetsLabel}>{t('balance.title')}</Text>
      </View> */}
        <View style={styles.totalAssetsContent}>
          <View>
            <Text style={styles.totalAssetsAmount}>
              {isBalanceVisible
                ? `${formatBalance(balance)} ${getDisplayCurrency()}`
                : `•••••••• ${getDisplayCurrency()}`}
            </Text>
          </View>
          <Pressable onPress={toggleBalanceVisibility} accessibilityLabel="Toggle balance visibility">
            {isBalanceVisible
              ? <HugeiconsIcon icon={ViewOffSlashIcon} size={20} color={colors.light} />
              : <HugeiconsIcon icon={ViewIcon} size={20} color={colors.light} />}
          </Pressable>
        </View>
      </View>
      {showCheckNow && (
        <Pressable onPress={onCheckNowPress} style={styles.checkNowPressable}>
          <LinearGradient
            colors={getGradientColors()}
            style={styles.checkContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.checkText}>{checkNowText}</Text>
            <Animated.View
              style={[
                styles.checkText,
                {
                  transform: [
                    {
                      translateX: chevronAnimValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-4, 4], // Move 4px to the right
                      }),
                    },
                  ],
                },
              ]}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.light} />
            </Animated.View>
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  totalAssetsCard: {
    width: 300, // Fixed width for horizontal scrolling
    marginHorizontal: spacing.sm,
    marginBottom: 8,
    gap: 4,
    borderRadius: 12,
    flexDirection: 'column',
    // flex: 1,
    padding: 0,
    // Remove negative top positioning - let parent handle positioning
  },
  cardContentWrapper: {
    // flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingBottom: 0,
  },
  totalAssetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: spacing.xs,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  totalAssetsLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  totalAssetsLabel: {
    ...typography.title,
    color: '#FFFFFF',
  },
  infoIcon: {
    marginLeft: 6,
  },
  accountTypeTitle: {
    flex: 1,
  },
  accountTypeTitleText: {
    ...typography.subtitle,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  accountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.31)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  totalAssetsAmount: {
    ...typography.h1,
    paddingTop: 4,
    fontWeight: 'medium',
    // fontSize: 24,
    color: '#FFFFFF',
  },
  totalAssetsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: spacing.md,
  },
  copyIcon: {
    padding: 0,
  },
  accountNumber: {
    ...typography.body,
    color: '#FFFFFF',
  },
  checkNowPressable: {
    // marginTop: 'auto',
    // Ensures it sticks to the bottom
  },
  checkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomLeftRadius: dimensions.radius.lg,
    borderBottomRightRadius: dimensions.radius.lg,
    // Remove marginBottom or paddingBottom to stick to bottom
    marginBottom: 0,
    paddingBottom: 0,
    minHeight: 28,
    alignItems: 'center',
  },
  checkText: {
    ...typography.bodySmall,
    color: colors.light,
    paddingVertical: 4,
    paddingHorizontal: spacing.lg,
  },
});
