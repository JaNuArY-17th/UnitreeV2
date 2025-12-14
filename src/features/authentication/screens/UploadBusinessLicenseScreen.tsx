import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert, Image, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors, spacing, FONT_WEIGHTS, getFontFamily } from '@/shared/themes';
import { Heading, Text, Button } from '@/shared/components/base';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../../../shared/components';
import { FileUpload } from '../components/FileUpload';
import type { Asset } from 'react-native-image-picker';
import { useStoreFileUpload } from '../hooks/useStoreFileUpload';
import { useStoreFiles } from '../hooks/useStoreFiles';
import { storeService } from '../services/storeService';
import { useMutation } from '@tanstack/react-query';
import { FileText, Trash } from '@/shared/assets/icons';

type UploadBusinessLicenseNav = NativeStackNavigationProp<RootStackParamList>;
type UploadBusinessLicenseRoute = RouteProp<RootStackParamList, 'UploadBusinessLicense'>;

const UploadBusinessLicenseScreen: React.FC = () => {
  const navigation = useNavigation<UploadBusinessLicenseNav>();
  const route = useRoute<UploadBusinessLicenseRoute>();
  const { t } = useTranslation('store');
  const insets = useSafeAreaInsets();

  // Get store ID and return route from params
  const storeId = route.params?.storeId || '';
  const returnRoute = route.params?.returnRoute; // 'StoreDetail' or undefined (default to CreateStoreSuccess)

  console.log('[UploadBusinessLicense] Screen mounted with storeId:', storeId);
  console.log('[UploadBusinessLicense] Return route:', returnRoute);
  console.log('[UploadBusinessLicense] Route params:', route.params);

  // File upload state
  const [businessLicenseFiles, setBusinessLicenseFiles] = useState<Asset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadFile } = useStoreFileUpload();

  // Fetch existing uploaded files
  const { data: uploadedFilesData, isLoading: isLoadingFiles, refetch: refetchFiles } = useStoreFiles(storeId);
  const uploadedFiles = uploadedFilesData?.data || [];

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => storeService.removeStoreFile(fileId),
    onSuccess: async () => {
      console.log('[UploadBusinessLicense] File deleted successfully');
      await refetchFiles();
    },
    onError: (error: any) => {
      console.error('[UploadBusinessLicense] Failed to delete file:', error);
      Alert.alert(
        t('error.title', 'Lỗi'),
        t('error.deleteFailed', 'Không thể xóa file. Vui lòng thử lại.'),
        [{ text: t('common.ok', 'OK') }]
      );
    },
  });

  const handleUpload = async () => {
    if (businessLicenseFiles.length === 0) {
      Alert.alert(
        t('error.title', 'Lỗi'),
        t('error.noFiles', 'Vui lòng chọn ít nhất một tệp để tải lên'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    // Check if total files will exceed limit
    const totalFiles = uploadedFiles.length + businessLicenseFiles.length;
    if (totalFiles > 5) {
      Alert.alert(
        t('error.title', 'Lỗi'),
        t('error.maxFiles', `Bạn chỉ có thể tải lên tối đa 5 file. Hiện tại đã có ${uploadedFiles.length} file. Vui lòng chọn tối đa ${5 - uploadedFiles.length} file nữa.`),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    setIsUploading(true);

    try {
      console.log('[UploadBusinessLicense] Uploading files for store:', storeId);
      console.log('[UploadBusinessLicense] Number of files:', businessLicenseFiles.length);

      // Log file details before upload
      businessLicenseFiles.forEach((file, index) => {
        console.log(`[UploadBusinessLicense] File ${index}:`, {
          uri: file.uri,
          type: file.type,
          fileName: file.fileName,
          fileSize: file.fileSize,
          width: file.width,
          height: file.height,
        });
      });

      // Upload all files
      const uploadPromises = businessLicenseFiles.map((file, index) => {
        if (!file.uri || !file.type || !file.fileName) {
          console.error(`[UploadBusinessLicense] Invalid file data at index ${index}:`, file);
          throw new Error('Invalid file data');
        }

        console.log(`[UploadBusinessLicense] Starting upload for file ${index}: ${file.fileName}`);
        return uploadFile(
          {
            uri: file.uri,
            type: file.type,
            name: file.fileName,
          },
          storeId
        );
      });

      const uploadResults = await Promise.all(uploadPromises);

      // Log upload results for debugging
      console.log('[UploadBusinessLicense] Upload results:', JSON.stringify(uploadResults, null, 2));
      uploadResults.forEach((result, index) => {
        console.log(`[UploadBusinessLicense] File ${index} upload result:`, {
          success: result.success,
          fileUrl: result.data?.fileUrl,
          fileId: result.data?.fileId,
          fileKey: result.data?.fileKey,
        });
      });

      // Check if all uploads succeeded
      const failedUploads = uploadResults.filter(result => !result.success);
      if (failedUploads.length > 0) {
        throw new Error('Some files failed to upload');
      }

      console.log('[UploadBusinessLicense] All files uploaded successfully');

      // Refetch uploaded files to show the new ones
      await refetchFiles();

      // Clear selected files
      setBusinessLicenseFiles([]);

      // Navigate based on return route
      Alert.alert(
        t('success.title', 'Thành công'),
        t('success.uploadComplete', 'Giấy phép kinh doanh đã được tải lên thành công'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => {
              if (returnRoute === 'StoreDetail') {
                // TH2: Quay lại StoreDetail (upload từ profile)
                console.log('[UploadBusinessLicense] Returning to StoreDetail');
                navigation.goBack();
              } else {
                // TH1: Navigate to CreateStoreSuccess (luồng tạo store mới)
                console.log('[UploadBusinessLicense] Navigating to CreateStoreSuccess');
                // Fetch full store data before navigating
                const { storeService } = require('@/features/authentication/services/storeService');
                storeService.getStoreData().then((response: any) => {
                  if (response.success && response.data) {
                    navigation.navigate('CreateStoreSuccess', { storeData: response.data });
                  } else {
                    // Fallback: Navigate with minimal data
                    navigation.navigate('CreateStoreSuccess', { storeData: { id: storeId } as any });
                  }
                }).catch((error: any) => {
                  console.error('[UploadBusinessLicense] Failed to fetch store data:', error);
                  navigation.navigate('CreateStoreSuccess', { storeData: { id: storeId } as any });
                });
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[UploadBusinessLicense] Upload error:', error);

      Alert.alert(
        t('error.title', 'Lỗi tải lên'),
        t('error.uploadFailed', 'Không thể tải lên giấy phép kinh doanh. Vui lòng thử lại.'),
        [
          {
            text: t('common.retry', 'Thử lại'),
            onPress: () => setIsUploading(false),
          },
          {
            text: t('common.cancel', 'Hủy'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    // TH2: Nếu đang ở profile, không cần skip, chỉ cần back
    if (returnRoute === 'StoreDetail') {
      navigation.goBack();
      return;
    }

    // TH1: Luồng tạo store mới - hiển thị confirm skip
    Alert.alert(
      t('skip.title', 'Bỏ qua tải lên?'),
      t('skip.message', 'Bạn có thể tải lên giấy phép kinh doanh sau. Tiếp tục?'),
      [
        {
          text: t('common.cancel', 'Hủy'),
          style: 'cancel',
        },
        {
          text: t('common.continue', 'Tiếp tục'),
          onPress: () => {
            // Fetch full store data before navigating
            const { storeService } = require('@/features/authentication/services/storeService');
            storeService.getStoreData().then((response: any) => {
              if (response.success && response.data) {
                navigation.navigate('CreateStoreSuccess', { storeData: response.data });
              } else {
                navigation.navigate('CreateStoreSuccess', { storeData: { id: storeId } as any });
              }
            }).catch(() => {
              navigation.navigate('CreateStoreSuccess', { storeData: { id: storeId } as any });
            });
          },
        },
      ]
    );
  };

  const handleDeleteFile = (fileId: string) => {
    Alert.alert(
      t('deleteFile.title', 'Xóa file'),
      t('deleteFile.message', 'Bạn có chắc chắn muốn xóa file này?'),
      [
        {
          text: t('common.cancel', 'Hủy'),
          style: 'cancel',
        },
        {
          text: t('common.delete', 'Xóa'),
          style: 'destructive',
          onPress: () => deleteFileMutation.mutate(fileId),
        },
      ]
    );
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <ScreenHeader
        title={t('uploadBusinessLicense.title', 'Giấy phép kinh doanh')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Illustration */}
          <View style={styles.illustrationWrap}>
            <View style={styles.iconContainer}>
              <FileText width={80} height={80} color={colors.primary} />
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Heading style={styles.title}>
              {t('uploadBusinessLicense.heading', 'Tải lên giấy phép kinh doanh')}
            </Heading>
            <Text style={styles.description}>
              {t(
                'uploadBusinessLicense.description',
                'Vui lòng tải lên ảnh Giấy phép kinh doanh hoặc Giấy chứng nhận đăng ký hộ kinh doanh của bạn.'
              )}
            </Text>
          </View>

          {/* Uploaded Files Section */}
          {isLoadingFiles ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                {t('uploadBusinessLicense.loadingFiles', 'Đang tải danh sách file...')}
              </Text>
            </View>
          ) : uploadedFiles.length > 0 && (
            <View style={styles.uploadedSection}>
              <Text style={styles.sectionTitle}>
                {t('uploadBusinessLicense.uploadedFiles', 'Giấy phép đã tải lên')} ({uploadedFiles.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.uploadedFilesContainer}
              >
                {uploadedFiles.map((file) => (
                  <View key={file.fileId} style={styles.uploadedFileItem}>
                    <Image
                      source={{ uri: file.fileUrl }}
                      style={styles.uploadedFileImage}
                      resizeMode="cover"
                    />
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDeleteFile(file.fileId)}
                      disabled={deleteFileMutation.isPending}
                      hitSlop={8}
                    >
                      <Trash width={16} height={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* File Upload */}
          <View style={styles.uploadSection}>
            <FileUpload
              label={t('uploadBusinessLicense.label', 'Giấy phép kinh doanh / Giấy chứng nhận đăng ký hộ kinh doanh')}
              files={businessLicenseFiles}
              onFilesChange={setBusinessLicenseFiles}
              maxFiles={Math.max(0, 5 - uploadedFiles.length)} // Giới hạn dựa trên số file đã upload
              required={uploadedFiles.length === 0} // Chỉ required nếu chưa có file nào
            />
            {uploadedFiles.length >= 5 && (
              <Text style={styles.maxFilesWarning}>
                {t('uploadBusinessLicense.maxFilesReached', 'Đã đạt giới hạn 5 file. Vui lòng xóa file cũ để tải lên file mới.')}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <Button
          label={
            isUploading
              ? t('uploading', 'Đang tải lên...')
              : uploadedFiles.length >= 5
                ? t('uploadBusinessLicense.maxFilesReached', 'Đã đạt giới hạn 5 file')
                : t('uploadBusinessLicense.upload', 'Tải lên')
          }
          size="lg"
          onPress={handleUpload}
          disabled={businessLicenseFiles.length === 0 || isUploading || uploadedFiles.length >= 5}
          style={styles.uploadButton}
        />

        <Button
          label={t('uploadBusinessLicense.skip', 'Bỏ qua')}
          size="lg"
          variant="outline"
          onPress={handleSkip}
          disabled={isUploading}
          style={styles.skipButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
  },
  content: {
    paddingTop: spacing.xl,
  },
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    textAlign: 'center',
    color: colors.text.secondary,
    lineHeight: 24,
  },
  uploadSection: {
    marginBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  uploadButton: {
    width: '100%',
  },
  skipButton: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  uploadedSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  uploadedFilesContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  uploadedFileItem: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  uploadedFileImage: {
    width: '100%',
    height: '100%',
  },
  maxFilesWarning: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.warning || colors.danger,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(235, 87, 87, 0.9)',
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UploadBusinessLicenseScreen;
