import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { ScreenHeader, Text, Button } from '@/shared/components';
import { formatVND } from '@/shared/utils/format';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../hooks/useOrder';
import { OrderDetailSkeleton } from '../components';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Download01Icon, Invoice01Icon, PackageIcon, Share01Icon } from '@hugeicons/core-free-icons';
import PdfViewerModal from '@/features/invoice/components/PdfViewerModal';
import { useDownloadOrderImages, useViewInvoicePdf, useSaveInvoicePdfToGallery } from '@/features/invoice';

type OrderDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

const OrderDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<OrderDetailScreenNavigationProp>();
  const route = useRoute<OrderDetailRouteProp>();
  const { t } = useTranslation('order');

  const { orderId } = route.params;

  // PDF state
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
  const [pdfUri, setPdfUri] = useState<string>('');

  // Fetch order details
  const { data: orderResponse, isLoading, error } = useOrder(orderId, {
    enabled: !!orderId,
  });

  // Hooks for PDF handling - View (downloads and opens modal)
  const viewPdfMutation = useViewInvoicePdf({
    onSuccess: (filePath: string) => {
      console.log('[OrderDetailScreen] PDF ready to view:', filePath);
      setPdfUri(filePath);
      setPdfViewerVisible(true);
    },
    onError: (error: any) => {
      console.error('[OrderDetailScreen] Error viewing PDF:', error);
      Alert.alert(
        t('orderDetail.error', 'Lỗi'),
        t('orderDetail.downloadPdfError', 'Không thể tải hóa đơn. Vui lòng thử lại.')
      );
    },
  });

  // Hooks for image downloading
  const downloadImagesMutation = useDownloadOrderImages({
    onSuccess: (filePaths: string[]) => {
      console.log('[OrderDetailScreen] Images downloaded:', filePaths);
      Alert.alert(
        t('orderDetail.success', 'Thành công'),
        t('orderDetail.downloadImagesSuccess', 'Ảnh đã được tải về thành công')
      );
    },
    onError: (error: any) => {
      console.error('[OrderDetailScreen] Error downloading images:', error);
      Alert.alert(
        t('orderDetail.error', 'Lỗi'),
        t('orderDetail.downloadImagesError', 'Không thể tải ảnh về')
      );
    },
  });

  // Hooks for PDF handling - Save to Gallery
  const saveToGalleryMutation = useSaveInvoicePdfToGallery({
    onSuccess: (result: any) => {
      console.log('[OrderDetailScreen] PDF share completed:', result);
      // Only show success if user actually shared/saved (not cancelled)
      if (!result?.cancelled) {
        Alert.alert(
          t('orderDetail.success', 'Thành công'),
          t('orderDetail.saveToGallerySuccess', 'Hóa đơn đã được chia sẻ/lưu thành công')
        );
      }
    },
    onError: (error: any) => {
      console.error('[OrderDetailScreen] Error sharing PDF:', error);
      // Only show error if it's not user cancellation
      if ((error as Error)?.message !== 'User did not share') {
        Alert.alert(
          t('orderDetail.error', 'Lỗi'),
          t('orderDetail.saveToGalleryError', 'Không thể chia sẻ hóa đơn')
        );
      }
    },
  });

  const order = orderResponse?.data;

  useStatusBarEffect('light', 'dark-content', false);

  // Get status color - Consistent with OrderCard
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return colors.warning;
      case 'PAID':
        return colors.success;
      case 'COMPLETED':
        return colors.success;
      case 'CANCELLED':
        return colors.danger;
      case 'REFUNDED':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  // Get status background color - Consistent with OrderCard
  const getStatusBackgroundColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return colors.warningSoft;
      case 'PAID':
        return colors.successSoft;
      case 'COMPLETED':
        return colors.successSoft;
      case 'CANCELLED':
        return colors.dangerSoft;
      case 'REFUNDED':
        return colors.secondary;
      default:
        return colors.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return t('orderDetail.statusPaid', 'Đã thanh toán');
      case 'PENDING':
        return t('orderDetail.statusPending', 'Đang xử lý');
      case 'CANCELLED':
        return t('orderDetail.statusCancelled', 'Đã hủy');
      case 'REFUNDED':
        return t('orderDetail.statusRefunded', 'Đã hoàn tiền');
      default:
        return status;
    }
  };

  const handleViewInvoice = async () => {
    if (!orderId) {
      Alert.alert(
        t('orderDetail.error', 'Lỗi'),
        t('orderDetail.invalidOrderId', 'Mã đơn hàng không hợp lệ')
      );
      return;
    }

    try {
      // Call view mutation (opens modal on success)
      viewPdfMutation.mutate(orderId);
    } catch (err: any) {
      console.error('[OrderDetailScreen] Error:', err);
      Alert.alert(
        t('orderDetail.error', 'Lỗi'),
        err.message || t('orderDetail.downloadPdfError', 'Không thể tải hóa đơn')
      );
    }
  };

  const handleSaveToGallery = async () => {
    if (!orderId) {
      Alert.alert(
        t('orderDetail.error', 'Lỗi'),
        t('orderDetail.invalidOrderId', 'Mã đơn hàng không hợp lệ')
      );
      return;
    }

    try {
      // Call save to gallery mutation
      saveToGalleryMutation.mutate(orderId);
    } catch (err: any) {
      console.error('[OrderDetailScreen] Error:', err);
      Alert.alert(
        t('orderDetail.error', 'Lỗi'),
        err.message || t('orderDetail.saveToGalleryError', 'Không thể lưu hóa đơn vào thư viện')
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <ScreenHeader title={t('orderDetail.title', 'Chi tiết đơn hàng')} showBack />
        <OrderDetailSkeleton />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>
          {t('orderDetail.loadError', 'Không thể tải thông tin đơn hàng')}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>{t('common.back', 'Quay lại')}</Text>
        </Pressable>
      </View>
    );
  }

  // Use API response values directly
  const subtotal = order.totalAmount || 0; // totalAmount là tổng tiền hàng
  const totalDiscount = order.discountAmount || 0; // discountAmount là tổng giảm giá
  const finalAmount = order.finalAmount || 0; // finalAmount là tổng cộng sau giảm giá

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <ScreenHeader title={t('orderDetail.title', 'Chi tiết đơn hàng')} showBack={true} />
      {/* <BackgroundPattern /> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.headerSection}>
            <View>
              <Text style={styles.orderSequenceLabel}>
                {t('orderDetail.orderId', 'Mã Đơn Hàng')}
              </Text>
              <Text style={styles.orderSequenceText}>
                #{order.orderSequence}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor(order.orderStatus) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.orderStatus) }]}>
                {getStatusLabel(order.orderStatus)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemListSection}>
            {order.items && order.items.length > 0 ? (
              (order.items as any).map((item: any, index: number) => (
                <View key={item.id || index} style={styles.itemContainer}>
                  <View style={styles.productImage}>
                    {item.fileUrls && item.fileUrls.length > 0 ? (
                      <Image
                        source={{ uri: item.fileUrls[0] }}
                        style={styles.productImageContent}
                      />
                    ) : (
                      <HugeiconsIcon icon={PackageIcon} size={24} color={colors.primary} />
                    )}
                  </View>

                  <View style={styles.itemInfoContainer}>
                    <Text style={styles.itemNameText} numberOfLines={2}>
                      {item.name}
                    </Text>

                    <View style={styles.itemDetails}>
                      {item.unit && (
                        <>
                          <Text style={styles.itemDetailsText}>{item.unit}</Text>
                          <View style={styles.itemDetailsSeparator} />
                        </>
                      )}
                      <Text style={styles.itemDetailsText}>
                        {formatVND(item.unitPrice)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemPriceContainer}>
                    <Text style={styles.itemPriceText}>
                      {formatVND(item.finalLineAmount)}
                    </Text>
                    <Text style={styles.itemQuantityText}>
                      x{item.quantity}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>
                {t('orderDetail.noItems', 'Không có mặt hàng nào')}
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.paymentInfoSection}>
            <View style={styles.paymentInfoRow}>
              <Text style={styles.paymentInfoLabel}>
                {t('orderDetail.subtotal', 'Tổng Tiền')}
              </Text>
              <Text style={styles.paymentInfoText}>
                {formatVND(subtotal)}
              </Text>
            </View>

            <View style={styles.paymentInfoRow}>
              <Text style={styles.paymentInfoLabel}>
                {t('orderDetail.discount', 'Giảm Giá')}
              </Text>
              <Text style={styles.paymentInfoText}>
                {totalDiscount > 0 ? `-${formatVND(totalDiscount)}` : formatVND(0)}
              </Text>
            </View>

            <View style={styles.dashedDivider} />

            <View style={styles.paymentInfoRow}>
              <Text style={[styles.paymentInfoLabel, styles.totalLabel]}>
                {t('orderDetail.total', 'Tổng Cộng')}
              </Text>
              <Text style={[styles.paymentInfoText, styles.totalAmount]}>
                {formatVND(finalAmount)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.invoiceButtonsContainer}>
          <Button
            variant="outline"
            onPress={handleSaveToGallery}
            disabled={saveToGalleryMutation.isPending || viewPdfMutation.isPending}
            loading={saveToGalleryMutation.isPending}
            leftIcon={!saveToGalleryMutation.isPending && <HugeiconsIcon icon={Share01Icon} size={20} color={colors.primary} />}
            label={t('orderDetail.saveToGallery', 'Chia sẻ')}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />

          <Button
            variant="primary"
            onPress={handleViewInvoice}
            disabled={saveToGalleryMutation.isPending || viewPdfMutation.isPending}
            loading={viewPdfMutation.isPending}
            leftIcon={!viewPdfMutation.isPending && <HugeiconsIcon icon={Invoice01Icon} size={20} color={colors.light} />}
            label={t('orderDetail.viewInvoice', 'Xem Hóa Đơn')}
            style={styles.primaryButton}
          />
        </View>
      </ScrollView>

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        visible={pdfViewerVisible}
        pdfUri={pdfUri}
        title={`${t('orderDetail.invoicePdf', 'Hóa đơn')} #${order?.orderSequence}`}
        onClose={() => setPdfViewerVisible(false)}
        isLoading={false}
        error={viewPdfMutation.error ? (viewPdfMutation.error as any).message : undefined}
      />
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    // paddingTop: spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: dimensions.radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: colors.text.secondary,
  },
  errorText: {
    ...typography.subtitle,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: dimensions.radius.md,
  },
  retryButtonText: {
    color: colors.light,
    fontSize: dimensions.fontSize.lg,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderSequenceLabel: {
    ...typography.caption,
    marginBottom: 4,
  },
  orderSequenceText: {
    ...typography.h3,
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: dimensions.radius.sm,
  },
  statusText: {
    ...typography.caption,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 1,
    marginVertical: spacing.md,
  },
  itemListSection: {
    // paddingVertical: spacing.sm,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  productImage: {
    width: 36,
    height: 36,
    backgroundColor: colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  productImageContent: {
    width: 36,
    height: 36,
  },
  itemInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemNameText: {
    ...typography.body,
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemDetailsText: {
    ...typography.caption,
    textTransform: 'capitalize',
  },
  itemDetailsSeparator: {
    width: 0.5,
    height: 12,
    backgroundColor: colors.border,
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemPriceText: {
    ...typography.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  itemQuantityText: {
    ...typography.body,
    marginTop: 2,
  },
  noItemsText: {
    ...typography.subtitle,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  paymentInfoSection: {
    // marginTop: spacing.sm,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  paymentInfoLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  paymentInfoText: {
    ...typography.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  totalLabel: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  totalAmount: {
    ...typography.h2, // approx 20-24
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  invoiceButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryButton: {
    flex: 1,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
});

export default OrderDetailScreen;
