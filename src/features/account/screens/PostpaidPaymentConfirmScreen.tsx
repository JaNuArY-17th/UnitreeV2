import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions, typography } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { Heading, Body } from '@/shared/components/base';
import Text from '@/shared/components/base/Text';
import Button from '@/shared/components/base/Button';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { BackgroundPattern } from '@/shared/components/base';
import { CreditCard, Wallet } from '@/shared/assets/icons';
import { usePostpaidPaymentInitiate } from '../hooks/usePostpaidPayment';
import type { RootStackParamList } from '@/navigation/types';

interface RouteParams {
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
}

type PostpaidPaymentConfirmScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PostpaidPaymentConfirmScreenRouteProp = RouteProp<any, any>;

export const PostpaidPaymentConfirmScreen: React.FC = () => {
  const { t } = useTranslation('account');
  const navigation = useNavigation<PostpaidPaymentConfirmScreenNavigationProp>();
  const route = useRoute<PostpaidPaymentConfirmScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const params = route.params as RouteParams;
  const { amount, postpaidData, paymentSource } = params;

  const [isConfirming, setIsConfirming] = useState(false);

  // Postpaid payment initiate mutation
  const paymentInitiateMutation = usePostpaidPaymentInitiate();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const handleConfirmPayment = async () => {
    if (!amount) {
      Alert.alert(
        t('loan.error') || 'Lỗi',
        t('loan.missingAmount') || 'Số tiền thanh toán không hợp lệ'
      );
      return;
    }

    setIsConfirming(true);

    try {
      const result = await paymentInitiateMutation.mutateAsync({
        amount: amount.toString(),
      });

      if (result.success && result.data) {
        // Navigate to OTP verification screen
        navigation.navigate('PostpaidPaymentOtp' as any, {
          paymentData: {
            amount,
            postpaidData,
            paymentSource,
            tempRequestId: result.data.requestId,
            phoneNumber: result.data.phone,
            expireInSeconds: result.data.expireInSeconds,
          }
        });
      } else {
        Alert.alert(
          t('loan.error') || 'Lỗi thanh toán',
          result.message || t('loan.paymentInitiateFailed') || 'Không thể khởi tạo thanh toán'
        );
      }
    } catch (error: any) {
      console.error('Postpaid payment initiation error:', error);
      Alert.alert(
        t('loan.error') || 'Lỗi thanh toán',
        error.message || t('loan.networkError') || 'Đã xảy ra lỗi mạng'
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formattedAmount = formatCurrency(amount);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />

      <ScreenHeader
        title={t('loan.confirmPayment') || 'Xác nhận thanh toán'}
        showBack
        onBackPress={handleGoBack}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Body style={styles.amountLabel}>
            {t('loan.paymentAmount') || 'Số tiền thanh toán'}
          </Body>
          <Heading style={styles.amountText}>{formattedAmount} đ</Heading>
        </View>

        {/* Payment Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>
            {t('loan.paymentDetails') || 'Chi tiết thanh toán'}
          </Text>

          {/* Payment Source Section */}
          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t('loan.paymentMethod') || 'Phương thức thanh toán'}
              </Text>
              <View style={styles.detailContent}>
                <View style={styles.accountRow}>
                  <Wallet width={20} height={20} color={colors.primary} />
                  <Text style={styles.detailValue}>
                    {t('loan.mainAccount') || 'Tài khoản chính'}
                  </Text>
                </View>
                <Text style={styles.detailSubValue}>
                  {paymentSource.accountNumber || 'Main Account'}
                </Text>
              </View>
            </View>
          </View>

          {/* Amount Details */}
          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t('loan.totalPayment') || 'Thanh toán tối thiểu'}
              </Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailValue}>
                  {formattedAmount} đ
                </Text>
              </View>
            </View>
          </View>

          {/* Due Date */}
          <View style={[styles.detailSection, { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t('loan.dueDate') || 'Ngày đáo hạn'}
              </Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailValue}>
                  {new Date(postpaidData.dueDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          label={isConfirming ?
            (t('loan.confirming') || 'Đang xử lý...') :
            (t('loan.confirmPayment') || 'Xác nhận thanh toán')
          }
          onPress={handleConfirmPayment}
          disabled={isConfirming}
          loading={isConfirming}
          size='lg'
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  amountText: {
    fontSize: 40,
    color: colors.primary,
    lineHeight: 48,
  },
  amountLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  detailsCard: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,

    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  detailSection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing.md,
  },
  detailContent: {
    flex: 2,
    alignItems: 'flex-end',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: 16,

    color: colors.text.primary,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  detailSubValue: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  bottomContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

export default PostpaidPaymentConfirmScreen;
