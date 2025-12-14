import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { ActionGrid, ActionItem, ActionItemData } from '@/features/home/components/ActionGrid';
import {
  Wallet01Icon,
  QrCodeIcon,
  Exchange01Icon,
  CreditCardIcon,
  File02Icon
} from '@hugeicons/core-free-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAccountType, useStoreData } from '../../authentication';

interface QuickActionButtonsProps {
  onActionPress?: (actionId: string) => void;
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ onActionPress }) => {
  const { t } = useTranslation('home');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userData } = useAccountType();
  const { storeData, hasStore, isLoading: isStoreDataLoading } = useStoreData();
  const userAccountType = userData?.account_type || (userData?.is_shop ? 'STORE' : 'USER');

  const actionItems: ActionItemData[] = [
    {
      id: 'depositWithdraw',
      title: t('actions.depositWithdraw'),
      icon: Wallet01Icon,
      backgroundColor: '#FFE7FF',
      onPress: () => navigation.navigate('DepositWithdraw')
    },
    {
      id: 'manage-qr',
      title: t('actions.manageQr'),
      icon: QrCodeIcon,
      backgroundColor: '#D7EDFF',
      onPress: () => navigation.navigate('QRPayment'),
    },
    {
      id: 'transfer',
      title: t('actions.transfer'),
      icon: Exchange01Icon,
      backgroundColor: '#E2FFF7',
      onPress: () => navigation.navigate('TransferMoney')
    },
    // Conditionally show commission payment or received payments based on account type
    ...(userAccountType === 'STORE' ? [{
      id: 'commission-payment',
      title: t('actions.commissionPayment'),
      icon: CreditCardIcon,
      backgroundColor: '#FFE7FF',
      onPress: () => navigation.navigate('CommissionPayment')
    }] : [{
      id: 'received-payments',
      title: t('actions.receivedPayments'),
      icon: File02Icon,
      backgroundColor: '#E8FFD7',
      onPress: () => navigation.navigate('QRReceiveMoney')
    }]),
  ];

  return (
    <View style={styles.container}>
      <ActionGrid actions={actionItems} variant="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  }
});
