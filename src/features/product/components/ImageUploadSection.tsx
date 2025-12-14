import React, { useState } from 'react';
import { View, StyleSheet, Image, Pressable, ScrollView, Alert } from 'react-native';
import { Text, Button } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon, Add01Icon, Image02Icon } from '@hugeicons/core-free-icons';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import { useImagePicker } from '@/shared/hooks/useImagePicker';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface ImageUploadSectionProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  images,
  onChange,
  maxImages = 5,
  label,
}) => {
  const { t } = useTranslation('product');
  const { showPickerOptions, isLoading } = useImagePicker();

  const handleAddImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert(
        t('maxImagesTitle', 'Đã đạt giới hạn'),
        t('maxImagesMessage', `Bạn chỉ có thể tải lên tối đa ${maxImages} ảnh`),
      );
      return;
    }

    try {
      const image = await showPickerOptions({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2048,
        maxWidth: 2048,
        quality: 0.8,
      });

      if (image && image.uri) {
        onChange([...images, image.uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Existing images */}
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} />
            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} color={colors.light} />
            </Pressable>
          </View>
        ))}

        {/* Add button */}
        {images.length < maxImages && (
          <Pressable
            style={styles.addButton}
            onPress={handleAddImage}
            disabled={isLoading}
          >
            <HugeiconsIcon icon={Image02Icon} size={28} color={colors.text.secondary} />
            <Text style={styles.addButtonText}>
              {t('addImage', 'Tải lên')}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Helper text */}
      <Text variant="caption" style={styles.helperText}>
        {t('imageHelper', `${images.length}/${maxImages} ảnh`)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  scrollContent: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: dimensions.radius.md,
    backgroundColor: colors.background,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: dimensions.radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  helperText: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
  },
});

export default ImageUploadSection;
