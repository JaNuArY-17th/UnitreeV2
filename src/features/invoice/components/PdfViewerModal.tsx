import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import BottomSheetModalComponent from '@/shared/components/base/BottomSheetModal';
import PDFView from 'react-native-pdf';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import { Text as RNText } from '@/shared/components';

interface PdfViewerModalProps {
  visible: boolean;
  pdfUri: string; // File path or base64 data URI
  title?: string;
  onClose: () => void;
  isLoading?: boolean;
  error?: string;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  visible,
  pdfUri,
  title = 'PDF Viewer',
  onClose,
  isLoading = false,
  error,
}) => {
  const { t } = useTranslation('order');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handlePageChanged = (page: number, numberOfPages: number) => {
    setCurrentPage(page);
    setTotalPages(numberOfPages);
  };

  const handleError = (error: any) => {
    console.error('[PdfViewerModal] Error loading PDF:', error);
    Alert.alert(
      t('orderDetail.errorLoadingPdf', 'Lỗi'),
      t('orderDetail.failedToLoadPdf', 'Không thể tải file PDF')
    );
  };

  const headerContent = (
    <View style={styles.header}>
      <RNText style={styles.headerTitle}>{title}</RNText>
    </View>
  );

  return (
    <BottomSheetModalComponent
      visible={visible}
      onClose={onClose}
      headerContent={headerContent}
      maxHeightRatio={0.8}
      showHandle={true}
      showClose={false}
      fillToMaxHeight={true}
    >
      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <RNText style={styles.loadingText}>
            {t('common.loading', 'Đang tải...')}
          </RNText>
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <RNText style={styles.errorText}>{error}</RNText>
          <Pressable style={styles.retryButton} onPress={onClose}>
            <RNText style={styles.retryButtonText}>
              {t('common.close', 'Đóng')}
            </RNText>
          </Pressable>
        </View>
      )}

      {/* PDF Viewer */}
      {!isLoading && !error && pdfUri && (
        <View style={styles.pdfContainer}>
          <PDFView
            source={{ uri: pdfUri }}
            style={styles.pdf}
            onPageChanged={handlePageChanged}
            onError={handleError}
            page={currentPage}
          />

          {/* Page Counter */}
          {totalPages > 1 && (
            <View style={styles.pageCounter}>
              <RNText style={styles.pageCounterText}>
                {t('orderDetail.page', 'Trang')} {currentPage}/{totalPages}
              </RNText>
            </View>
          )}
        </View>
      )}
    </BottomSheetModalComponent>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.h3,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  errorText: {
    ...typography.h3,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.h3,
    color: colors.light,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: colors.light,
  },
  pdf: {
    flex: 1,
  },
  pageCounter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
  },
  pageCounterText: {
    ...typography.h3,
    color: colors.text.secondary,
  },
});

export default PdfViewerModal;
