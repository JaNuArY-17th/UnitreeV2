import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import { ScreenHeader, BottomSheetModal } from '@/shared/components';
import Text from '@/shared/components/base/Text';
import { useTranslation } from '@/shared/hooks/useTranslation';
import PaymentOptionsCard, { PaymentOption } from '../components/PaymentOptionsCard';
import type { RootStackParamList } from '@/navigation/types';

interface BillingPeriod {
  id: string;
  periodName: string;
  billingDate: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'current' | 'overdue' | 'upcoming';
  paidDate?: string;
  lateFee?: number;
}

interface RouteParams {
  billingPeriod: BillingPeriod;
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
}

type PostpaidPaymentOptionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PostpaidPaymentOptionsScreenRouteProp = RouteProp<any, any>;

const PostpaidPaymentOptionsScreen: React.FC = () => {
  const { t } = useTranslation('account');
  const navigation = useNavigation<PostpaidPaymentOptionsScreenNavigationProp>();
  const route = useRoute<PostpaidPaymentOptionsScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const params = route.params as RouteParams;
  const { billingPeriod, postpaidData } = params;

  const [selectedOption, setSelectedOption] = useState<PaymentOption>('full');
  const [customAmount, setCustomAmount] = useState<number | undefined>(undefined);
  const [showCustomAmountModal, setShowCustomAmountModal] = useState(false);
  const [customAmountInput, setCustomAmountInput] = useState('');

  // Calculate minimum payment (e.g., 10% of total or 100,000 VND minimum)
  const minimumPayment = Math.max(billingPeriod.amount * 0.1, 100000);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleBack = () => navigation.goBack();

  const handleSelectOption = (option: PaymentOption) => {
    setSelectedOption(option);
  };

  const handleCustomAmountPress = () => {
    setShowCustomAmountModal(true);
    setCustomAmountInput(customAmount?.toString() || '');
  };

  const handleConfirmCustomAmount = () => {
    const amount = parseInt(customAmountInput.replace(/[^0-9]/g, ''), 10);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert(
        t('postpaid.payment.error'),
        t('postpaid.payment.invalidAmount')
      );
      return;
    }

    if (amount < minimumPayment) {
      Alert.alert(
        t('postpaid.payment.error'),
        `${t('postpaid.payment.minimumAmountRequired')}: ${formatCurrency(minimumPayment)}`
      );
      return;
    }

    if (amount > billingPeriod.amount) {
      Alert.alert(
        t('postpaid.payment.error'),
        t('postpaid.payment.exceedsDebt')
      );
      return;
    }

    setCustomAmount(amount);
    setSelectedOption('custom');
    setShowCustomAmountModal(false);
  };

  const handleProceed = () => {
    let paymentAmount: number;

    switch (selectedOption) {
      case 'full':
        paymentAmount = billingPeriod.amount;
        break;
      case 'minimum':
        paymentAmount = minimumPayment;
        break;
      case 'custom':
        paymentAmount = customAmount || 0;
        break;
      default:
        paymentAmount = billingPeriod.amount;
    }

    if (paymentAmount <= 0) {
      Alert.alert(
        t('postpaid.payment.error'),
        t('postpaid.payment.selectValidAmount')
      );
      return;
    }

    // Navigate to payment confirmation
    navigation.navigate('PostpaidPaymentConfirm', {
      amount: paymentAmount,
      postpaidData: postpaidData,
      paymentSource: {
        id: 'main-1',
        type: 'main_account',
        balance: 50000000,
        accountNumber: '190333888999',
      },
    });
  };

  const formatInputAmount = (text: string) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    // Format with thousand separators
    if (numericValue) {
      return parseInt(numericValue, 10).toLocaleString('vi-VN');
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScreenHeader
          title={t('postpaid.payment.paymentOptions')}
          titleStyle={{ color: colors.light }}
          backIconColor={colors.light}
          showBack={true}
          onBackPress={handleBack}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Billing Period Info */}
          <View style={styles.periodInfoCard}>
            <Text style={styles.periodName}>{billingPeriod.periodName}</Text>
            <Text style={styles.periodAmount}>{formatCurrency(billingPeriod.amount)}</Text>
            <Text style={styles.periodDueDate}>
              {t('postpaid.billing.dueDate')}: {new Date(billingPeriod.dueDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          {/* Payment Options */}
          <PaymentOptionsCard
            totalDebt={billingPeriod.amount}
            minimumPayment={minimumPayment}
            selectedOption={selectedOption}
            customAmount={customAmount}
            onSelectOption={handleSelectOption}
            onCustomAmountPress={handleCustomAmountPress}
            onProceed={handleProceed}
          />

          {/* Payment Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>{t('postpaid.payment.notes')}</Text>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>{t('postpaid.payment.noteNoInterest')}</Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>
                {t('postpaid.payment.noteLateFee')}: {formatCurrency(30000)}/{t('postpaid.billing.perPeriod')}
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>{t('postpaid.payment.noteMinimumPayment')}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Amount Modal */}
      <BottomSheetModal
        visible={showCustomAmountModal}
        onClose={() => setShowCustomAmountModal(false)}
        title={t('postpaid.payment.enterCustomAmount')}
      >
        <View style={styles.customAmountContent}>
          <Text style={styles.customAmountLabel}>{t('postpaid.payment.paymentAmount')}</Text>
          <View style={styles.customAmountInputContainer}>
            <TextInput
              style={styles.customAmountInput}
              value={formatInputAmount(customAmountInput)}
              onChangeText={(text) => setCustomAmountInput(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.text.secondary}
              autoFocus
            />
            <Text style={styles.currencyLabel}>VNĐ</Text>
          </View>

          <View style={styles.amountRange}>
            <Text style={styles.rangeText}>
              {t('postpaid.payment.minimum')}: {formatCurrency(minimumPayment)}
            </Text>
            <Text style={styles.rangeText}>
              {t('postpaid.payment.maximum')}: {formatCurrency(billingPeriod.amount)}
            </Text>
          </View>

          <View style={styles.modalButtons}>
            <View style={styles.modalButton}>
              <Text
                style={styles.cancelButtonText}
                onPress={() => setShowCustomAmountModal(false)}
              >
                {t('common.cancel')}
              </Text>
            </View>
            <View style={[styles.modalButton, styles.confirmButton]}>
              <Text
                style={styles.confirmButtonText}
                onPress={handleConfirmCustomAmount}
              >
                {t('common.confirm')}
              </Text>
            </View>
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingBottom: spacing.lg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  periodInfoCard: {
    backgroundColor: colors.primary,
    borderRadius: dimensions.radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  periodName: {
    ...typography.body,
    color: colors.light,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  periodAmount: {
    ...typography.h1,
    fontWeight: 'bold',
    color: colors.light,
    marginBottom: spacing.xs,
  },
  periodDueDate: {
    ...typography.caption,
    color: colors.light,
    opacity: 0.8,
  },
  notesSection: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  noteBullet: {
    ...typography.body,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  noteText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  customAmountContent: {
    padding: spacing.lg,
  },
  customAmountLabel: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  customAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  customAmountInput: {
    flex: 1,
    ...typography.h2,
    fontWeight: 'bold',
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  currencyLabel: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  amountRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  rangeText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  confirmButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.light,
  },
});

export default PostpaidPaymentOptionsScreen;
