import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, spacing, typography } from '@/shared/themes';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface BalanceCardProps {
  balance: number;
  currency?: string;
  accountNumber?: string;
  isLoading?: boolean;
  onPress?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  currency = 'VND',
  accountNumber,
  isLoading = false,
  onPress,
}) => {
  const { t } = useTranslation('home');

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const maskedAccountNumber = accountNumber
    ? `**** **** **** ${accountNumber.slice(-4)}`
    : '**** **** **** ****';

  return (
    <Pressable style={styles.balanceCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Icon name="account-balance-wallet" size={24} color={colors.light} />
        </View>
        <Text style={styles.cardTitle}>{t('balance.title')}</Text>
      </View>

      <View style={styles.balanceSection}>
        {isLoading ? (
          <Text style={styles.loadingText}>{t('balance.loading')}</Text>
        ) : (
          <>
            <Text style={styles.balanceAmount}>
              {formatBalance(balance)} {currency}
            </Text>
            <Text style={styles.accountNumber}>{maskedAccountNumber}</Text>
          </>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>{t('balance.viewDetails')}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 19,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    padding: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.light,
  },
  balanceSection: {
    marginBottom: spacing.md,
  },
  balanceAmount: {
    ...typography.h1,
    fontSize: 28,
    color: colors.light,
    marginBottom: spacing.xs,
  },
  accountNumber: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
  },
  loadingText: {
    ...typography.h3,
    fontSize: 20,
    color: colors.light,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: spacing.sm,
  },
  viewDetailsText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
