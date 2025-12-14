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
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Home01Icon, Time01Icon } from '@hugeicons/core-free-icons';

type WithdrawSuccessRouteProp = RouteProp<RootStackParamList, 'WithdrawSuccess'>;

const WithdrawSuccessScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<WithdrawSuccessRouteProp>();
  const { t } = useTranslation('withdraw');

  const { withdrawResult, targetScreen } = route.params;

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

  const stats = [
    ...(withdrawResult.linkedBank ? [
      { label: t('confirmation.bank'), value: withdrawResult.linkedBank.name },
      { label: t('confirmation.accountHolder'), value: withdrawResult.linkedBank.holderName },
      { label: t('confirmation.accountNumber'), value: withdrawResult.linkedBank.number },
    ] : []),
    { label: t('result.transactionId', 'Transaction ID'), value: withdrawResult.transactionId },
    { label: t('result.amountRequested', 'Amount Requested'), value: formatVND(withdrawResult.amount) },
    { label: t('result.fee', 'Fee'), value: `- ${formatVND(withdrawResult.fee)}` },
    { label: t('result.netAmount', 'Net Amount'), value: formatVND(withdrawResult.netAmount), isHighlighted: true },
    { label: t('result.processedAt', 'Processed At'), value: withdrawResult.processedAt, isTotal: true },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <SuccessIllustration style={styles.illustration} />
        <SuccessPageMessage title={t('result.title', 'Withdrawal Submitted')} style={styles.successMessage} />
        <TransactionStatsCard stats={stats} style={styles.statsCard} />
        <View style={styles.buttonContainer}>
          <Button
            label={t('result.backToHome', 'Home')}
            variant="outline"
            size="lg"
            onPress={handleBackToHome}
            style={styles.secondaryButton}
            leftIcon={<HugeiconsIcon icon={Home01Icon} size={20} color={colors.primary} />}
          />
          <Button
            label={t('result.viewHistory', 'History')}
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

export default WithdrawSuccessScreen;
