import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Text from '@/shared/components/base/Text';
import { PostpaidCard } from './PostpaidCard';
import CreditTransactionsList from './CreditTransactionsList';
import { usePostpaidData, useRequestPostpaid } from '../hooks/usePostpaid';

interface LoanContentProps {
  style?: any;
}

export const LoanContent: React.FC<LoanContentProps> = ({ style }) => {
  const { t } = useTranslation('account');

  // Fetch postpaid data
  const {
    data: postpaidResponse,
    isLoading: isLoadingPostpaid,
    error: postpaidError,
    refetch: refetchPostpaid,
  } = usePostpaidData();

  // Request postpaid activation mutation
  const {
    mutate: requestPostpaid,
    isPending: isRequestingPostpaid,
  } = useRequestPostpaid();

  const handlePostpaidCardPress = () => {
    console.log('Postpaid card pressed');
    // Navigate to postpaid details screen
  };

  const handleActivatePostpaid = () => {
    Alert.alert(
      t('loan.confirmActivation', 'Xác nhận kích hoạt'),
      t('loan.activationConfirmMessage', 'Bạn có muốn kích hoạt ví trả sau ESPay không? Sau khi kích hoạt, bạn có thể sử dụng hạn mức tín dụng để mua sắm.'),
      [
        {
          text: t('common:cancel', 'Hủy'),
          style: 'cancel',
        },
        {
          text: t('loan.activate', 'Kích hoạt'),
          onPress: () => {
            requestPostpaid(undefined, {
              onSuccess: (response) => {
                if (response.success) {
                  Alert.alert(
                    t('loan.activationSuccess', 'Kích hoạt thành công'),
                    t('loan.activationSuccessMessage', 'Đã gửi yêu cầu thành công. Vui lòng đợi quản trị viên phê duyệt cấp hạn mức'),
                    [{ text: t('common:ok', 'OK') }]
                  );
                  refetchPostpaid(); // Refresh data after successful activation
                } else {
                  Alert.alert(
                    t('loan.activationError', 'Lỗi kích hoạt'),
                    response.message || t('loan.activationErrorMessage', 'Không thể kích hoạt ví trả sau. Vui lòng thử lại sau.'),
                    [{ text: t('common:ok', 'OK') }]
                  );
                }
              },
              onError: (error: any) => {
                Alert.alert(
                  t('loan.activationError', 'Lỗi kích hoạt'),
                  error.message || t('loan.activationErrorMessage', 'Không thể kích hoạt ví trả sau. Vui lòng thử lại sau.'),
                  [{ text: t('common:ok', 'OK') }]
                );
              },
            });
          },
        },
      ]
    );
  };

  const handleReactivatePostpaid = () => {
    Alert.alert(
      t('loan.confirmReactivation', 'Xác nhận mở khóa'),
      t('loan.reactivationConfirmMessage', 'Bạn có muốn gửi yêu cầu mở khóa ví trả sau ESPay không? Yêu cầu sẽ được xem xét và phản hồi trong vòng 24h.'),
      [
        {
          text: t('common:cancel', 'Hủy'),
          style: 'cancel',
        },
        {
          text: t('loan.sendRequest', 'Gửi yêu cầu'),
          onPress: () => {
            // TODO: Implement reactivation API call
            // For now, show a success message
            Alert.alert(
              t('loan.requestSent', 'Yêu cầu đã được gửi'),
              t('loan.requestSentMessage', 'Yêu cầu mở khóa ví trả sau của bạn đã được gửi. Chúng tôi sẽ xem xét và phản hồi trong vòng 24h.'),
              [{ text: t('common:ok', 'OK') }]
            );
          },
        },
      ]
    );
  };

  // Show loading state
  if (isLoadingPostpaid) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {t('loan.loading', 'Đang tải thông tin ví trả sau...')}
          </Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (postpaidError) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            {t('loan.loadError', 'Không thể tải thông tin')}
          </Text>
          <Text style={styles.errorMessage}>
            {t('loan.loadErrorMessage', 'Đã có lỗi xảy ra khi tải thông tin ví trả sau. Vui lòng thử lại.')}
          </Text>
          <Text
            style={styles.retryText}
            onPress={() => refetchPostpaid()}
          >
            {t('common:retry', 'Thử lại')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <PostpaidCard
        postpaidData={postpaidResponse?.success ? postpaidResponse.data : undefined}
        isLoading={isLoadingPostpaid}
        onPress={handlePostpaidCardPress}
        onActivatePress={handleActivatePostpaid}
        onReactivatePress={handleReactivatePostpaid}
        isActivationLoading={isRequestingPostpaid}
      />

      {/* <CreditTransactionsList /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    fontSize: 18,

    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  retryText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.primary,
    textAlign: 'center',
  },
  infoSection: {
    marginHorizontal: spacing.sm,
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: spacing.sm,
  },
  infoTitle: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitBullet: {
    fontSize: 16,

    color: colors.primary,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
