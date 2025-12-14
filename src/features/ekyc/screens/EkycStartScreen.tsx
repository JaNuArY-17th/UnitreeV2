
import React, { useState } from 'react';
import { Pressable, StyleSheet, View, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors, spacing } from '@/shared/themes';
import { Heading, Text, Button } from '@/shared/components/base';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { EkycPhotoId } from '@/shared/assets/images/EkycPhotoId';
import { useTranslation } from 'react-i18next';
import { Close } from '@/shared/assets/icons';
import { useEkycCapture } from '../hooks/useEkycCapture';
import { useEkycAvailability } from '../hooks/useEkyc';
import type { EkycType } from '../types/ekyc';
import { useAlert } from '@/shared/providers/AlertProvider';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import type { AlertButton } from '@/shared/components/CustomAlert';

export type EkycNav = NativeStackNavigationProp<RootStackParamList, 'Ekyc'>;

const EkycScreen: React.FC = () => {
  const navigation = useNavigation<EkycNav>();
  const { t } = useTranslation('ekyc');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  // eKYC hooks
  const { handleCapture } = useEkycCapture();
  const { checkAvailability } = useEkycAvailability();

  const onContinue = async () => {
    if (isProcessing) return;

    // Check SDK availability
    if (!checkAvailability()) {
      showAlert({
        title: t('error.sdkUnavailable', 'SDK không khả dụng'),
        message: t('error.sdkUnavailableMessage', 'SDK eKYC không được tìm thấy hoặc không được hỗ trợ trên thiết bị này.'),
        buttons: [{ text: t('common.close', 'Đóng') }]
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('[EkycStartScreen] Starting eKYC capture process');

      // Start eKYC SDK directly
      await handleCapture('full' as EkycType);

      console.log('[EkycStartScreen] eKYC capture completed successfully');
      // Navigation will be handled automatically by useEkycCapture hook
      // The hook will navigate to UserInfoScreen when capture is successful
    } catch (error: any) {
      console.error('[EkycStartScreen] eKYC Error:', error);

      // Determine error type and show appropriate message
      let title = t('error.verificationError', 'Lỗi xác minh');
      let message = t('error.genericError', 'Đã xảy ra lỗi trong quá trình xác minh. Vui lòng thử lại.');
      let buttons: AlertButton[] = [
        {
          text: t('common.retry', 'Thử lại'),
          onPress: () => setIsProcessing(false),
        },
        {
          text: t('common.cancel', 'Hủy'),
          onPress: () => navigation.goBack(),
        },
      ];

      // Handle specific error cases
      if (error.message) {
        const errorMsg = error.message.toLowerCase();

        if (errorMsg.includes('cancel') || errorMsg.includes('user_cancel')) {
          title = t('error.cancelled', 'Đã hủy');
          message = t('error.userCancelled', 'Bạn đã hủy quá trình xác minh.');
          buttons = [{ text: t('common.ok', 'OK') }];
        } else if (errorMsg.includes('timeout') || errorMsg.includes('time_out')) {
          title = t('error.timeout', 'Hết thời gian');
          message = t('error.timeoutMessage', 'Quá trình xác minh đã hết thời gian. Vui lòng thử lại.');
        } else if (errorMsg.includes('permission')) {
          title = t('error.permission', 'Thiếu quyền truy cập');
          message = t('error.permissionMessage', 'Ứng dụng cần quyền truy cập camera để thực hiện xác minh.');
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          title = t('error.network', 'Lỗi kết nối');
          message = t('error.networkMessage', 'Kiểm tra kết nối mạng và thử lại.');
        } else if (errorMsg.includes('expired') || errorMsg.includes('document has expired')) {
          title = t('error.documentExpired', 'Giấy tờ đã hết hạn');
          message = t('error.documentExpiredMessage', 'Giấy tờ của bạn đã hết hạn. Vui lòng sử dụng giấy tờ còn hiệu lực để thực hiện xác minh.');
          buttons = [
            {
              text: t('common.retry', 'Thử lại'),
              onPress: () => setIsProcessing(false),
            },
            {
              text: t('common.cancel', 'Hủy'),
              onPress: () => navigation.goBack(),
            },
          ];
        } else if (errorMsg.includes('validation failed') || errorMsg.includes('comprehensive validation')) {
          title = t('error.validationFailed', 'Xác thực thất bại');
          message = t('error.validationFailedMessage', 'Giấy tờ không đạt yêu cầu xác thực. Vui lòng kiểm tra lại giấy tờ và thử lại.');
          buttons = [
            {
              text: t('common.retry', 'Thử lại'),
              onPress: () => setIsProcessing(false),
            },
            {
              text: t('common.cancel', 'Hủy'),
              onPress: () => navigation.goBack(),
            },
          ];
        } else if (errorMsg.includes('detected as fake') ||
          errorMsg.includes('fake liveness') ||
          errorMsg.includes('high fake') ||
          errorMsg.includes('fake document') ||
          errorMsg.includes('forged document')) {
          title = t('error.fakeDocument', 'Giấy tờ không hợp lệ');
          message = t('error.fakeDocumentMessage', 'Hệ thống phát hiện giấy tờ có thể không hợp lệ hoặc bị giả mạo. Vui lòng sử dụng giấy tờ chính thức.');
          buttons = [
            {
              text: t('common.retry', 'Thử lại'),
              onPress: () => setIsProcessing(false),
            },
            {
              text: t('common.cancel', 'Hủy'),
              onPress: () => navigation.goBack(),
            },
          ];
        } else if (errorMsg.includes('wearing a mask') ||
          errorMsg.includes('mask detected') ||
          errorMsg.includes('liveness check failed') ||
          errorMsg.includes('not a real person') ||
          errorMsg.includes('spoof') ||
          errorMsg.includes('presentation attack')) {
          title = t('error.livenessCheckFailed', 'Kiểm tra sống thất bại');
          message = t('error.livenessCheckFailedMessage', 'Vui lòng tháo khẩu trang, đảm bảo khuôn mặt hiện rõ và thử lại.');
          buttons = [
            {
              text: t('common.retry', 'Thử lại'),
              onPress: () => setIsProcessing(false),
            },
            {
              text: t('common.cancel', 'Hủy'),
              onPress: () => navigation.goBack(),
            },
          ];
        } else {
          // Use the original error message if available
          message = error.message;
        }
      }

      showAlert({ title, message, buttons });
    } finally {
      setIsProcessing(false);
    }
  };

  const onClose = () => navigation.goBack();

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <ScreenHeader />
      <View style={styles.content}>
        <View style={styles.illustrationWrap}>
          <EkycPhotoId width={200} height={200} />
        </View>

        <View style={styles.texts}>
          <Heading style={styles.title}>{t('title')}</Heading>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>
        </View>

        <View style={styles.cta}>
          <Button
            label={isProcessing ? t('processing', 'Đang xử lý...') : t('continue')}
            size="lg"
            onPress={onContinue}
            disabled={isProcessing}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light, },
  content: { flexDirection: 'column', justifyContent: 'center', height: '100%', paddingBottom: spacing.xxl * 5 },
  illustrationWrap: { alignItems: 'center' },
  illustration: { width: 200, height: 200 },
  texts: { alignItems: 'center', marginHorizontal: spacing.lg },
  title: { textAlign: 'center', marginTop: spacing.xl },
  subtitle: { textAlign: 'center', color: colors.text.secondary, marginTop: spacing.md },
  cta: { marginTop: spacing.xl, paddingBottom: spacing.md, paddingHorizontal: spacing.xxl },
});

export default EkycScreen;
