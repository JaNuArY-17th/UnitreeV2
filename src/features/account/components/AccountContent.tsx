import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useStoreBankAccountData } from '@/features/deposit/hooks';
import { useAccountTabData } from '@/features/account/hooks';
import { colors, spacing, typography } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { QuickActionButtons } from './QuickActionButtons';
import {
  ViewIcon,
  ViewOffSlashIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

export const AccountContent: React.FC = () => {
  const { t } = useTranslation('account');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  const {
    bankBalance,
  } = useStoreBankAccountData();

  const {
    postpaidData,
  } = useAccountTabData('account');

  const handleActionPress = (actionId: string) => {
    switch (actionId) {
      case 'transfer':
        navigation.navigate('TransferMoney');
        break;
      default:
        break;
    }
  };

  const postpaidAvailable = postpaidData?.success && postpaidData?.data
    ? postpaidData.data.creditLimit - postpaidData.data.spentCredit
    : 0;

  const totalAsset = (bankBalance || 0) + postpaidAvailable;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <View style={styles.container}>
      {/* Total Balance Section */}
      <View style={styles.totalBalanceSection}>
        <Text style={styles.totalBalanceLabel}>{t('totalAssets')}</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.totalBalanceAmount}>
            {isBalanceVisible ? formatCurrency(totalAsset) : '********* ₫'}
          </Text>
          <TouchableOpacity onPress={toggleBalanceVisibility} style={styles.eyeIcon}>
            <HugeiconsIcon
              icon={isBalanceVisible ? ViewIcon : ViewOffSlashIcon}
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.fluctuationNote}>
          {t('fluctuationNote')}
        </Text>
      </View>

      {/* Assets List Card */}
      <View style={styles.assetsCard}>
        <View style={styles.assetsCardHeader}>
          <Text style={styles.assetsCardTitle}>{t('assetsList')}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Wallet Item */}
        <View style={styles.assetRow}>
          <View style={styles.assetInfo}>
            <Text style={styles.assetName}>{t('walletEspay')}</Text>
          </View>
          <Text style={styles.assetAmount}>
            {isBalanceVisible ? formatCurrency(bankBalance || 0) : '****** ₫'}
          </Text>
        </View>

        {/* Postpaid Item */}
        <View style={[styles.assetRow, { marginTop: spacing.md }]}>
          <View style={styles.assetInfo}>
            <Text style={styles.assetName}>{t('walletPostpaid')}</Text>
          </View>
          <Text style={styles.assetAmount}>
            {isBalanceVisible ? formatCurrency(postpaidAvailable) : '****** ₫'}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <QuickActionButtons onActionPress={handleActionPress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  totalBalanceSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  totalBalanceLabel: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  totalBalanceAmount: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 28,
  },
  eyeIcon: {
    marginLeft: spacing.sm,
  },
  fluctuationNote: {
    ...typography.caption,
    color: colors.success,
    backgroundColor: '#E6F9F0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  assetsCard: {
    backgroundColor: colors.light,
    borderRadius: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    // marginBottom: spacing.lg,
  },
  assetsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  assetsCardTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
    opacity: 0.3,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetName: {
    ...typography.body,
    color: colors.text.primary,
    // fontSize: 15,
  },
  assetAmount: {
    ...typography.subtitle,
    // fontWeight: '600',
    color: colors.primary,
  },
});
