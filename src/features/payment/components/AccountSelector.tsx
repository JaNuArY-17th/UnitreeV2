import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/shared/components/base';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BankIcon, CreditCardIcon, CheckmarkCircle02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { AccountSelectorProps } from '../types';

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccount,
  onAccountSelect,
  onViewAll,
}) => {
  const { t } = useTranslation('payment');

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('vi-VN')} ${currency}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('accountSelector.title')}
        </Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllButton}>
              {t('accountSelector.viewAll')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Account List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {accounts.map((account) => {
          const isSelected = account.id === selectedAccount.id;

          return (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.accountCard,
                isSelected && styles.selectedAccountCard,
              ]}
              onPress={() => onAccountSelect(account)}
              activeOpacity={0.8}
            >
              {/* Account Icon */}
              <View style={[
                styles.accountIcon,
                isSelected && styles.selectedAccountIcon,
              ]}>
                <Text style={[
                  styles.accountIconText,
                  isSelected && styles.selectedAccountIconText,
                ]}>
                  {account.type === 'bank' ? (
                    <HugeiconsIcon icon={BankIcon} size={18} color={isSelected ? colors.light : colors.text.primary} />
                  ) : (
                    <HugeiconsIcon icon={CreditCardIcon} size={18} color={isSelected ? colors.light : colors.text.primary} />
                  )}
                </Text>
              </View>

              {/* Account Info */}
              <View style={styles.accountInfo}>
                <Text style={[
                  styles.accountName,
                  isSelected && styles.selectedAccountName,
                ]}>
                  {account.name}
                </Text>
                <Text style={[
                  styles.accountNumber,
                  isSelected && styles.selectedAccountNumber,
                ]}>
                  {account.accountNumber}
                </Text>
                <Text style={[
                  styles.accountBalance,
                  isSelected && styles.selectedAccountBalance,
                ]}>
                  {formatCurrency(account.balance, account.currency)}
                </Text>
              </View>

              {/* Selection Indicator */}
              {isSelected && (
                <View style={styles.selectionIndicator}>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color={colors.light} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Add Account Card */}
        <TouchableOpacity style={styles.addAccountCard}>
          <View style={styles.addAccountIcon}>
            <HugeiconsIcon icon={PlusSignIcon} size={20} color={colors.primary} />
          </View>
          <Text style={styles.addAccountText}>
            {t('accountSelector.addAccount')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,

    color: colors.text.primary,
  },
  viewAllButton: {
    fontSize: 14,
    color: colors.high,

  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  accountCard: {
    width: 140,
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  selectedAccountCard: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  accountIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectedAccountIcon: {
    backgroundColor: colors.primary,
  },
  accountIconText: {
    fontSize: 18,
  },
  selectedAccountIconText: {
    color: colors.light,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,

    color: colors.text.primary,
    marginBottom: 2,
  },
  selectedAccountName: {
    color: colors.primary,
  },
  accountNumber: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  selectedAccountNumber: {
    color: colors.primaryDark,
  },
  accountBalance: {
    fontSize: 13,

    color: colors.text.primary,
  },
  selectedAccountBalance: {
    color: colors.primary,
  },
  selectionIndicator: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    backgroundColor: colors.success,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.light,
    fontSize: 12,

  },
  addAccountCard: {
    width: 140,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addAccountIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAccountIconText: {
    fontSize: 20,
    color: colors.primary,

  },
  addAccountText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
});

export default AccountSelector;
