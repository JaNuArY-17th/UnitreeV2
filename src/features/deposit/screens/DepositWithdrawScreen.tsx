import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import the content components
import { DepositContent, WithdrawContent, ToggleButton } from '../components';
import { MoneyReceiveFlow01Icon, MoneySend01Icon } from '@hugeicons/core-free-icons';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';

const DepositWithdrawScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t: tDeposit } = useTranslation('deposit');
  const { t: tWithdraw } = useTranslation('withdraw');
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');

  useStatusBarEffect('transparent', 'light-content', true);

  return (
    <VerificationRequiredOverlay>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]}>
            {/* <View style={{ flex: 1, backgroundColor: 'rgba(43, 43, 43, 0.48)' }} /> */}
          </View>
          <StatusBar barStyle="light-content" backgroundColor='transparent' translucent />

          <ScreenHeader
            title={tDeposit('actions.depositWithdraw')}
            centerTitle
            backIconColor={colors.light}
            titleStyle={styles.headerTitle}
          />

          <View style={styles.toggleContainer}>
            <ToggleButton
              value={mode}
              onValueChange={setMode}
              leftLabel={tDeposit('title')}
              rightLabel={tWithdraw('title')}
              leftValue="deposit"
              rightValue="withdraw"
              leftIcon={MoneyReceiveFlow01Icon}
              rightIcon={MoneySend01Icon}
              variant="onPrimary"
            />
          </View>
        </View>

        <View style={styles.content}>
          {mode === 'deposit' ? (
            <DepositContent />
          ) : (
            <WithdrawContent />
          )}
        </View>
      </KeyboardAvoidingView>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  headerContainer: {
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    color: colors.light,
  },
  toggleContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: spacing.lg,
  },
});

export default DepositWithdrawScreen;
