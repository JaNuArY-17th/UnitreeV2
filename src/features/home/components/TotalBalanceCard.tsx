import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, dimensions, spacing, typography } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ViewOffSlashIcon, ViewIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { ModernBackgroundPattern } from '../../../shared/components';
import LinearGradient from 'react-native-linear-gradient';
import { useVerificationStatus } from '@/features/authentication/hooks/useVerificationStatus';
import BalanceCardSkeleton from './BalanceCardSkeleton';

interface TotalBalanceCardProps {
  balance?: number;
  currency?: string;
  accountNumber?: string;
  withdrawableBalance?: number;
  isLoading?: boolean;
  onPress?: () => void;
  onCheckNowPress?: () => void;
  backgroundColor?: string;
  showCheckNow?: boolean;
  isBalanceVisible?: boolean;
  onBalanceVisibilityChange?: (visible: boolean) => void;
  isWithdrawableVisible?: boolean;
  onWithdrawableVisibilityChange?: (visible: boolean) => void;
  title?: string;
}

export const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  balance = 0,
  currency = 'đ',
  accountNumber = '--',
  withdrawableBalance,
  isLoading = false,
  onPress,
  onCheckNowPress,
  backgroundColor = colors.success,
  showCheckNow = true,
  isBalanceVisible: externalIsBalanceVisible,
  onBalanceVisibilityChange,
  isWithdrawableVisible: externalIsWithdrawableVisible,
  onWithdrawableVisibilityChange,
  title,
}) => {
  const { t } = useTranslation('home');
  const { verificationStatus } = useVerificationStatus();
  const [internalIsBalanceVisible, setInternalIsBalanceVisible] = useState(false);
  const [internalIsWithdrawableVisible, setInternalIsWithdrawableVisible] = useState(false);
  const chevronAnimValue = useRef(new Animated.Value(0)).current;

  // Use external state if provided, otherwise use internal state
  const isBalanceVisible = externalIsBalanceVisible !== undefined ? externalIsBalanceVisible : internalIsBalanceVisible;
  const setIsBalanceVisible = onBalanceVisibilityChange || setInternalIsBalanceVisible;

  const isWithdrawableVisible = externalIsWithdrawableVisible !== undefined ? externalIsWithdrawableVisible : internalIsWithdrawableVisible;
  const setIsWithdrawableVisible = onWithdrawableVisibilityChange || setInternalIsWithdrawableVisible;

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

  const formatBalance = (amount: number) => {
    if (currency === 'VND') {
      // Use Vietnamese formatting for VND
      return new Intl.NumberFormat('vi-VN').format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDisplayCurrency = () => {
    if (currency === 'VND') {
      return 'đ';
    }
    return currency;
  };

  const toggleBalanceVisibility = () => {
    const newVisibility = !isBalanceVisible;
    setIsBalanceVisible(newVisibility);
  };

  const toggleWithdrawableVisibility = () => {
    const newVisibility = !isWithdrawableVisible;
    setIsWithdrawableVisible(newVisibility);
  };

  // Get gradient colors for total balance
  const getGradientColors = () => {
    return [colors.success, colors.successSoft];
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
        showWithdrawable={withdrawableBalance !== undefined}
      />
    );
  }

  return (
    <View style={[styles.totalAssetsCard, { backgroundColor }]}>
      <ModernBackgroundPattern primaryColor={colors.light} />

      <View style={styles.cardContentWrapper}>
        <View style={styles.totalAssetsHeader}>
          {/* Account type title */}
          <View style={styles.accountTypeTitle}>
            <Text style={styles.accountTypeTitleText}>
              {title || t('accountType.totalBalance')}
            </Text>
          </View>
        </View>

        <View style={[styles.totalAssetsContent, { paddingHorizontal: 16, }]}>
          <Text style={styles.totalAssetsAmount}>
            {isBalanceVisible
              ? `${formatBalance(balance)} ${getDisplayCurrency()}`
              : `•••••••• ${getDisplayCurrency()}`}
          </Text>
          <Pressable onPress={toggleBalanceVisibility} accessibilityLabel="Toggle balance visibility">
            {isBalanceVisible
              ? <HugeiconsIcon icon={ViewOffSlashIcon} size={20} color={colors.light} />
              : <HugeiconsIcon icon={ViewIcon} size={20} color={colors.light} />}
          </Pressable>
        </View>

        {withdrawableBalance !== undefined && (
          <View style={[styles.withdrawableSection]}>
            <View style={styles.withdrawableHeader}>
              <Text style={styles.accountTypeTitleText}>{t('balance.withdrawableAmount')}</Text>
            </View>

            <View style={styles.totalAssetsContent}>
              <Text style={styles.totalAssetsAmount}>
                {isWithdrawableVisible
                  ? `${formatBalance(withdrawableBalance)} ${getDisplayCurrency()}`
                  : `•••••••• ${getDisplayCurrency()}`}
              </Text>

              <Pressable onPress={toggleWithdrawableVisibility} accessibilityLabel="Toggle withdrawable balance visibility">
                {isWithdrawableVisible
                  ? <HugeiconsIcon icon={ViewOffSlashIcon} size={20} color={colors.light} />
                  : <HugeiconsIcon icon={ViewIcon} size={20} color={colors.light} />}
              </Pressable>
            </View>
          </View>

        )}
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
    width: 300,
    marginHorizontal: spacing.sm,
    marginBottom: 12,
    gap: 8,
    borderRadius: 12,
    flexDirection: 'column',
    // flex: 1,
    padding: 0,
  },
  cardContentWrapper: {
    // flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  totalAssetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  accountTypeTitle: {
    flex: 1,
  },
  accountTypeTitleText: {
    ...typography.subtitle,
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 12
  },
  accountNumber: {
    ...typography.body,
    color: '#FFFFFF',
  },
  totalAssetsAmount: {
    ...typography.h2,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalAssetsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  checkNowPressable: {
    // marginTop: 'auto',
  },
  checkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomLeftRadius: dimensions.radius.lg,
    borderBottomRightRadius: dimensions.radius.lg,
    marginBottom: 0,
    paddingBottom: 0,
    minHeight: 30,
    alignItems: 'center',
  },
  checkText: {
    ...typography.body,
    color: colors.light,
    paddingVertical: spacing.sm - 1,
    paddingHorizontal: spacing.lg,
  },
  withdrawableSection: {
    paddingHorizontal: 16,
    marginBottom: spacing.sm,
  },
  withdrawableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
});
