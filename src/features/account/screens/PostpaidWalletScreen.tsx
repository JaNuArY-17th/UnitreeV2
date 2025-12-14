import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import {
  Invoice01Icon,
  Settings02Icon,
  BookOpen01Icon,
  Calendar03Icon,
} from '@hugeicons/core-free-icons';
import { RootStackParamList } from '@/navigation/types';
import { usePostpaidData } from '../hooks/usePostpaid';
import { ActionGrid, ActionItemData } from '@/features/home/components';
import {
  PostpaidMainCard,
  PostpaidLoadingState,
  PostpaidErrorState,
  BillingInfoCard,
} from '../components';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';
import { useStatusBarEffect } from '@/shared/utils/StatusBarManager';

type PostpaidWalletNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PostpaidWalletScreen: React.FC = () => {
  const { t } = useTranslation('account');
  const navigation = useNavigation<PostpaidWalletNavigationProp>();
  const insets = useSafeAreaInsets();

  useStatusBarEffect('transparent', 'light-content', true);

  // Fetch postpaid data using the same hook as LoanContent
  const {
    data: postpaidResponse,
    isLoading,
    error,
    refetch,
  } = usePostpaidData();

  // Extract data from API response
  const postpaidData = postpaidResponse?.success ? postpaidResponse.data : null;

  // Calculate available balance
  const availableBalance = postpaidData
    ? postpaidData.creditLimit - postpaidData.spentCredit
    : 0;

  // Get due date day
  const getDueDay = (dueDate: string) => {
    try {
      const date = new Date(dueDate);
      return date.getDate().toString().padStart(2, '0');
    } catch {
      return '05';
    }
  };

  // Navigation handlers
  const handleBack = () => navigation.goBack();

  const handleInstallmentPress = () => {
    navigation.navigate('PostpaidInstallment');
  };

  const handlePayDebtPress = () => {
    if (!postpaidData) return;

    navigation.navigate('PostpaidPaymentConfirm', {
      amount: postpaidData.spentCredit,
      postpaidData: {
        userId: postpaidData.userId,
        creditLimit: postpaidData.creditLimit,
        spentCredit: postpaidData.spentCredit,
        commissionPercent: postpaidData.commissionPercent,
        status: postpaidData.status,
        dueDate: postpaidData.dueDate,
        createdAt: postpaidData.createdAt,
        updatedAt: postpaidData.updatedAt,
      },
      paymentSource: {
        id: 'main-1',
        type: 'main_account',
        balance: 50000000,
        accountNumber: '190333888999',
      },
    });
  };

  const handleSettingsPress = () => {
    navigation.navigate('PostpaidSettings');
  };

  const handleBillingPress = () => {
    navigation.navigate('PostpaidBilling');
  };

  const handleSeeAllTransactions = () => {
    navigation.navigate('PostpaidTransactionHistory');
  };

  // Action items for ActionGrid
  const actionItems: ActionItemData[] = [
    // {
    //   id: 'monthly-debt',
    //   title: t('postpaid.monthly.title'),
    //   icon: BookOpen01Icon,
    //   onPress: handleInstallmentPress,
    // },
    {
      id: 'billing',
      title: t('postpaid.billing.title'),
      icon: Calendar03Icon,
      onPress: handleBillingPress,
    },
    {
      id: 'pay-debt',
      title: t('postpaid.actions.payDebt'),
      icon: Invoice01Icon,
      onPress: handlePayDebtPress,
    },
    {
      id: 'settings',
      title: t('postpaid.actions.settings'),
      icon: Settings02Icon,
      onPress: handleSettingsPress,
    },
  ];

  // Loading State
  if (isLoading) {
    return <PostpaidLoadingState onBackPress={handleBack} />;
  }

  // Error State
  if (error || !postpaidData) {
    return <PostpaidErrorState onBackPress={handleBack} onRetry={() => refetch()} />;
  }

  const dueDay = getDueDay(postpaidData.dueDate);

  // Mock transactions (replace with API data when available)
  const recentTransactions = [
    { id: '1', title: 'Thanh toán hoá đơn điện', date: '2024-05-10', amount: 500000 },
    { id: '2', title: 'Mua sắm tại WinMart', date: '2024-05-08', amount: 1200000 },
    { id: '3', title: 'Nạp tiền điện thoại', date: '2024-05-05', amount: 200000 },
  ];

  // Prepare card data for PostpaidMainCard
  const cardData = {
    level: 'bronze',
    status: postpaidData.status,
    available: availableBalance,
    spent: postpaidData.spentCredit,
    dueDate: dueDay,
  };

  return (
    <VerificationRequiredOverlay>
      <View style={styles.container}>
        {/* Header Background */}
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          <ScreenHeader
            title={t('postpaid.title')}
            centerTitle
            backIconColor={colors.light}
            titleStyle={styles.headerTitle}
            showBack={true}
            onBackPress={handleBack}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Card - Using extracted component */}
          <PostpaidMainCard
            data={cardData}
            onViewDebtDetails={handlePayDebtPress}
          />

          {/* Action Buttons Row - Reusing ActionGrid */}
          <ActionGrid
            actions={actionItems}
            variant="light"
            style={styles.actionsContainer}
          />

          {/* Billing Info Card */}
          {/* <BillingInfoCard
            billingDate={24}
            lateFee={30000}
            isOverdue={false}
            onViewBillingDetails={handleBillingPress}
          /> */}
        </ScrollView>
      </View>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    color: colors.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  actionsContainer: {
    marginBottom: spacing.lg,
  },
});

export default PostpaidWalletScreen;
