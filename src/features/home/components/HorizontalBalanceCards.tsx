import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { colors, spacing, dimensions } from '@/shared/themes';
import { BalanceCard, TotalBalanceCard } from '../components';

interface AccountType {
  id: string;
  type: 'total_balance' | 'main_account' | 'espay_later';
  balance: number;
  accountNumber: string;
  backgroundColor: string;
  useCachedData?: boolean;
  withdrawableBalance?: number;
  title?: string;
  usePropBalance?: boolean;
}

interface HorizontalBalanceCardsProps {
  accountTypes: AccountType[];
  selectedAccountType: string;
  onAccountTypeChange: (accountType: string) => void;
  onBalancePress: () => void;
  onAccountSelect: () => void;
  onCheckNowPress: () => void;
  // Balance visibility props
  totalBalanceVisible?: boolean;
  onTotalBalanceVisibilityChange?: () => void;
  withdrawableBalanceVisible?: boolean;
  onWithdrawableVisibilityChange?: () => void;
  mainAccountBalanceVisible?: boolean;
  onMainAccountBalanceVisibilityChange?: () => void;
  // Loading states
  isMainAccountLoading?: boolean;
  isEspayLoading?: boolean;
  showCheckNow?: boolean;
}

const HorizontalBalanceCards: React.FC<HorizontalBalanceCardsProps> = ({
  accountTypes,
  selectedAccountType,
  onAccountTypeChange,
  onBalancePress,
  onAccountSelect,
  onCheckNowPress,
  totalBalanceVisible = true,
  onTotalBalanceVisibilityChange,
  withdrawableBalanceVisible = true,
  onWithdrawableVisibilityChange,
  mainAccountBalanceVisible = true,
  onMainAccountBalanceVisibilityChange,
  isMainAccountLoading = false,
  isEspayLoading = false,
  showCheckNow = true,
}) => {
  const renderBalanceCard = (accountData: AccountType) => {
    if (accountData.type === 'total_balance') {
      return (
        <TotalBalanceCard
          key={accountData.id}
          balance={accountData.balance}
          currency="đ"
          accountNumber={accountData.accountNumber}
          withdrawableBalance={accountData.withdrawableBalance}
          isLoading={false}
          onPress={onBalancePress}
          onCheckNowPress={onCheckNowPress}
          backgroundColor={accountData.backgroundColor}
          showCheckNow={showCheckNow}
          isBalanceVisible={totalBalanceVisible}
          onBalanceVisibilityChange={onTotalBalanceVisibilityChange}
          isWithdrawableVisible={withdrawableBalanceVisible}
          onWithdrawableVisibilityChange={onWithdrawableVisibilityChange}
          title={accountData.title}
        />
      );
    }

    return (
      <BalanceCard
        key={accountData.id}
        balance={accountData.balance}
        currency="đ"
        accountType={accountData.type}
        accountNumber={accountData.accountNumber}
        isLoading={accountData.type === 'main_account' ? isMainAccountLoading : accountData.type === 'espay_later' ? isEspayLoading : false}
        onPress={onBalancePress}
        onAccountSelect={onAccountSelect}
        onAccountTypeChange={onAccountTypeChange}
        onCheckNowPress={onCheckNowPress}
        backgroundColor={accountData.backgroundColor}
        showCheckNow={showCheckNow}
        useCachedData={accountData.useCachedData}
        usePropBalance={accountData.usePropBalance}
        isBalanceVisible={accountData.type === 'main_account' ? mainAccountBalanceVisible : undefined}
        onBalanceVisibilityChange={accountData.type === 'main_account' ? onMainAccountBalanceVisibilityChange : undefined}
        title={accountData.title}
      />
    );
  };

  return (
    <View style={styles.balanceCardsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={316}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.balanceCardsContent}
        style={styles.balanceCardsScrollView}
      >
        {accountTypes.map(renderBalanceCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCardsContainer: {
    // position: 'absolute',
    // zIndex: 10,
    paddingTop: 20,
  },
  balanceCardsScrollView: {
    flexGrow: 0,
    width: Dimensions.get('window').width,
  },
  balanceCardsContent: {
    paddingLeft: 8,
    paddingRight: 20,
  },
});

export default HorizontalBalanceCards;
