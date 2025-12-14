import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { useTranslation } from 'react-i18next';
import { Button, BackgroundPattern } from '@/shared/components/base';
import { SuccessIllustration, SuccessPageMessage, TransactionStatsCard } from '@/shared/components';
import type { RootStackParamList } from '@/navigation/types';

interface PaymentResult {
  paidAmount: number;
  paidCount: number;
}

interface RouteParams {
  paymentResult: PaymentResult;
  targetScreen?: 'Home' | 'History' | 'QRScan' | 'Report' | 'Profile';
}

type CommissionPaymentSuccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CommissionPaymentSuccessScreenRouteProp = RouteProp<any, any>;

const CommissionPaymentSuccessScreen: React.FC = () => {
  const { t } = useTranslation('commission');
  const navigation = useNavigation<CommissionPaymentSuccessScreenNavigationProp>();
  const route = useRoute<CommissionPaymentSuccessScreenRouteProp>();
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

  // Format date
  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formattedDate = formatDate();

  // Success page data
  const successData = [
    { label: t('paidAmount', 'Paid Amount'), value: `${formatCurrency(paymentResult.paidAmount)} đ` },
    { label: t('paidCount', 'Paid Count'), value: paymentResult.paidCount.toString() },
    { label: t('paymentTime', 'Payment Time'), value: formattedDate, isTotal: true },
    { label: t('status', 'Status'), value: t('completed', 'Completed'), isHighlighted: true },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <SuccessIllustration style={styles.illustration} />
        <SuccessPageMessage
          title={t('commissionPaymentSuccessful', 'Commission Payment Successful')}
          subtitle={t('paymentProcessedSuccessfully', 'Your commission payment has been processed successfully')}
        />
        <TransactionStatsCard stats={successData} style={styles.statsCard} />
        <View style={styles.buttonContainer}>
          <Button
            style={styles.primaryButton}
            label={t('backToHome', 'Back to Home')}
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
            label={t('viewHistory', 'View History')}
            variant="outline"
            onPress={() => {
              navigation.navigate('CommissionHistory' as any);
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

export default CommissionPaymentSuccessScreen;