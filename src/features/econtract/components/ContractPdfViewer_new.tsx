import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

import { theme } from '@shared/themes';
import { styles } from '../styles';
import { PdfSource } from '../types';
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

  // Always use SimplePdfViewer as fallback since react-native-pdf causes native module issues
  return (
    <SimplePdfViewer
      isDownloading={isDownloading}
      downloadProgress={downloadProgress}
      pdfSource={pdfSource}
    />
  );
};
