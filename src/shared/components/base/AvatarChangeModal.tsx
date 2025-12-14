import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppDispatch } from '@/shared/store';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useImagePicker, SelectedImage } from '@/shared/hooks/useImagePicker';
import { avatarService } from '@/shared/services/avatarService';
import { getCurrentUserAsync } from '@/features/authentication/store/authSlice';
import { colors, spacing, FONT_WEIGHTS, getFontFamily } from '@/shared/themes';
import BottomSheetModal from './BottomSheetModal';
import Text from './Text';
import Avatar from './Avatar';
import { Gallery, Camera, Close } from '@/shared/assets/icons';

export interface AvatarChangeModalProps {
  visible: boolean;
  onClose: () => void;
  onAvatarUpdated?: (avatarData?: { avatar_id: string; avatar_url: string }) => void;
  currentAvatarUrl?: string | null;
  userName?: string;
}

type ModalState = 'select' | 'preview' | 'uploading' | 'success' | 'error';

interface Option {
  id: 'gallery' | 'camera';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => Promise<void>;
}

export const AvatarChangeModal: React.FC<AvatarChangeModalProps> = ({
  visible,
  onClose,
  onAvatarUpdated,
  currentAvatarUrl,
  userName = '',
}) => {
  const { t } = useTranslation('profile');
  const { t: commonT } = useTranslation('common');
  const dispatch = useAppDispatch();

  const [currentState, setCurrentState] = useState<ModalState>('select');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { pickFromCamera, pickFromGallery, isLoading: pickerLoading } = useImagePicker();

  const resetModal = () => {
    setCurrentState('select');
    setSelectedImage(null);
    setUploadProgress(0);
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleImagePick = async (pickFunction: () => Promise<SelectedImage | null>) => {
    try {
      setError(null);
      const image = await pickFunction();
      if (image) {
        setSelectedImage(image);
        setCurrentState('preview');
      }
    } catch (err: any) {
      setError(err.message || t('avatar.selectError', 'Failed to select image'));
      setCurrentState('error');
    }
  };

  const pickOptions: Option[] = [
    {
      id: 'gallery',
      title: t('avatar.fromGallery', 'Choose from Gallery'),
      subtitle: t('avatar.selectExisting', 'Select an existing photo'),
      icon: <Gallery width={24} height={24} color={colors.primary} />,
      onPress: () => handleImagePick(() => pickFromGallery({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1024,
        maxWidth: 1024,
        quality: 0.8,
      })),
    },
    {
      id: 'camera',
      title: t('avatar.takePhoto', 'Take Photo'),
      subtitle: t('avatar.useCamera', 'Use camera to take a new photo'),
      icon: <Camera width={24} height={24} color={colors.primary} />,
      onPress: () => handleImagePick(() => pickFromCamera({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1024,
        maxWidth: 1024,
        quality: 0.8,
      })),
    },
  ];

  const handleUpload = async () => {
    if (!selectedImage) return;

    setCurrentState('uploading');
    setUploadProgress(0);
    setError(null);

    try {
      const result = await avatarService.uploadAvatar(
        selectedImage.uri,
        'current_user', // This should be replaced with actual user ID
        (progress) => setUploadProgress(progress)
      );

      setCurrentState('success');
      onAvatarUpdated?.(result.data);

      // Refresh user data to update avatar in cache/storage
      try {
        await dispatch(getCurrentUserAsync()).unwrap();
        console.log('✅ User data refreshed after avatar upload');
      } catch (refreshError) {
        console.warn('⚠️ Failed to refresh user data after avatar upload:', refreshError);
        // Don't fail the avatar upload if user data refresh fails
      }

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(err.message || t('avatar.uploadError', 'Failed to upload avatar'));
      setCurrentState('error');
    }
  };

  const handleRetry = () => {
    setCurrentState(selectedImage ? 'preview' : 'select');
    setError(null);
  };

  // Reusable components
  const Header = ({ title, showClose = true }: { title: string; showClose?: boolean }) => (
    <View style={styles.header}>
      <Text variant="h2" style={styles.title}>{title}</Text>
      {showClose && (
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Close width={24} height={24} color={colors.text.secondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const CenteredAvatar = ({ size = 100 }: { size?: number }) => (
    <Avatar
      size={size}
      name={userName}
      imageUri={selectedImage?.uri || currentAvatarUrl}
      backgroundColor={colors.primary}
    />
  );

  const ActionButtons = ({ 
    onCancel, 
    onPrimary, 
    cancelText = commonT('cancel', 'Cancel'), 
    primaryText,
    primaryStyle = styles.uploadButton 
  }: {
    onCancel: () => void;
    onPrimary: () => void;
    cancelText?: string;
    primaryText: string;
    primaryStyle?: any;
  }) => (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onCancel}>
        <Text variant="buttonText" style={styles.cancelButtonText}>{cancelText}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, primaryStyle]} onPress={onPrimary}>
        <Text variant="buttonText" style={styles.uploadButtonText}>{primaryText}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelectState = () => (
    <View style={styles.container}>
      <View style={styles.currentAvatarSection}>
        <CenteredAvatar size={80} />
      </View>

      <View style={styles.optionsSection}>
        <Text variant="body" style={styles.sectionLabel}>
          {t('avatar.chooseOption', 'Choose an option')}
        </Text>

        {pickOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionButton}
            onPress={option.onPress}
            disabled={pickerLoading}
          >
            <View style={styles.optionIcon}>{option.icon}</View>
            <View style={styles.optionContent}>
              <Text variant="body" style={styles.optionTitle}>{option.title}</Text>
              <Text variant="caption" style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPreviewState = () => (
    <View style={styles.container}>
      <View style={styles.previewSection}>
        <CenteredAvatar size={120} />
        <Text variant="body" style={styles.previewText}>
          {t('avatar.previewDescription', 'This is how your avatar will look')}
        </Text>
      </View>
      <ActionButtons
        onCancel={() => setCurrentState('select')}
        onPrimary={handleUpload}
        primaryText={t('avatar.upload', 'Upload')}
      />
    </View>
  );

  const renderUploadingState = () => (
    <View style={styles.container}>
      <Header title={t('avatar.uploading', 'Uploading...')} showClose={false} />
      <View style={styles.uploadingSection}>
        <CenteredAvatar />
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text variant="caption" style={styles.progressText}>
            {uploadProgress}% {t('avatar.complete', 'complete')}
          </Text>
        </View>
        <Text variant="body" style={styles.uploadingText}>
          {t('avatar.uploadingDescription', 'Please wait while we upload your avatar...')}
        </Text>
      </View>
    </View>
  );

  const renderSuccessState = () => (
    <View style={styles.container}>
      <View style={styles.successSection}>
        <CenteredAvatar />
        <Text variant="h2" style={styles.successTitle}>
          {t('avatar.successTitle', 'Success!')}
        </Text>
        <Text variant="body" style={styles.successText}>
          {t('avatar.successDescription', 'Your avatar has been updated successfully.')}
        </Text>
      </View>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.container}>
      <Header title={t('error', 'Error')} />
      <View style={styles.errorSection}>
        <Text variant="body" style={styles.errorText}>
          {error || t('avatar.unknownError', 'An unknown error occurred')}
        </Text>
        <ActionButtons
          onCancel={handleClose}
          onPrimary={handleRetry}
          primaryText={t('avatar.retry', 'Retry')}
          primaryStyle={styles.retryButton}
        />
      </View>
    </View>
  );

  const renderContent = () => {
    const renders = {
      select: renderSelectState,
      preview: renderPreviewState,
      uploading: renderUploadingState,
      success: renderSuccessState,
      error: renderErrorState,
    };
    return renders[currentState]();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose} maxHeightRatio={0.5} fillToMaxHeight>
      {renderContent()}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD), color: colors.text.primary },
  closeButton: { padding: spacing.xs },
  currentAvatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  sectionLabel: { color: colors.text.secondary, marginBottom: spacing.md, fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM) },
  optionsSection: { flex: 1 },
  optionButton: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.secondary,
    borderRadius: 12, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border
  },
  optionIcon: { alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  optionContent: { flex: 1 },
  optionTitle: { color: colors.text.primary, fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM), marginBottom: spacing.xs },
  optionSubtitle: { color: colors.text.secondary },
  previewSection: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  previewText: { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.md },
  actionButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  actionButton: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border },
  cancelButtonText: { color: colors.text.primary },
  uploadButton: { backgroundColor: colors.primary },
  uploadButtonText: { color: colors.light },
  retryButton: { backgroundColor: colors.primary },
  uploadingSection: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  progressContainer: { width: '100%', marginTop: spacing.lg },
  progressBar: { height: 4, backgroundColor: colors.secondary, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  progressText: { textAlign: 'center', marginTop: spacing.sm, color: colors.text.secondary },
  uploadingText: { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.md },
  successSection: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  successTitle: { 
    color: colors.success || colors.primary, fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD), 
    marginTop: spacing.lg, marginBottom: spacing.sm 
  },
  successText: { color: colors.text.secondary, textAlign: 'center' },
  errorSection: { flex: 1, justifyContent: 'center' },
  errorText: { color: colors.danger, textAlign: 'center', marginBottom: spacing.xl },
});
