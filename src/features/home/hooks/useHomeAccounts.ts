import { useState } from 'react';
import { colors } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { EspayStatus } from '@/shared/types';
import { getEspayStatusText } from '../utils/homeUtils';
import { useHomeData } from './useHomeData';

export const useHomeAccounts = (data: ReturnType<typeof useHomeData>) => {
  const { t } = useTranslation('home');
  const {
    bankAccountData,
    bankBalance,
    bankNumber,
    hasAccount,
    postpaidData,
  } = data;

  const [selectedAccountType, setSelectedAccountType] = useState<string>('main_account');
  const [mainAccountBalanceVisible, setMainAccountBalanceVisible] = useState(true);
  const [totalBalanceVisible, setTotalBalanceVisible] = useState(true);
  const [withdrawableBalanceVisible, setWithdrawableBalanceVisible] = useState(true);

  // Calculate available credit for ESPay Later
  const availableCredit = postpaidData?.success && postpaidData?.data
    ? postpaidData.data.creditLimit - postpaidData.data.spentCredit
    : 0;

  const espayStatus: EspayStatus = (postpaidData?.success && postpaidData?.data
    ? postpaidData.data.status as EspayStatus
    : 'INACTIVE');

  // Use API data if available, otherwise fallback to cached data
  const apiBalance = bankAccountData?.data?.bankBalance;
  const apiAccountNumber = bankAccountData?.data?.bankNumber;
  const hasApiData = !!bankAccountData?.data;

  // Define account types data
  const accountTypes = [
    {
      id: 'main_account',
      type: 'main_account',
      balance: (hasApiData ? (apiBalance || 0) : (hasAccount ? bankBalance || 0 : 0)) + availableCredit, // Total balance
      accountNumber: hasApiData ? (apiAccountNumber || '--') : (hasAccount ? bankNumber : '--'), // Use real account number
      backgroundColor: colors.primary,
      useCachedData: false,
      usePropBalance: true,
      title: t('accountType.availableBalance'),
    },
    {
      id: 'espay_later',
      type: 'espay_later',
      balance: availableCredit, // Use calculated available credit
      accountNumber: getEspayStatusText(espayStatus, t), // Use status translation
      backgroundColor: colors.blue,
      useCachedData: true, // Now using cached postpaid data
    }
  ];

  const handleAccountTypeChange = (accountType: string) => {
    setSelectedAccountType(accountType);
  };

  const toggleMainAccountBalanceVisibility = () => {
    setMainAccountBalanceVisible(!mainAccountBalanceVisible);
  };

  const toggleTotalBalanceVisibility = () => {
    setTotalBalanceVisible(!totalBalanceVisible);
  };

  const toggleWithdrawableBalanceVisibility = () => {
    setWithdrawableBalanceVisible(!withdrawableBalanceVisible);
  };

  return {
    accountTypes,
    selectedAccountType,
    handleAccountTypeChange,
    mainAccountBalanceVisible,
    toggleMainAccountBalanceVisibility,
    totalBalanceVisible,
    toggleTotalBalanceVisibility,
    withdrawableBalanceVisible,
    toggleWithdrawableBalanceVisibility,
  };
};
