import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, BottomSheetModal } from '@/shared/components/base';
import { colors, spacing, FONT_WEIGHTS, getFontFamily } from '@/shared/themes';
import type { Asset } from 'react-native-image-picker';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon, Image01Icon, Camera01Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useImagePicker, SelectedImage } from '@/shared/hooks/useImagePicker';

interface FileUploadProps {
  label: string;
  files: Asset[];
  onFilesChange: (files: Asset[]) => void;
  maxFiles?: number;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  files,
  onFilesChange,
  maxFiles = 5,
  required = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  const { pickFromCamera, pickFromGallery, isLoading } = useImagePicker();

  const handleAddFiles = () => {
    console.log('[FileUpload] handleAddFiles called');
    console.log('[FileUpload] Current files count:', files.length, '/', maxFiles);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const convertSelectedImageToAsset = (image: SelectedImage): Asset => {
    return {
      uri: image.uri,
      type: image.type,
      fileName: image.fileName,
      fileSize: image.fileSize,
      width: image.width,
      height: image.height,
      base64: image.base64,
    };
  };

  const handleImagePick = async (pickFunction: () => Promise<SelectedImage | null>) => {
    try {
      const image = await pickFunction();
      if (image) {
        console.log('[FileUpload] Selected/Captured image:', {
          uri: image.uri,
          type: image.type,
          fileName: image.fileName,
          fileSize: image.fileSize,
        });
        const asset = convertSelectedImageToAsset(image);
        onFilesChange([...files, asset]);
        setShowModal(false); // Close modal after successful selection
      } else {
        console.log('[FileUpload] No image selected or user cancelled');
      }
    } catch (error) {
      console.error('[FileUpload] Error picking image:', error);
    }
  };

  interface PickOption {
    id: 'gallery' | 'camera';
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onPress: () => Promise<void>;
  }

  const pickOptions: PickOption[] = [
    {
      id: 'gallery',
      title: t('fileUpload:photoLibrary'),
      subtitle: t('fileUpload:selectExisting') || 'Select an existing photo',
      icon: <HugeiconsIcon icon={Image01Icon} size={24} color={colors.primary} />,
      onPress: () => handleImagePick(() => pickFromGallery({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2048,
        maxWidth: 2048,
        quality: 0.8,
        selectionLimit: 1,
      })),
    },
    {
      id: 'camera',
      title: t('fileUpload:takePhoto'),
      subtitle: t('fileUpload:useCamera') || 'Use camera to take a new photo',
      icon: <HugeiconsIcon icon={Camera01Icon} size={24} color={colors.primary} />,
      onPress: () => handleImagePick(() => pickFromCamera({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2048,
        maxWidth: 2048,
        quality: 0.8,
      })),
    },
  ];

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>
          {label} {required && '*'}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filesContainer}
        >
          {files.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <Image
                source={{ uri: file.uri }}
                style={styles.fileImage}
                resizeMode="cover"
              />
              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemoveFile(index)}
                hitSlop={8}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} color={colors.light} />
              </Pressable>
            </View>
          ))}

          {files.length < maxFiles && (
            <Pressable
              style={styles.addButton}
              onPress={handleAddFiles}
              onPressIn={() => console.log('[FileUpload] Pressable touched')}
              testID="add-file-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <>
                  <Text style={styles.addButtonText}>+</Text>
                  <Text style={styles.addButtonLabel}>{t('fileUpload:addPhoto')}</Text>
                </>
              )}
            </Pressable>
          )}
        </ScrollView>

        <Text style={styles.hint}>
          {t('fileUpload:uploadMaxFiles', { maxFiles })}. {t('fileUpload:uploaded')} {files.length}/{maxFiles}
        </Text>
      </View>

      {/* Image Source Selection Modal */}
      <BottomSheetModal
        visible={showModal}
        onClose={handleCloseModal}
        maxHeightRatio={0.5}
        fillToMaxHeight
      >
        <View style={styles.modalContainer}>
          <View style={styles.optionsSection}>
            <Text variant="body" style={styles.sectionLabel}>
              {t('fileUpload:selectPhoto')}
            </Text>

            {pickOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionButton}
                onPress={option.onPress}
                disabled={isLoading}
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
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  filesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  fileItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.background,
  },
  fileImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  addButtonText: {
    fontSize: 32,
    color: colors.text.secondary,
    fontFamily: getFontFamily(FONT_WEIGHTS.LIGHT),
    lineHeight: 36,
  },
  addButtonLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Modal styles - matching AvatarChangeModal
  modalContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  optionsSection: {
    flex: 1,
  },
  sectionLabel: {
    color: colors.text.secondary,
    marginBottom: spacing.md,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: colors.text.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    marginBottom: spacing.xs,
  },
  optionSubtitle: {
    color: colors.text.secondary,
  },
});
