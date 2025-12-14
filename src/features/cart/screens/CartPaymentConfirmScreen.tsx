import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { BackgroundPatternSolid, ScreenHeader } from '@/shared/components';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { ExportIcon } from '@/shared/assets';
import { SuccessIcon } from '@/shared/components/icons';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { formatVND } from '@/shared/utils/format';
import type { CartItem } from '../types';
import { QRCodeDisplay } from '@/features/payment/components';

type CartPaymentConfirmScreenProp = NativeStackNavigationProp<RootStackParamList, 'CartPaymentConfirm'>;
type CartPaymentConfirmRouteProp = RouteProp<RootStackParamList, 'CartPaymentConfirm'>;

const CartPaymentConfirmScreen: React.FC = () => {
  const { t } = useTranslation('cart');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CartPaymentConfirmScreenProp>();
  const route = useRoute<CartPaymentConfirmRouteProp>();
  const viewShotRef = useRef<ViewShot>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Get route params
  const { cartItems, totalAmount, discount, paymentMethod, orderData } = route.params || {};

  // State for payment confirmation
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const autoNavigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // WebSocket connection for payment notification
  useEffect(() => {
    if (!orderData?.websocketUrl || !orderData?.websocketPayload) {
      console.warn('⚠️ [CartPaymentConfirm] No websocket URL or payload provided');
      return;
    }

    console.log('🔌 [CartPaymentConfirm] Connecting to websocket:', orderData.websocketUrl);
    console.log('🔑 [CartPaymentConfirm] Websocket payload:', orderData.websocketPayload);

    // Create WebSocket connection
    const ws = new WebSocket(orderData.websocketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ [CartPaymentConfirm] WebSocket connected');
      setWsConnected(true);

      // Send subscribe message with orderId using websocketPayload
      console.log('📤 [CartPaymentConfirm] Sending subscribe message:', orderData.websocketPayload);
      ws.send(orderData.websocketPayload);
    };

    ws.onmessage = (event) => {
      console.log('📨 [CartPaymentConfirm] WebSocket message received:', event.data);

      try {
        // Check for payment_success in raw string first (most reliable)
        const rawData = event.data;
        if (typeof rawData === 'string' && rawData.includes('payment_success') && rawData.includes('status=COMPLETED')) {
          console.log('✅ [CartPaymentConfirm] Payment success detected in raw data!');
          setIsPaymentConfirmed(true);
          setShowSuccessModal(true);

          // Close WebSocket connection
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log('🔌 [CartPaymentConfirm] Closing WebSocket after payment success');
            wsRef.current.close();
          }

          // Auto navigate to Home after 5 seconds
          autoNavigateTimerRef.current = setTimeout(() => {
            console.log('🏠 [CartPaymentConfirm] Auto-navigating to Home...');
            setShowSuccessModal(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
            });
          }, 5000);
          return;
        }

        // Try to parse as JSON
        let message;
        try {
          message = JSON.parse(event.data);
          console.log('📋 [CartPaymentConfirm] JSON Message type:', message.type);
        } catch {
          // If not JSON, handle as pipe-delimited text
          const parts = event.data.split('|');
          if (parts.length >= 2) {
            console.log('📋 [CartPaymentConfirm] Text Message parts:', parts);

            // Handle subscription confirmation: "my-secret-key|subscribed|pos-payment|orderId"
            if (parts[1] === 'subscribed') {
              console.log('✅ [CartPaymentConfirm] Subscribed to payment notifications for order:', parts[3]);
              return;
            }

            // Handle payment success: "my-secret-key|payment|success|orderId"
            if (parts[1] === 'payment' && parts[2] === 'success') {
              console.log('✅ [CartPaymentConfirm] Payment confirmed via text message!');
              message = { type: 'payment', status: 'success' };
            }
          }
        }

        // Handle JSON messages
        if (message) {
          // Handle connection confirmation
          if (message.type === 'connection' && message.status === 'connected') {
            console.log('🔗 [CartPaymentConfirm] Connection confirmed, waiting for payment notification...');
            return;
          }

          // Handle subscription confirmation (JSON format)
          if (message.type === 'subscription' && message.status === 'subscribed') {
            console.log('✅ [CartPaymentConfirm] Subscribed to payment notifications (JSON)');
            return;
          }

          // Check if payment was successful (legacy format)
          if (message.type === 'payment' && message.status === 'success') {
            console.log('✅ [CartPaymentConfirm] Payment confirmed! Showing success modal...');
            setIsPaymentConfirmed(true);
            setShowSuccessModal(true);

            // Close WebSocket connection
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              console.log('🔌 [CartPaymentConfirm] Closing WebSocket after payment success');
              wsRef.current.close();
            }

            // Auto navigate to Home after 5 seconds
            autoNavigateTimerRef.current = setTimeout(() => {
              console.log('🏠 [CartPaymentConfirm] Auto-navigating to Home...');
              setShowSuccessModal(false);
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
              });
            }, 5000);
          }
        }
      } catch (error) {
        console.error('❌ [CartPaymentConfirm] Failed to process websocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ [CartPaymentConfirm] WebSocket error:', error);
      setWsConnected(false);
    };

    ws.onclose = (event) => {
      console.log('🔌 [CartPaymentConfirm] WebSocket closed:', event.code, event.reason);
      setWsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        console.log('🔌 [CartPaymentConfirm] Closing WebSocket connection');
        ws.close();
      }
      if (autoNavigateTimerRef.current) {
        clearTimeout(autoNavigateTimerRef.current);
      }
    };
  }, [orderData?.websocketUrl, orderData?.websocketPayload, orderData?.id, orderData?.orderSequence, totalAmount, cartItems?.length, navigation]);

  useStatusBarEffect('transparent', 'light-content', true);

  const handleBack = () => {
    // Warn user if payment is not confirmed yet
    if (!isPaymentConfirmed) {
      Alert.alert(
        t('paymentConfirm.cancelWarning.title', 'Cancel Payment?'),
        t('paymentConfirm.cancelWarning.message', 'Payment has not been confirmed yet. Are you sure you want to go back?'),
        [
          {
            text: t('common.cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: t('common.confirm', 'Confirm'),
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const captureScreen = async (): Promise<string | null> => {
    try {
      if (!viewShotRef.current?.capture) {
        Alert.alert(t('common.error', 'Error'), 'Unable to capture screen');
        return null;
      }

      const uri = await viewShotRef.current.capture();
      console.log('📸 [CartPaymentConfirm] Screen captured:', uri);
      return uri;
    } catch (error) {
      console.error('❌ [CartPaymentConfirm] Screen capture failed:', error);
      Alert.alert(t('common.error', 'Error'), 'Failed to capture screen');
      return null;
    }
  };

  const handleDownload = async () => {
    try {
      const imageUri = await captureScreen();
      if (!imageUri) return;

      const result = await CameraRoll.save(imageUri, {
        type: 'photo',
        album: 'ENSOGO ESPay',
      });

      Alert.alert(
        t('paymentConfirm.download.success', 'Success'),
        t('paymentConfirm.download.savedToLibrary', 'QR code saved to photo library')
      );

      console.log('💾 [CartPaymentConfirm] QR code saved:', result);
    } catch (error) {
      console.error('❌ [CartPaymentConfirm] Download failed:', error);
      Alert.alert(t('common.error', 'Error'), 'Failed to save QR code');
    }
  };

  const handlePromotionPress = () => {
    // Optional: Handle promotion press
    console.log('Promotion pressed');
  };

  const handleCloseSuccessModal = () => {
    if (autoNavigateTimerRef.current) {
      clearTimeout(autoNavigateTimerRef.current);
    }
    setShowSuccessModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  // Show loading if no order data
  if (!orderData || !orderData.paymentInfo?.qrDataURL) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" />
        <BackgroundPatternSolid backgroundColor={colors.primary} patternColor={colors.light} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.light} />
          <Text style={styles.loadingText}>
            {t('paymentConfirm.loading', 'Loading payment information...')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.outerContainer}>
        <ViewShot
          ref={viewShotRef}
          options={{
            format: 'png',
            quality: 1,
            result: 'tmpfile',
          }}
          style={[styles.container, { paddingTop: insets.top }]}
        >
          <StatusBar barStyle="light-content" backgroundColor="transparent" />
          <BackgroundPatternSolid backgroundColor={colors.primary} patternColor={colors.light} />

          {/* Header */}
          <ScreenHeader
            title={t('paymentConfirm.title', 'Payment Confirmation')}
            showBack={true}
            onBackPress={handleBack}
            backIconColor={colors.light}
            titleStyle={{ color: colors.light }}
            actions={[
              {
                key: 'download',
                icon: <ExportIcon width={24} height={24} color={colors.light} />,
                onPress: handleDownload,
              },
            ]}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >


            {/* QR Code Display - Use order payment info */}
            <QRCodeDisplay
              qrData={{
                qrCode: orderData.paymentInfo.qrCode,
                qrDataURL: orderData.paymentInfo.qrDataURL,
                amount: totalAmount,
                merchantName: orderData.orderSequence || 'Order',
                description: orderData.paymentInfo.qrContent || '',
              }}
              isLoading={false}
              onRefresh={() => {
                // Optionally implement refresh logic
                console.log('QR refresh requested');
              }}
              onPromotionPress={handlePromotionPress}
            />

            {/* Product List */}
            <View style={styles.productListSection}>
              <Text style={styles.productListTitle}>
                {t('paymentConfirm.productList', 'Product List')}
              </Text>

              <View style={styles.productList}>
                {cartItems?.map((item: CartItem, index: number) => (
                  <View key={item.id} style={styles.productItem}>
                    <View style={styles.productInfo}>
                      <View style={styles.productAvatar}>
                        <Text style={styles.productAvatarText}>
                          {item.abbreviation || item.name.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.productDetails}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.productQuantity}>
                          {t('paymentConfirm.quantity', 'Qty')}: {item.quantity} {item.unit || ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.productPriceContainer}>
                      <Text style={styles.productPrice}>
                        {formatVND(item.price * item.quantity)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Summary */}
              <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {t('summary.total', 'Total')}:
                  </Text>
                  <Text style={styles.summaryValue}>
                    {formatVND(totalAmount + (discount || 0))}
                  </Text>
                </View>

                {discount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      {t('summary.discount', 'Discount')}:
                    </Text>
                    <Text style={[styles.summaryValue, styles.discountValue]}>
                      -{formatVND(discount)}
                    </Text>
                  </View>
                )}

                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>
                    {t('paymentConfirm.totalAmount', 'Total Amount')}:
                  </Text>
                  <Text style={styles.totalValue}>
                    {formatVND(totalAmount)}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </ViewShot>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <SuccessIcon width={80} height={80} />
            </View>

            <Text style={styles.successTitle}>
              {t('paymentConfirm.success.title', 'Thanh toán thành công!')}
            </Text>

            <Text style={styles.successMessage}>
              {t('paymentConfirm.success.message', 'Giao dịch của bạn đã được xử lý thành công.')}
            </Text>

            <Text style={styles.successSubMessage}>
              {t('paymentConfirm.success.redirecting', 'Tự động quay về Trang chủ sau 5 giây...')}
            </Text>

            <Pressable
              style={styles.successButton}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.successButtonText}>
                {t('paymentConfirm.success.goHomeNow', 'Về Trang chủ ngay')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.light,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.md,
    backgroundColor: colors.light + '20',
    borderRadius: dimensions.radius.lg,
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusConnected: {
    backgroundColor: colors.success,
  },
  statusDisconnected: {
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    color: colors.light,
  },
  productListSection: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.xxl, // spacing.sm (8) + spacing.lg (16) = 24 (spacing.xxl)
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.xl,
    padding: spacing.lg,
  },
  productListTitle: {
    fontSize: dimensions.fontSize.lg,

    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  productList: {
    gap: spacing.sm,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: dimensions.radius.lg,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  productAvatarText: {
    fontSize: 14,

    color: colors.primary,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  productQuantity: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
  productPriceContainer: {
    marginLeft: spacing.sm,
  },
  productPrice: {
    fontSize: 16,

    color: colors.primary,
  },
  summarySection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
  },
  discountValue: {
    color: colors.success,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,

    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 20,

    color: colors.primary,
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successModalContent: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  successIconContainer: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,

    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubMessage: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  successButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: dimensions.radius.lg,
    width: '100%',
  },
  successButtonText: {
    fontSize: 16,

    color: colors.light,
    textAlign: 'center',
  },
});

export default CartPaymentConfirmScreen;
