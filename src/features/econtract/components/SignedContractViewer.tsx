import React, { useState, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, Modal, StatusBar, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import Pdf from 'react-native-pdf';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ZoomOutAreaIcon,
  ZoomInAreaIcon,
  Maximize01Icon,
  CancelCircleIcon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { theme, colors } from '@/shared/themes';
import { styles } from '../styles';
import { PdfSource } from '../types';
import { BANK_QUERY_KEYS } from '@/features/deposit/hooks/useBankAccount';
import { ACCOUNT_QUERY_KEYS } from '@/features/account/hooks/usePostpaid';
import { STORE_QUERY_KEYS } from '@/features/authentication/hooks/useStoreData';
import { bankTypeManager } from '@/features/deposit/utils/bankTypeManager';

interface SignedContractViewerProps {
  isDownloadingSignedPdf: boolean;
  signedPdfDownloadProgress: number;
  signedPdfSource: PdfSource | null;
  onConfirmSigned: () => void;
}

export const SignedContractViewer: React.FC<SignedContractViewerProps> = ({
  isDownloadingSignedPdf,
  signedPdfDownloadProgress,
  signedPdfSource,
  onConfirmSigned,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const pdfRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Zoom limits
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3.0;
  const SCALE_STEP = 0.25;

  // Xử lý chuyển trang
  const goToFirstPage = () => {
    if (pdfRef.current) {
      pdfRef.current.setPage(1);
    }
  };

  const goToPreviousPage = () => {
    if (pdfRef.current && currentPage > 1) {
      pdfRef.current.setPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (pdfRef.current && currentPage < totalPages) {
      pdfRef.current.setPage(currentPage + 1);
    }
  };

  const goToLastPage = () => {
    if (pdfRef.current && totalPages > 0) {
      pdfRef.current.setPage(totalPages);
    }
  };

  // Xử lý thu phóng
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + SCALE_STEP, MAX_SCALE));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - SCALE_STEP, MIN_SCALE));
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (isDownloadingSignedPdf) {
    return (
      <View style={styles.downloadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.downloadingText}>
          {t('econtract.downloadingSigned', 'Đang tải file hợp đồng đã ký...')} ({signedPdfDownloadProgress.toFixed(0)}%)
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${signedPdfDownloadProgress}%` }]} />
        </View>
      </View>
    );
  }

  if (!signedPdfSource) {
    return (
      <Text style={styles.noPdfText}>
        {t('econtract.noSignedPdf', 'Không tìm thấy hợp đồng đã ký.')}
      </Text>
    );
  }

  return (
    <View style={styles.pdfViewerContainer}>
      {/* PDF Viewer */}
      <Pdf
        ref={pdfRef}
        source={signedPdfSource}
        style={styles.pdf}
        onLoadComplete={(_numberOfPages, _filePath) => {
          try {
            console.log(`[SignedPDF onLoadComplete] PDF loaded: ${_numberOfPages} pages from file: ${_filePath}`);
            console.log(`[SignedPDF onLoadComplete] Current totalPages state before update: ${totalPages}`);
            if (_numberOfPages && _numberOfPages > 0) {
              setTotalPages(_numberOfPages);
              console.log(`[SignedPDF onLoadComplete] ✅ Total pages set to: ${_numberOfPages}`);
            } else {
              console.warn('[SignedPDF onLoadComplete] Invalid numberOfPages:', _numberOfPages);
              // Set default to 1 if numberOfPages is invalid
              setTotalPages(1);
              console.log('[SignedPDF onLoadComplete] ⚠️ Total pages fallback set to: 1');
            }
          } catch (error) {
            console.warn('[SignedPDF onLoadComplete] Error:', error);
            // Fallback to 1 page if there's an error
            setTotalPages(1);
            console.log('[SignedPDF onLoadComplete] ❌ Total pages error fallback set to: 1');
          }
        }}
        onError={(error) => {
          console.error('Signed PDF error:', error);
          // Don't show alert immediately to prevent crashes
          setTimeout(() => {
            Alert.alert(
              t('common.error', 'Lỗi'),
              t('econtract.pdfLoadError', 'Không thể tải file PDF. Vui lòng thử lại sau.')
            );
          }, 100);
        }}
        onPageChanged={(page, _numberOfPages) => {
          try {
            console.log(`[SignedPDF onPageChanged] Page changed: ${page} of ${_numberOfPages}`);
            console.log(`[SignedPDF onPageChanged] Current totalPages state: ${totalPages}`);
            setCurrentPage(page);

            // Update totalPages if it's still 0 and we have valid numberOfPages
            if (totalPages === 0 && _numberOfPages && _numberOfPages > 0) {
              console.log(`[SignedPDF onPageChanged] 🔄 Updating totalPages from 0 to: ${_numberOfPages}`);
              setTotalPages(_numberOfPages);
            } else if (_numberOfPages && _numberOfPages > 0 && _numberOfPages !== totalPages) {
              console.warn(`[SignedPDF onPageChanged] ⚠️ Page count mismatch: callback says ${_numberOfPages}, state says ${totalPages}`);
              // If callback has a larger page count, trust it (PDF might have loaded more pages)
              if (_numberOfPages > totalPages) {
                console.log(`[SignedPDF onPageChanged] 🔄 Updating totalPages from ${totalPages} to ${_numberOfPages} (callback has larger count)`);
                setTotalPages(_numberOfPages);
              }
            }
          } catch (error) {
            console.warn('[SignedPDF onPageChanged] Error:', error);
          }
        }}
        trustAllCerts={true}
        enablePaging={true}
        enableAntialiasing={true}
        enableAnnotationRendering={false}
        fitPolicy={2}
        minScale={0.5}
        maxScale={3.0}
        scale={scale}
        spacing={-10}
        horizontal={false}
        password={undefined}
        renderActivityIndicator={() => (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        )}
      />

      {/* Thanh điều hướng trang */}
      {/* <View style={localStyles.paginationContainer}>
        <View style={localStyles.paginationControls}>
          <TouchableOpacity
            style={[localStyles.controlButton, currentPage === 1 && localStyles.controlButtonDisabled]}
            onPress={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={20} color={currentPage === 1 ? colors.text.secondary : colors.text.primary} />
          </TouchableOpacity>

          <View style={localStyles.pageIndicator}>
            <Text style={localStyles.pageIndicatorText}>
              {currentPage} / {totalPages}
            </Text>
          </View>

          <TouchableOpacity
            style={[localStyles.controlButton, currentPage === totalPages && localStyles.controlButtonDisabled]}
            onPress={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <HugeiconsIcon icon={ArrowRight02Icon} size={20} color={currentPage === totalPages ? colors.text.secondary : colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={localStyles.zoomControls}>
          <TouchableOpacity
            style={[localStyles.controlButton, scale <= MIN_SCALE && localStyles.controlButtonDisabled]}
            onPress={zoomOut}
            disabled={scale <= MIN_SCALE}
          >
            <HugeiconsIcon icon={ZoomOutAreaIcon} size={20} color={scale <= MIN_SCALE ? colors.text.secondary : colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[localStyles.controlButton, scale >= MAX_SCALE && localStyles.controlButtonDisabled]}
            onPress={zoomIn}
            disabled={scale >= MAX_SCALE}
          >
            <HugeiconsIcon icon={ZoomInAreaIcon} size={20} color={scale >= MAX_SCALE ? colors.text.secondary : colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={localStyles.controlButton}
            onPress={toggleFullScreen}
          >
            <HugeiconsIcon icon={Maximize01Icon} size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Nút xác nhận đã xem và hoàn tất quá trình */}
      <View style={styles.signedActionsContainer}>
        <TouchableOpacity
          style={styles.confirmSignedButton}
          onPress={async () => {
            try {
              // First call the original onConfirmSigned callback
              onConfirmSigned();

              // Then refresh bank and postpaid data like in login flow
              console.log('[SignedContractViewer] Refreshing bank and postpaid data after contract confirmation');

              // Get current bank type
              const currentBankType = await bankTypeManager.getBankType();

              // Invalidate bank account data
              if (currentBankType) {
                await queryClient.invalidateQueries({
                  queryKey: BANK_QUERY_KEYS.account(currentBankType)
                });
                console.log(`[SignedContractViewer] Invalidated bank account data for bankType: ${currentBankType}`);
              }

              // Invalidate postpaid data
              await queryClient.invalidateQueries({
                queryKey: ACCOUNT_QUERY_KEYS.POSTPAID
              });
              console.log('[SignedContractViewer] Invalidated postpaid data');

              // Invalidate hasStore data
              await queryClient.invalidateQueries({
                queryKey: STORE_QUERY_KEYS.hasStore()
              });
              console.log('[SignedContractViewer] Invalidated hasStore data');

              // Refetch the queries to get fresh data
              if (currentBankType) {
                await queryClient.refetchQueries({
                  queryKey: BANK_QUERY_KEYS.account(currentBankType)
                });
              }
              await queryClient.refetchQueries({
                queryKey: ACCOUNT_QUERY_KEYS.POSTPAID
              });

              await queryClient.refetchQueries({
                queryKey: STORE_QUERY_KEYS.hasStore()
              });

              console.log('[SignedContractViewer] Bank and postpaid data refresh completed');
            } catch (error) {
              console.error('[SignedContractViewer] Error refreshing data after contract confirmation:', error);
            }
          }}
        >
          <HugeiconsIcon icon={Tick02Icon} size={20} color={theme.colors.light} />
          <Text style={styles.confirmSignedText}>
            {t('econtract.confirmAndComplete', 'Xác nhận và hoàn tất')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullScreen}
        animationType="fade"
        onRequestClose={() => setIsFullScreen(false)}
        statusBarTranslucent
      >
        <View style={localStyles.fullscreenContainer}>
          <StatusBar hidden={true} />
          <ScreenHeader
            title={`${t('econtract.page', 'Trang')} ${currentPage}/${totalPages}`}
            showBack={false}
            transparent={true}
            backIconColor={colors.light}
            actions={[
              {
                key: 'close',
                icon: <HugeiconsIcon icon={CancelCircleIcon} size={24} color={colors.light} />,
                onPress: () => setIsFullScreen(false),
                accessibilityLabel: t('common.close', 'Đóng'),
              },
            ]}
          />
          <Pdf
            ref={pdfRef}
            source={signedPdfSource!}
            style={localStyles.fullscreenPdf}
            onPageChanged={(page) => setCurrentPage(page)}
            trustAllCerts={true}
            enablePaging={true}
            enableAntialiasing={true}
            enableAnnotationRendering={false}
            fitPolicy={2}
            minScale={MIN_SCALE}
            maxScale={MAX_SCALE}
            scale={scale}
            spacing={-10}
            horizontal={false}
            password={undefined}
            renderActivityIndicator={() => (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            )}
          />
          <View style={localStyles.fullscreenControls}>
            <View style={localStyles.fullscreenNavigation}>
              <TouchableOpacity
                style={[localStyles.fullscreenButton, currentPage === 1 && localStyles.controlButtonDisabled]}
                onPress={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={colors.light} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[localStyles.fullscreenButton, currentPage === totalPages && localStyles.controlButtonDisabled]}
                onPress={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <HugeiconsIcon icon={ArrowRight02Icon} size={24} color={colors.light} />
              </TouchableOpacity>
            </View>
            <View style={localStyles.fullscreenZoom}>
              <TouchableOpacity
                style={[localStyles.fullscreenButton, scale <= MIN_SCALE && localStyles.controlButtonDisabled]}
                onPress={zoomOut}
                disabled={scale <= MIN_SCALE}
              >
                <HugeiconsIcon icon={ZoomOutAreaIcon} size={24} color={colors.light} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[localStyles.fullscreenButton, scale >= MAX_SCALE && localStyles.controlButtonDisabled]}
                onPress={zoomIn}
                disabled={scale >= MAX_SCALE}
              >
                <HugeiconsIcon icon={ZoomInAreaIcon} size={24} color={colors.light} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const localStyles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: theme.dimensions.radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlButtonDisabled: {
    backgroundColor: colors.background,
    opacity: 0.4,
  },
  pageIndicator: {
    paddingHorizontal: theme.spacing.md,
    minWidth: 80,
    alignItems: 'center',
  },
  pageIndicatorText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenPdf: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  fullscreenNavigation: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  fullscreenZoom: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  fullscreenButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
