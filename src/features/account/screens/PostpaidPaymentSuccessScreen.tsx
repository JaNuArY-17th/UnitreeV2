import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Text from '@/shared/components/base/Text';
import { Button, BackgroundPattern } from '@/shared/components/base';
import { SuccessIllustration, SuccessPageMessage, TransactionStatsCard } from '@/shared/components';
import { CreditCard, Wallet } from '@/shared/assets/icons';
import type { RootStackParamList } from '@/navigation/types';

interface PaymentResult {
  amount: number;
  postpaidData: {
    userId: string;
    creditLimit: number;
    spentCredit: number;
    commissionPercent: number;
    status: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
  };
  paymentSource: {
    id: string;
    type: 'main_account' | 'espay_later';
    balance: number;
    accountNumber?: string;
    status?: string;
    bankName?: string;
    isDefault?: boolean;
  };
  tempRequestId: string;
  phoneNumber: string;
  expireInSeconds: number;
  paidAmount: number;
  status: string;
  spentCredit: number;
  paymentTime: string;
  paymentStatus: 'completed' | 'pending' | 'failed';
}

interface RouteParams {
  paymentResult: PaymentResult;
  targetScreen?: 'Home' | 'History' | 'QRScan' | 'Report' | 'Profile';
}

type PostpaidPaymentSuccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PostpaidPaymentSuccessScreenRouteProp = RouteProp<any, any>;

export const PostpaidPaymentSuccessScreen: React.FC = () => {
  const { t } = useTranslation('account');
  const navigation = useNavigation<PostpaidPaymentSuccessScreenNavigationProp>();
  const route = useRoute<PostpaidPaymentSuccessScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const params = route.params as RouteParams;
  const { paymentResult, targetScreen } = params;

  // Prevent hardware back button from going back to OTP screen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Do nothing, prevent going back
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formattedDate = formatDate(paymentResult.paymentTime);

  // Success page data
  const successData = [
    { label: t('loan.paidAmount') || 'Số tiền đã thanh toán', value: `${formatCurrency(paymentResult.paidAmount)} đ` },
    { 
      label: t('loan.paymentMethod') || 'Phương thức thanh toán', 
      value: t('loan.mainAccount') || 'Tài khoản chính',
      icon: <Wallet width={16} height={16} color={colors.primary} />
    },
    { label: t('loan.remainingCredit') || 'Hạn mức còn lại', value: `${formatCurrency(paymentResult.postpaidData.creditLimit - paymentResult.spentCredit)} đ` },
    { label: t('loan.paymentTime') || 'Thời gian thanh toán', value: formattedDate, isTotal: true },
    { label: t('loan.status') || 'Trạng thái', value: t('loan.completed') || 'Hoàn tất', isHighlighted: true },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <SuccessIllustration style={styles.illustration} />
        <SuccessPageMessage 
          title={t('loan.paymentSuccessful') || 'Thanh toán thành công!'}
          subtitle={t('loan.paymentSuccessSubtitle') || 'Thanh toán ví trả sau của bạn đã được xử lý thành công.'}
        />
        <TransactionStatsCard stats={successData} style={styles.statsCard} />
        <View style={styles.buttonContainer}>
          <Button
            style={styles.primaryButton}
            label={t('loan.backToHome') || 'Về trang chủ'}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: targetScreen || 'Home' } }],
              });
            }}
            size="lg"
          />
          <Button
            style={styles.secondaryButton}
            label={t('loan.viewAccount') || 'Xem tài khoản'}
            variant="outline"
            onPress={() => {
              navigation.navigate('AccountManagement' as any);
            }}
            size="lg"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.light 
  },
  content: { 
    flexGrow: 1, 
    paddingHorizontal: spacing.lg 
  },
  illustration: { 
    alignSelf: 'center', 
    marginTop: spacing.xxl, 
    marginBottom: spacing.xl 
  },
  statsCard: {
    marginVertical: spacing.lg,
  },
  buttonContainer: { 
    flexDirection: 'row', 
    gap: spacing.md, 
    marginTop: 'auto', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingBottom: spacing.lg 
  },
  primaryButton: { 
    flex: 1 
  },
  secondaryButton: { 
    flex: 1 
  },
});

export default PostpaidPaymentSuccessScreen;