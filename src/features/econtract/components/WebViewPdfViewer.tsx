import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { theme } from '@/shared/themes';
import { PdfSource } from '../types';

interface WebViewPdfViewerProps {
  isDownloading: boolean;
  downloadProgress: number;
  pdfSource: PdfSource | null;
  timeLeft?: number;
}

export const WebViewPdfViewer: React.FC<WebViewPdfViewerProps> = ({
  isDownloading,
  downloadProgress,
  pdfSource,
  timeLeft = 300,
}) => {
  const { t } = useTranslation();

  // Format thời gian còn lại
  const formatTimeLeft = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      <View style={styles.container}>
        <Text style={styles.noPdfText}>
          {t('econtract.noPdf', 'Không có tài liệu để hiển thị')}
        </Text>
      </View>
    );
  }

  // Get PDF URL from source
  const getPdfUrl = () => {
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

  const pdfUrl = getPdfUrl();

  if (!pdfUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPdfText}>
          Không thể hiển thị PDF. URL không hợp lệ.
        </Text>
      </View>
    );
  }

  // Create HTML content for PDF viewing
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
        <style>
          body {
            margin: 0;
            padding: 10px;
            font-family: system-ui, -apple-system, sans-serif;
            background: #f5f5f5;
          }
          .header {
            background: ${theme.colors.primary};
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
          }
          .time-left {
            font-weight: bold;
          }
          iframe {
            width: 100%;
            height: calc(100vh - 100px);
            border: none;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .fallback {
            text-align: center;
            padding: 40px;
            color: #666;
          }
          .fallback a {
            color: ${theme.colors.primary};
            text-decoration: none;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <span>📄 Hợp đồng điện tử</span>
          <span class="time-left">⏰ ${formatTimeLeft(timeLeft)}</span>
        </div>

        <iframe
          src="${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitH"
          title="PDF Viewer"
          onload="console.log('PDF loaded successfully')"
          onerror="console.error('Failed to load PDF')"
        >
          <div class="fallback">
            <p>Trình duyệt của bạn không hỗ trợ hiển thị PDF trực tiếp.</p>
            <p><a href="${pdfUrl}" target="_blank">Nhấn vào đây để tải xuống PDF</a></p>
          </div>
        </iframe>

        <script>
          // Auto-refresh time every minute
          setInterval(() => {
            const timeElement = document.querySelector('.time-left');
            if (timeElement) {
              // This would need to be updated from React Native side
              console.log('Time should be updated');
            }
          }, 60000);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải PDF...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error:', nativeEvent);
        }}
        allowsFullscreenVideo={false}
        mixedContentMode="compatibility"
        onShouldStartLoadWithRequest={(request) => {
          // Allow PDF URLs and data URLs
          return request.url.includes(pdfUrl) || request.url.startsWith('data:') || request.url.startsWith('about:');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  webview: {
    flex: 1,
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
    backgroundColor: theme.colors.lightGray,
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
});
