import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { useTranslation } from 'react-i18next';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { ScreenHeader, Text } from '@/shared/components';
import {
  TotalAmountSection,
  TransactionsList,
  TransferDetailsCard,
  ActionButtons,
  OrderDetailsCard,
  TransactionDetailSkeleton,
} from '../components';
import { useTransactionDetail } from '../hooks';
import type { RootStackParamList } from '@/navigation/types';
import { spacing, colors, typography } from '../../../shared/themes';
import { BackgroundPatternSolid } from '@/shared/components/base';
import { useUserData } from '@/features/profile/hooks';
import { useBankAccount } from '@/features/deposit/hooks';
import { useOrder } from '@/features/order/hooks/useOrder';

const TransactionDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('transactions');
  const viewShotRef = useRef<ViewShot>(null);
  // Get transaction id from params (may be string or number)
  // @ts-ignore
  const paramTransaction = route.params?.transaction;
  const transactionId = paramTransaction?.id || paramTransaction?.transactionId || paramTransaction;

  useStatusBarEffect('transparent', 'dark-content', true);

  const { data, isLoading, isError, error } = useTransactionDetail(transactionId);
  const { data: userData } = useUserData();

  // Get both USER and STORE bank accounts to compare with transaction accounts
  const { data: userBankData } = useBankAccount('USER');
  const { data: storeBankData } = useBankAccount('STORE');

  // Extract orderId from transaction data if available
  // Only fetch order when transaction data is successfully loaded
  const orderId = data?.success && data?.data?.orderId ? data.data.orderId : undefined;

  // Fetch order details only after transaction is loaded successfully and orderId exists
  const {
    data: orderData,
    isLoading: isOrderLoading,
  } = useOrder(orderId, {
    enabled: !isLoading && !!orderId && !!data?.success,
  });

  const handleShare = async () => {
    try {
      if (!viewShotRef.current?.capture) {
        Alert.alert(
          t('transactionDetail.error', 'Lỗi'),
          t('transactionDetail.screenshotError', 'Không thể chụp màn hình')
        );
        return;
      }

      // Capture the screen without status bar
      const uri = await viewShotRef.current.capture();

      // Share the screenshot
      const shareOptions = {
        title: t('transactionDetail.shareTitle', 'Chia sẻ giao dịch'),
        message: t('transactionDetail.shareMessage', 'Chi tiết giao dịch'),
        url: uri,
        type: 'image/png',
      };

      await Share.open(shareOptions);
      console.log('📤 [TransactionDetailScreen] Transaction shared successfully');
    } catch (error: any) {
      // User cancelled the share or an error occurred
      if (error?.message !== 'User did not share') {
        console.error('❌ [TransactionDetailScreen] Share error:', error);
        Alert.alert(
          t('transactionDetail.error', 'Lỗi'),
          t('transactionDetail.shareError', 'Không thể chia sẻ giao dịch')
        );
      }
    }
  };

  const handleTransfer = () => {
    if (!data?.data) {
      Alert.alert(
        t('transactionDetail.error', 'Lỗi'),
        t('transactionDetail.noTransactionData', 'Không có dữ liệu giao dịch')
      );
      return;
    }

    const apiTxn = data.data;

    // Get account details from transaction
    const fromAccountNumber = (apiTxn as any).fromAccountNumber || '';
    const fromAccountName = (apiTxn as any).fromAccountName || '';
    const toAccountNumber = (apiTxn as any).toAccountNumber || '';
    const toAccountName = (apiTxn as any).toAccountName || '';

    // Get current user's bank account numbers from cached data
    const userAccountNumber = userBankData?.data?.bankNumber || '';
    const storeAccountNumber = storeBankData?.data?.bankNumber || '';

    console.log('🔍 [TransactionDetailScreen] Comparing accounts:', {
      fromAccount: fromAccountNumber,
      toAccount: toAccountNumber,
      userAccount: userAccountNumber,
      storeAccount: storeAccountNumber,
    });

    // Determine recipient by comparing with current user's account numbers
    let recipientAccountNumber = '';
    let recipientAccountName = '';
    let isFromCurrentUser = false;
    let isToCurrentUser = false;

    // Check if "from" account matches current user's accounts
    if (fromAccountNumber && (fromAccountNumber === userAccountNumber || fromAccountNumber === storeAccountNumber)) {
      isFromCurrentUser = true;
    }

    // Check if "to" account matches current user's accounts
    if (toAccountNumber && (toAccountNumber === userAccountNumber || toAccountNumber === storeAccountNumber)) {
      isToCurrentUser = true;
    }

    // Determine recipient based on comparison
    if (isFromCurrentUser && !isToCurrentUser) {
      // Current user sent money, recipient is "to"
      recipientAccountNumber = toAccountNumber;
      recipientAccountName = toAccountName;
      console.log('✅ [TransactionDetailScreen] Current user sent money to:', toAccountName);
    } else if (isToCurrentUser && !isFromCurrentUser) {
      // Current user received money, recipient is "from"
      recipientAccountNumber = fromAccountNumber;
      recipientAccountName = fromAccountName;
      console.log('✅ [TransactionDetailScreen] Current user received money from:', fromAccountName);
    } else if (isFromCurrentUser && isToCurrentUser) {
      // Both accounts belong to current user (self-transfer)
      Alert.alert(
        t('transactionDetail.info', 'Thông tin'),
        t('transactionDetail.selfTransfer', 'Đây là giao dịch chuyển tiền giữa các tài khoản của bạn')
      );
      return;
    } else {
      // Neither account matches - this shouldn't happen in normal flow
      console.warn('⚠️ [TransactionDetailScreen] No matching account found');
      Alert.alert(
        t('transactionDetail.error', 'Lỗi'),
        t('transactionDetail.cannotDetermineRecipient', 'Không thể xác định người nhận. Vui lòng thử lại sau.')
      );
      return;
    }

    // Validate recipient data
    if (!recipientAccountNumber || !recipientAccountName) {
      Alert.alert(
        t('transactionDetail.error', 'Lỗi'),
        t('transactionDetail.noRecipientInfo', 'Không tìm thấy thông tin người nhận')
      );
      return;
    }

    // Navigate to TransferMoney screen with recipient information
    navigation.replace('TransferMoney', {
      recipient: {
        name: recipientAccountName,
        accountNumber: recipientAccountNumber,
        bankName: 'ENSOGO ESPay', // Default bank name, can be enhanced if bank info is available
        bankCode: 'ENSOGO',
        isEzyWallet: true, // Assuming internal wallet transfer
      },
      autoSelectedRecipient: true,
    });

    console.log('🔄 [TransactionDetailScreen] Navigating to transfer with recipient:', {
      name: recipientAccountName,
      accountNumber: recipientAccountNumber,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <ScreenHeader title={t('transactionDetail.title')} />
        <TransactionDetailSkeleton />
      </View>
    );
  }

  // Error state
  if (isError || !data?.success) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>{t('transactionDetail.failedToLoad', 'Không thể tải chi tiết giao dịch')}</Text>
        <Text style={styles.errorDetail}>{error?.message || data?.message || ''}</Text>
      </View>
    );
  }

  const apiTxn = data.data;
  // Map API fields to UI fields for TransactionsList

  // Format amount: only format with thousands separator, no +/- signs
  // TransactionsList component will add +/- based on isFrom logic
  const formatAmount = (amount: number | string) => {
    const n = typeof amount === 'number' ? amount : Number(amount);
    return Math.abs(n).toLocaleString('vi-VN');
  };

  // Format date: split at T, show date and time (hh:mm:ss), remove ms
  const formatDateTime = (iso: string) => {
    if (!iso) return '';
    const [date, timeRaw] = iso.split('T');
    const time = timeRaw ? timeRaw.split('.')[0] : '';
    return `${date}\n${time}`;
  };

  const uiTransaction = {
    id: String(apiTxn.id),
    amount: formatAmount(apiTxn.amount),
    type: (apiTxn.state === 'MONEY_IN' ? 'in' : 'out') as 'in' | 'out',
    description: apiTxn.description,
    transactionTime: formatDateTime(apiTxn.createdAt),
    from: (apiTxn as any).fromAccountName || '',
    to: (apiTxn as any).toAccountName || '',
    fromAccount: (apiTxn as any).fromAccountNumber || '',
    toAccount: (apiTxn as any).toAccountNumber || '',
    state: 'success' as 'success', // always successful per requirements
  };

  // For totalAmount and transferAmount, add +/- based on transaction state
  const amountWithSign = apiTxn.state === 'MONEY_IN'
    ? `+${formatAmount(apiTxn.amount)}`
    : `-${formatAmount(apiTxn.amount)}`;

  const totalAmount = `${amountWithSign} đ`;
  const isSuccess = true; // always successful
  const status = 'Successful';
  const transactionType = apiTxn.state === 'MONEY_IN' ? 'in' : 'out';
  const transferDetails = {
    transferId: apiTxn.transactionCode,
    transferAmount: `${amountWithSign} đ`,
    description: apiTxn.description,
    transactionTime: apiTxn.createdAt,
    transactionType: apiTxn.transactionType,
    state: apiTxn.state,
  };

  return (
    <ViewShot
      ref={viewShotRef}
      options={{
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      }}
      style={styles.captureContainer}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        {/* <BackgroundPatternSolid
          backgroundColor={colors.light}
          patternColor={colors.gray}
        /> */}

        <ScreenHeader title={t('transactionDetail.title')} />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TotalAmountSection
            totalAmount={totalAmount}
            status={status}
            transactionType={transactionType as 'in' | 'out'}
            isSuccess={isSuccess}
          />
          <TransactionsList transactions={[uiTransaction]} />
          <TransferDetailsCard transferDetails={transferDetails} />

          <OrderDetailsCard
            orderId={orderId}
            orderData={orderData}
            isOrderLoading={isOrderLoading}
            onOrderPress={(order) => {
              navigation.navigate('OrderDetail', { orderId: order.id });
            }}
          />
        </ScrollView>

        <ActionButtons onShare={handleShare} onTransfer={handleTransfer} />
      </View>
    </ViewShot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  captureContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.lg,
    ...typography.body,
    color: colors.text.secondary,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  errorDetail: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default TransactionDetailScreen;
