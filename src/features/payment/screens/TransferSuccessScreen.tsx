import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, View, StatusBar, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/shared/themes';
import { Button, Body, BackgroundPattern } from '@/shared/components/base';
import { SuccessIllustration, SuccessPageMessage, TransactionStatsCard } from '@/shared/components';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import type { RouteProp } from '@react-navigation/native';
import { formatVND } from '@/shared/utils/format';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { TransferRecipient } from '../types/transfer';
import type { PaymentSource } from '../components/PaymentSourceCard';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Home01Icon, Time01Icon } from '@hugeicons/core-free-icons';

type TransferSuccessRouteProp = RouteProp<RootStackParamList, 'TransferSuccess'>;

interface TransferResult {
  amount: string;
  recipient: TransferRecipient;
  paymentSource: PaymentSource;
  tempTransactionId: string;
  phoneNumber: string;
  expireInSeconds: number;
  transactionId: string;
  transactionCode: string;
  description: string;
  transferTime: string;
  status: 'completed' | 'pending' | 'failed';
}

interface RouteParams {
  transferResult: TransferResult;
  targetScreen?: 'Home' | 'History' | 'QRScan' | 'Report' | 'Profile';
}

export const TransferSuccessScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<TransferSuccessRouteProp>();
  const { t } = useTranslation('payment');

  const params = route.params as RouteParams;
  const { transferResult, targetScreen } = params;

  // Prevent hardware back button from going back to OTP screen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Do nothing, prevent going back
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleBackToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: targetScreen || 'Home' } }],
      })
    );
  };

  const handleViewHistory = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'History' } }],
      })
    );
  };

  const formattedDate = new Date(transferResult.transferTime).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const stats = [
    { label: t('transfer.recipient') || 'Recipient', value: transferResult.recipient.name },
    { label: t('transfer.accountNumber') || 'Account Number', value: transferResult.recipient.accountNumber },
    { label: t('transfer.transactionCode') || 'Transaction Code', value: transferResult.transactionCode },
    { label: t('transfer.amount') || 'Amount', value: formatVND(parseInt(transferResult.amount, 10)) },
    { label: t('transfer.description') || 'Description', value: transferResult.description || 'N/A' },
    { label: t('transfer.paymentSource') || 'Payment From', value: transferResult.paymentSource.type === 'espay_later' ? t('paymentSource.espayLater') : t('paymentSource.mainAccount') },
    { label: t('transfer.transferTime') || 'Transfer Time', value: formattedDate, isTotal: true },
    { label: t('transfer.status') || 'Status', value: t('transfer.completed') || 'Completed', isHighlighted: true },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <SuccessIllustration style={styles.illustration} />
        <SuccessPageMessage
          title={t('transfer.transferSuccessful') || 'Transfer Successful!'}
          style={styles.successMessage}
        />
        <TransactionStatsCard stats={stats} style={styles.statsCard} />
        <View style={styles.buttonContainer}>
          <Button
            label={t('transfer.backToHome') || 'Home'}
            variant="outline"
            size="lg"
            onPress={handleBackToHome}
            style={styles.secondaryButton}
            leftIcon={<HugeiconsIcon icon={Home01Icon} size={20} color={colors.primary} />}
          />
          <Button
            label={t('transfer.viewHistory') || 'History'}
            variant="primary"
            size="lg"
            onPress={handleViewHistory}
            style={styles.primaryButton}
            leftIcon={<HugeiconsIcon icon={Time01Icon} size={20} color={colors.light} />}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between' },
  illustration: {},
  successMessage: { paddingHorizontal: spacing.sm },
  statsCard: {},
  buttonContainer: { flexDirection: 'row', gap: spacing.md, marginTop: 'auto', justifyContent: 'center', alignItems: 'center', paddingBottom: spacing.lg },
  primaryButton: { flex: 1 },
  secondaryButton: { flex: 1 },
});

export default TransferSuccessScreen;
