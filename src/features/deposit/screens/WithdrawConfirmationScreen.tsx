import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/shared/themes';
import { Heading, Button, Body } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatVND } from '@/shared/utils/format';
import ScreenHeader from '@/shared/components/ScreenHeader';

type WithdrawConfirmationRouteProp = RouteProp<RootStackParamList, 'WithdrawConfirmation'>;

const WithdrawConfirmationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<WithdrawConfirmationRouteProp>();
  const { t } = useTranslation('withdraw');

  const { amount, accountNumber, transferContent, availableBalance, linkedBank } = route.params;
  // Extended fields from initiate response (not typed in navigator yet)
  const requestId = (route.params as any)?.requestId as string | undefined;
  const phoneNumber = (route.params as any)?.phoneNumber as string | undefined;
  const otpExpirySeconds = (route.params as any)?.otpExpirySeconds as number | undefined;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    Alert.alert(
      t('confirmation.noticeTitle'),
      t('confirmation.confirmationMessage', { amount: formatVND(amount) }),
      [
        {
          text: t('confirmation.cancel'),
          style: 'cancel',
        },
        {
          text: t('confirmation.confirm'),
          style: 'default',
          onPress: processWithdraw,
        },
      ]
    );
  };

  const processWithdraw = async () => {
    // Check if we have the required OTP session data
    if (!requestId || !phoneNumber) {
      Alert.alert(
        t('confirmation.errorTitle'),
        'Missing OTP session data. Please try again.',
        [{ text: t('common:ok'), onPress: () => navigation.goBack() }]
      );
      return;
    }

    // Navigate to OTP screen for verification
    navigation.navigate('WithdrawOtp', {
      withdrawData: {
        amount,
        accountNumber,
        transferContent,
        availableBalance,
        linkedBank,
        // Pass through OTP session info
        requestId,
        phoneNumber,
        otpExpirySeconds: otpExpirySeconds || 300,
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <ScreenHeader title={t('confirmation.title')} centerTitle />

      <View style={styles.content}>
        <View style={styles.section}>
          <Heading level={2} style={styles.sectionTitle}>{t('confirmation.amount')}</Heading>
          <Heading level={1} style={styles.amount}>{formatVND(amount)}</Heading>
        </View>

        <View style={styles.section}>
          <Heading level={3} style={styles.sectionTitle}>{t('confirmation.transferInfo')}</Heading>

          {linkedBank && (
            <>
              <View style={styles.infoRow}>
                <Body style={styles.label}>{t('confirmation.bank')}</Body>
                <Body style={styles.value}>{linkedBank.name}</Body>
              </View>
              <View style={styles.infoRow}>
                <Body style={styles.label}>{t('confirmation.accountHolder')}</Body>
                <Body style={styles.value}>{linkedBank.holderName}</Body>
              </View>
              <View style={styles.infoRow}>
                <Body style={styles.label}>{t('confirmation.accountNumber')}</Body>
                <Body style={styles.value}>{linkedBank.number}</Body>
              </View>
            </>
          )}

          <View style={styles.infoRow}>
            <Body style={styles.label}>{t('confirmation.transferContent')}</Body>
            <Body style={styles.value}>{transferContent}</Body>
          </View>

          <View style={styles.infoRow}>
            <Body style={styles.label}>{t('confirmation.availableBalance')}</Body>
            <Body style={styles.value}>{formatVND(availableBalance)}</Body>
          </View>

          <View style={styles.infoRow}>
            <Body style={styles.label}>{t('confirmation.processingTime')}</Body>
            <Body style={styles.value}>{t('confirmation.processingTimeValue')}</Body>
          </View>

          <View style={styles.infoRow}>
            <Body style={styles.label}>{t('confirmation.fee')}</Body>
            <Body style={styles.value}>{t('confirmation.feeValue')}</Body>
          </View>
        </View>

        <View style={styles.warningSection}>
          <Body style={styles.warningText}>{t('confirmation.warningMessage')}</Body>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          label={isProcessing ? 'Processing...' : t('confirmation.confirm')}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleConfirm}
          disabled={isProcessing}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  amount: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.text.secondary,
    flex: 1,
  },
  value: {
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  warningSection: {
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  warningText: {
    color: colors.warning,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
});

export default WithdrawConfirmationScreen;
