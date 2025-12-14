import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/shared/themes';
import { PdfSource } from '../types';

interface SimplePdfViewerProps {
  isDownloading: boolean;
  downloadProgress: number;
  pdfSource: PdfSource | null;
}

export const SimplePdfViewer: React.FC<SimplePdfViewerProps> = ({
  isDownloading,
  downloadProgress,
  pdfSource,
}) => {
  const { t } = useTranslation();


  // Lấy URL từ PDF source
  const getPdfUrl = (): string | null => {
    if (typeof pdfSource === 'string') {
      return pdfSource;
    }
    if (pdfSource && typeof pdfSource === 'object') {
      if ('uri' in pdfSource) {
        return pdfSource.uri;
      }
      if ('url' in pdfSource) {
        return (pdfSource as any).url;
      }
    }
    return null;
  };

  const handleOpenPdf = async () => {
    const pdfUrl = getPdfUrl();
    if (!pdfUrl) {
      Alert.alert('Lỗi', 'Không tìm thấy đường dẫn PDF.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert(
          'Không thể mở PDF',
          'Thiết bị không hỗ trợ mở file PDF. Vui lòng tải xuống và sử dụng ứng dụng PDF khác.'
        );
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Lỗi', 'Không thể mở file PDF.');
    }
  };

  if (isDownloading) {
    return (
      <View style={styles.container}>
        <View style={styles.downloadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.downloadingText}>
            {t('econtract.downloading', 'Đang tải file PDF...')} ({downloadProgress.toFixed(0)}%)
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${downloadProgress}%` }]} />
          </View>
        </View>
      </View>
    );
  }

  if (!pdfSource) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPdfText}>
          {t('econtract.noPdf', 'Không có tài liệu để hiển thị')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* PDF Preview Card */}
      <View style={styles.pdfCard}>
        <View style={styles.pdfIcon}>
          <Text style={styles.pdfIconText}>📄</Text>
        </View>
        
        <Text style={styles.pdfTitle}>Hợp đồng điện tử</Text>
        <Text style={styles.pdfDescription}>
          File PDF đã sẵn sàng để xem. Nhấn nút bên dưới để mở trong trình xem PDF.
        </Text>

        <TouchableOpacity style={styles.openButton} onPress={handleOpenPdf}>
          <Text style={styles.openButtonText}>📖 Mở file PDF</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Tính năng xem PDF trực tiếp đang được cải thiện. 
            Hiện tại bạn có thể mở file trong trình xem PDF mặc định của thiết bị.
          </Text>
        </View>
      </View>

      {/* Footer với hướng dẫn */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Sau khi xem xong hợp đồng, vui lòng quay lại ứng dụng để tiếp tục ký.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.light,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginRight: 8,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  pdfCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  pdfIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pdfIconText: {
    fontSize: 32,
  },
  pdfTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  pdfDescription: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  openButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  openButtonText: {
    color: theme.colors.light,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: theme.colors.info.light,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info.main,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.info.dark,
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  downloadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  downloadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '80%',
    height: 4,
    backgroundColor: theme.colors.gray.light,
    borderRadius: 2,
    marginTop: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  noPdfText: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 40,
  },
});