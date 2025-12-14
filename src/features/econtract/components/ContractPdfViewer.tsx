import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

// Import PDF component with error handling
import Pdf from 'react-native-pdf';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ZoomOutAreaIcon,
  ZoomInAreaIcon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
} from '@hugeicons/core-free-icons';
import { theme, colors } from '@shared/themes';
import { styles } from '../styles';
import { PdfSource } from '../types';
import { NativeModuleErrorBoundary } from '@shared/components/NativeModuleErrorBoundary';
import { SimplePdfViewer } from './SimplePdfViewer';

interface ContractPdfViewerProps {
  isDownloading: boolean;
  downloadProgress: number;
  pdfSource: PdfSource | null;
}

export const ContractPdfViewer: React.FC<ContractPdfViewerProps> = ({
  isDownloading,
  downloadProgress,
  pdfSource,
}) => {
  const { t } = useTranslation();
  const pdfRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.25);

  // Zoom limits
  const MIN_SCALE = 1.0;
  const MAX_SCALE = 2.0;
  const SCALE_STEP = 0.25;

  // Debug effect to track states
  useEffect(() => {
    console.log(`[ContractPdfViewer] State updated - currentPage: ${currentPage}, totalPages: ${totalPages}, pdfSource:`, pdfSource ? 'loaded' : 'null');
  }, [currentPage, totalPages, pdfSource]);

  // Reset pages when PDF source changes
  useEffect(() => {
    if (pdfSource) {
      console.log('[ContractPdfViewer] PDF source changed, resetting page states');
      setCurrentPage(1);
      setTotalPages(0);

      // Set a timeout to fallback to 1 page if onLoadComplete never fires
      const fallbackTimeout = setTimeout(() => {
        setTotalPages((currentTotalPages) => {
          if (currentTotalPages === 0) {
            console.warn('[ContractPdfViewer] onLoadComplete timeout, setting fallback totalPages to 1');
            return 1;
          }
          // Don't override if totalPages has already been set
          console.log(`[ContractPdfViewer] Timeout fired but totalPages already set to ${currentTotalPages}, keeping current value`);
          return currentTotalPages;
        });
      }, 5000); // 5 second timeout

      return () => clearTimeout(fallbackTimeout);
    }
  }, [pdfSource]);

  // Xử lý chuyển trang
  const goToPreviousPage = () => {
    if (pdfRef.current && currentPage > 1 && totalPages > 0) {
      pdfRef.current.setPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (pdfRef.current && currentPage < totalPages && totalPages > 0) {
      pdfRef.current.setPage(currentPage + 1);
    }
  };

  // Xử lý thu phóng
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + SCALE_STEP, MAX_SCALE));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - SCALE_STEP, MIN_SCALE));
  };

  if (isDownloading) {
    return (
      <View style={styles.downloadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.downloadingText}>
          {t('econtract.downloading', 'Đang tải file PDF...')} ({downloadProgress.toFixed(0)}%)
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${downloadProgress}%` }]} />
        </View>
      </View>
    );
  }

  if (!pdfSource) {
    return (
      <Text style={styles.noPdfText}>
        {t('econtract.noPdf', 'Không có tài liệu để hiển thị')}
      </Text>
    );
  }


  return (
    <NativeModuleErrorBoundary
      fallbackComponent={
        <SimplePdfViewer
          isDownloading={isDownloading}
          downloadProgress={downloadProgress}
          pdfSource={pdfSource}
        />
      }
      onError={(error, errorInfo) => {
        console.warn('ContractPdfViewer native module error, falling back to WebView:', error);
      }}
    >
      <View style={styles.pdfViewerContainer}>
        {/* Toolbar with pagination and zoom controls */}
        <View style={localStyles.paginationContainer}>
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
          </View>
        </View>

        {/* PDF Viewer */}
        <Pdf
          ref={pdfRef}
          source={pdfSource}
          style={styles.pdf}
          onLoadComplete={(_numberOfPages, _filePath) => {
            try {
              console.log(`[ContractPDF onLoadComplete] PDF loaded: ${_numberOfPages} pages from file: ${_filePath}`);
              console.log(`[ContractPDF onLoadComplete] Current totalPages state before update: ${totalPages}`);
              if (_numberOfPages && _numberOfPages > 0) {
                setTotalPages(_numberOfPages);
                console.log(`[ContractPDF onLoadComplete] ✅ Total pages set to: ${_numberOfPages}`);
              } else {
                console.warn('[ContractPDF onLoadComplete] Invalid numberOfPages:', _numberOfPages);
                // Set default to 1 if numberOfPages is invalid
                setTotalPages(1);
                console.log('[ContractPDF onLoadComplete] ⚠️ Total pages fallback set to: 1');
              }
            } catch (error) {
              console.warn('[ContractPDF onLoadComplete] Error:', error);
              // Fallback to 1 page if there's an error
              setTotalPages(1);
              console.log('[ContractPDF onLoadComplete] ❌ Total pages error fallback set to: 1');
            }
          }}
          onError={(error) => {
            console.error('Contract PDF error:', error);
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
              console.log(`[ContractPDF onPageChanged] Page changed: ${page} of ${_numberOfPages}`);
              console.log(`[ContractPDF onPageChanged] Current totalPages state: ${totalPages}`);
              setCurrentPage(page);

              // Update totalPages if it's still 0 and we have valid numberOfPages
              if (totalPages === 0 && _numberOfPages && _numberOfPages > 0) {
                console.log(`[ContractPDF onPageChanged] 🔄 Updating totalPages from 0 to: ${_numberOfPages}`);
                setTotalPages(_numberOfPages);
              } else if (_numberOfPages && _numberOfPages > 0 && _numberOfPages !== totalPages) {
                console.warn(`[ContractPDF onPageChanged] ⚠️ Page count mismatch: callback says ${_numberOfPages}, state says ${totalPages}`);
                // If callback has a larger page count, trust it (PDF might have loaded more pages)
                if (_numberOfPages > totalPages) {
                  console.log(`[ContractPDF onPageChanged] 🔄 Updating totalPages from ${totalPages} to ${_numberOfPages} (callback has larger count)`);
                  setTotalPages(_numberOfPages);
                }
              }
            } catch (error) {
              console.warn('[ContractPDF onPageChanged] Error:', error);
            }
          }}
          trustAllCerts={true}
          enablePaging={true}
          enableAntialiasing={true}
          enableAnnotationRendering={false}
          fitPolicy={0}
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
      </View>
    </NativeModuleErrorBoundary>
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
});
