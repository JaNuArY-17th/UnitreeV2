import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import RNFS from 'react-native-fs';
import { PdfSource } from '../types';

export const usePdfDownload = () => {
  const { t } = useTranslation();
  
  // Track if component is mounted to prevent state updates after unmount
  const [isMounted, setIsMounted] = useState(true);

  // States liên quan đến việc tải file PDF chưa ký
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [localPdfPath, setLocalPdfPath] = useState<string | null>(null);
  const [pdfSource, setPdfSource] = useState<PdfSource | null>(null);

  // States cho PDF đã ký
  const [isDownloadingSignedPdf, setIsDownloadingSignedPdf] = useState(false);
  const [signedPdfDownloadProgress, setSignedPdfDownloadProgress] = useState(0);
  const [signedLocalPdfPath, setSignedLocalPdfPath] = useState<string | null>(null);
  const [signedPdfSource, setSignedPdfSource] = useState<PdfSource | null>(null);

  // Tải file PDF chưa ký về thiết bị
  const downloadPdf = async (pdfUrl: string) => {
    try {
      console.log('[usePdfDownload] Bắt đầu tải PDF từ URL:', pdfUrl);
      setIsDownloading(true);
      setDownloadProgress(0);

      // Tạo tên file duy nhất dựa trên timestamp
      const timestamp = new Date().getTime();
      const filename = `econtract_${timestamp}.pdf`;
      const localFilePath = `${RNFS.CachesDirectoryPath}/${filename}`;

      console.log('[usePdfDownload] Đường dẫn file PDF local:', localFilePath);

      const result = await RNFS.downloadFile({
        fromUrl: pdfUrl,
        toFile: localFilePath,
        progressDivider: 10, // Báo cáo tiến độ sau mỗi 10%
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          setDownloadProgress(progress);
          console.log(`[usePdfDownload] Tiến độ tải: ${progress.toFixed(2)}% (${res.bytesWritten}/${res.contentLength} bytes)`);
        },
        background: true
      }).promise;

      console.log('[usePdfDownload] Kết quả tải:', JSON.stringify(result));

      if (result.statusCode === 200) {
        console.log('[usePdfDownload] Tải hoàn tất, kiểm tra file tồn tại...');
        // Kiểm tra xem file đã được tải về thành công chưa
        const fileExists = await RNFS.exists(localFilePath);
        console.log('[usePdfDownload] File tồn tại:', fileExists);

        if (fileExists) {
          // Lấy kích thước file để kiểm tra
          const fileStats = await RNFS.stat(localFilePath);
          console.log('[usePdfDownload] Kích thước file:', fileStats.size);

          if (fileStats.size > 0) {
            console.log('[usePdfDownload] File hợp lệ, thiết lập PDF source');
            setLocalPdfPath(localFilePath);
            const source = { uri: `file://${localFilePath}` };
            console.log('[usePdfDownload] Thiết lập PDF source:', source);
            setPdfSource(source);
            return true;
          } else {
            console.error('[usePdfDownload] File rỗng (0 byte)');
            Alert.alert(
              t('common.error', 'Lỗi'),
              t('econtract.downloadError', 'File PDF tải về không hợp lệ (0 byte). Vui lòng thử lại sau.')
            );
            return false;
          }
        } else {
          console.error('[usePdfDownload] File không tồn tại sau khi tải');
          Alert.alert(
            t('common.error', 'Lỗi'),
            t('econtract.downloadError', 'Không thể tải file PDF. Vui lòng thử lại sau.')
          );
          return false;
        }
      } else {
        console.error('[usePdfDownload] Tải thất bại với mã:', result.statusCode);
        Alert.alert(
          t('common.error', 'Lỗi'),
          t('econtract.downloadError', 'Không thể tải file PDF. Vui lòng thử lại sau.')
        );
        return false;
      }
    } catch (error) {
      console.error('[usePdfDownload] Lỗi khi tải PDF:', error);
      Alert.alert(
        t('common.error', 'Lỗi'),
        t('econtract.downloadError', 'Không thể tải file PDF. Vui lòng thử lại sau.')
      );
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  // Tải file PDF đã ký về thiết bị
  const downloadSignedPdf = async (pdfUrl: string) => {
    if (!isMounted) {
      console.log('Component unmounted, skipping signed PDF download');
      return false;
    }
    
    try {
      setIsDownloadingSignedPdf(true);
      setSignedPdfDownloadProgress(0);

      // Tạo tên file duy nhất dựa trên timestamp
      const timestamp = new Date().getTime();
      const filename = `econtract_signed_${timestamp}.pdf`;
      const localFilePath = `${RNFS.CachesDirectoryPath}/${filename}`;

      console.log('Downloading signed PDF to:', localFilePath);
      console.log('From URL:', pdfUrl);

      const result = await RNFS.downloadFile({
        fromUrl: pdfUrl,
        toFile: localFilePath,
        progressDivider: 10, // Báo cáo tiến độ sau mỗi 10%
        progress: (res) => {
          if (isMounted) {
            const progress = (res.bytesWritten / res.contentLength) * 100;
            setSignedPdfDownloadProgress(progress);
            console.log(`Signed PDF download progress: ${progress.toFixed(2)}%`);
          }
        }
      }).promise;

      console.log('Signed PDF download result:', result);

      if (result.statusCode === 200) {
        if (isMounted) {
          console.log('Signed PDF download complete, setting PDF source to local file');
          setSignedLocalPdfPath(localFilePath);
          setSignedPdfSource({ uri: `file://${localFilePath}` });
        }
        return true;
      } else {
        console.error('Signed PDF download failed with status code:', result.statusCode);
        Alert.alert(
          t('common.error', 'Lỗi'),
          t('econtract.downloadError', 'Không thể tải file PDF. Vui lòng thử lại sau.')
        );
        return false;
      }
    } catch (error) {
      console.error('Error downloading signed PDF:', error);
      Alert.alert(
        t('common.error', 'Lỗi'),
        t('econtract.downloadError', 'Không thể tải file PDF. Vui lòng thử lại sau.')
      );
      return false;
    } finally {
      if (isMounted) {
        setIsDownloadingSignedPdf(false);
      }
    }
  };

  // Dọn dẹp tài nguyên
  const cleanupResources = () => {
    console.log('Cleaning up PDF download resources');
    setIsMounted(false);
    
    // Xóa file PDF tạm nếu có
    if (localPdfPath) {
      RNFS.unlink(localPdfPath)
        .then(() => console.log('PDF file deleted'))
        .catch(error => console.error('Error deleting PDF file:', error));
    }

    // Xóa file PDF đã ký nếu có
    if (signedLocalPdfPath) {
      RNFS.unlink(signedLocalPdfPath)
        .then(() => console.log('Signed PDF file deleted'))
        .catch(error => console.error('Error deleting signed PDF file:', error));
    }
  };

  return {
    // PDF chưa ký
    isDownloading,
    downloadProgress,
    localPdfPath,
    pdfSource,
    downloadPdf,
    setPdfSource,

    // PDF đã ký
    isDownloadingSignedPdf,
    signedPdfDownloadProgress,
    signedLocalPdfPath,
    signedPdfSource,
    downloadSignedPdf,
    setSignedPdfSource,

    // Dọn dẹp tài nguyên
    cleanupResources
  };
};
