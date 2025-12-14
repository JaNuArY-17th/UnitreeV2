import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useTranslation } from '@/shared/hooks/useTranslation';
import {
  QrCodeIcon,
  Wallet01Icon,
  Invoice01Icon,
  CreditCardIcon,
  Exchange01Icon,
} from '@hugeicons/core-free-icons';
import { ActionItemData } from '../components';

export const useHomeActions = (userAccountType: string) => {
  const { t } = useTranslation('home');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const actionItems: ActionItemData[] = [
    {
      id: 'depositWithdraw',
      title: t('actions.depositWithdraw'),
      icon: Wallet01Icon,
      onPress: () => navigation.navigate('DepositWithdraw')
    },
    {
      id: 'manage-qr',
      title: t('actions.manageQr'),
      icon: QrCodeIcon,
      onPress: () => (navigation as any).navigate('QRPayment', { initialTab: 'payment' }),
    },
    {
      id: 'transfer',
      title: t('actions.transfer'),
      icon: Exchange01Icon,
      onPress: () => navigation.navigate('TransferMoney')
    },
    ...(userAccountType === 'STORE' ? [{
      id: 'commission-payment',
      title: t('actions.commissionPayment'),
      icon: CreditCardIcon,
      onPress: () => navigation.navigate('CommissionPayment')
    }] : [{
      id: 'postpaid-wallet',
      title: t('actions.postpaidWallet'),
      icon: Invoice01Icon,
      onPress: () => navigation.navigate('PostpaidWallet')
    }]),
  ];

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleBalancePress = () => {
    console.log('Balance card pressed');
  };

  const handleAccountSelect = () => {
    console.log('Account selector pressed');
  };

  const handleCheckNowPress = () => {
    navigation.navigate('AccountManagement');
  };

  const handleSecondaryAction = () => {
    navigation.navigate('CreateStoreStart');
  };

  const handleQuickAccess = {
    onVoiceInvoice: () => {
      console.log('[HomeScreen] Navigating to Cart with openVoiceModal: true');
      navigation.navigate('Cart', { openVoiceModal: true });
    },
    onManageInvoice: () => navigation.navigate('OrderManagement'),
    onManageProducts: () => navigation.navigate('ProductMenu'),
    onSearchProducts: () => console.log('Search Products'),
    onDraftOrders: () => navigation.navigate('DraftOrders'),
    onInventoryManagement: () => navigation.navigate('InventoryManagement' as any),
    onVoucherManagement: () => navigation.navigate('VoucherManagement' as any),
  }

  return {
    actionItems,
    handleNotificationPress,
    handleBalancePress,
    handleAccountSelect,
    handleCheckNowPress,
    handleSecondaryAction,
    handleQuickAccess,
    navigation, // Exporting navigation in case it's needed directly
  };
};
