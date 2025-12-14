import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { Text } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import { useVariationMutations } from '../hooks/useVariationMutations';
import { FileUpload } from '@/features/authentication/components/FileUpload';
import { useStoreFileUpload } from '@/features/authentication/hooks/useStoreFileUpload';
import { Trash } from '@/shared/assets/icons';
import type { Asset } from 'react-native-image-picker';
import type { RootStackParamList } from '@/navigation/types';
import type { VariationFormData } from '../types/variation';

type EditVariationScreenRouteProp = RouteProp<RootStackParamList, 'EditVariation'>;
type EditVariationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditVariation'>;

const EditVariationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<EditVariationScreenNavigationProp>();
  const route = useRoute<EditVariationScreenRouteProp>();
  const { t } = useTranslation('product');
  const { storeData } = useStoreData();
  const storeId = storeData?.id;

  const { productId, variationId, variation } = route.params;
  const isEditMode = !!variationId && !!variation;

  // Form state
  const [formData, setFormData] = useState<VariationFormData>({
    sku: '',
    name: '',
    unit: '',
    quantity: 0,
    price: 0,
    salePrice: undefined,
    importPrice: undefined,
    taxRate: undefined,
    maxPrice: undefined,
    minPrice: undefined,
  });

  // Image upload state
  const [imageFiles, setImageFiles] = useState<Asset[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [shouldRemoveExistingImage, setShouldRemoveExistingImage] = useState(false);
  const { uploadFile } = useStoreFileUpload();

  // Mutations
  const { createVariation, updateVariation, isCreating, isUpdating } = useVariationMutations(productId);

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEditMode && variation) {
      setFormData({
        sku: variation.sku,
        name: variation.name,
        unit: variation.unit || '',
        quantity: variation.quantity ?? 0,
        price: variation.price ?? 0,
        salePrice: variation.salePrice ?? variation.sale_price ?? undefined,
        importPrice: variation.importPrice ?? variation.import_price ?? undefined,
        taxRate: variation.taxRate ?? variation.tax_rate ?? undefined,
        maxPrice: variation.maxPrice ?? variation.max_price ?? undefined,
        minPrice: variation.minPrice ?? variation.min_price ?? undefined,
      });

      // Load existing images from file_urls if available
      // Note: FileUpload expects Asset[] format, but we need to show existing images
      // Since we can't directly convert URLs to Assets, we'll need a different approach
      // For now, existing images will be preserved on the backend
      const fileUrls = variation.fileUrls || variation.file_urls;
      const fileIds = variation.fileIds || variation.file_ids;
      console.log('[EditVariation] Full variation data:', JSON.stringify(variation, null, 2));
      console.log('[EditVariation] Existing file URLs:', fileUrls);
      console.log('[EditVariation] Existing file IDs:', fileIds);
    }
  }, [isEditMode, variation]);

  // Set status bar
  useStatusBarEffect('transparent', 'dark-content', true);

  const handleRemoveExistingImage = () => {
    Alert.alert(
      t('variations.edit.removeImageConfirmTitle'),
      t('variations.edit.removeImageConfirmMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('overview.deleteButton'),
          style: 'destructive',
          onPress: () => {
            setShouldRemoveExistingImage(true);
            console.log('[EditVariation] Marked existing image for removal');
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    // Validation
    if (!formData.sku.trim() || !formData.name.trim()) {
      Alert.alert(t('variations.error'), t('variations.edit.validationError'));
      return;
    }

    try {
      let uploadedFileIds: string[] = [];

      // Upload images if any
      if (imageFiles.length > 0 && storeId) {
        setIsUploadingImages(true);
        console.log('[EditVariation] Uploading images:', imageFiles.length);

        const uploadPromises = imageFiles.map((file) => {
          if (!file.uri || !file.type || !file.fileName) {
            throw new Error('Invalid file data');
          }
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
        console.log('[EditVariation] Upload results:', uploadResults);

        // Check if all uploads succeeded
        const failedUploads = uploadResults.filter((result) => !result.success);
        if (failedUploads.length > 0) {
          throw new Error('Some images failed to upload');
        }

        // Extract file IDs
        uploadedFileIds = uploadResults
          .filter((result) => result.data?.fileId)
          .map((result) => result.data!.fileId);

        console.log('[EditVariation] Uploaded file IDs:', uploadedFileIds);
        setIsUploadingImages(false);
      }

      // Prepare request data
      const requestData: any = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        unit: formData.unit?.trim() || undefined,
        quantity: formData.quantity || 0,
        price: formData.price || 0,
        salePrice: formData.salePrice || undefined,
        importPrice: formData.importPrice || undefined,
        taxRate: formData.taxRate || undefined,
        maxPrice: formData.maxPrice || undefined,
        minPrice: formData.minPrice || undefined,
      };

      // Handle file IDs based on removal and upload state
      if (shouldRemoveExistingImage) {
        // User wants to remove existing image
        if (uploadedFileIds.length > 0) {
          // Replace with new image
          requestData.fileIds = uploadedFileIds;
        } else {
          // Remove image entirely (pass empty array)
          requestData.fileIds = [];
        }
      } else if (uploadedFileIds.length > 0) {
        // Add new fileIds only if we have new uploads and not removing existing
        requestData.fileIds = uploadedFileIds;
      }
      // If not removing and no new uploads, don't include fileIds (keep existing)

      console.log('[EditVariation] Request data:', requestData);

      if (isEditMode && variationId) {
        await updateVariation.mutateAsync({
          variationId,
          data: requestData,
        });
        Alert.alert(t('variations.success'), t('variations.edit.updateSuccess'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createVariation.mutateAsync(requestData);
        Alert.alert(t('variations.success'), t('variations.edit.createSuccess'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.error('[EditVariation] Error:', error);
      Alert.alert(t('variations.error'), error.message || t('variations.edit.saveError'));
      setIsUploadingImages(false);
      setShouldRemoveExistingImage(false); // Reset flag on error
    }
  };

  const isSaving = isCreating || isUpdating || isUploadingImages;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <ScreenHeader
          title={isEditMode ? t('variations.edit.title') : t('variations.edit.createTitle')}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />

        {/* Form Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('variations.edit.basicInfo')}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('variations.edit.skuLabel')}</Text>
              <TextInput
                style={styles.input}
                value={formData.sku}
                onChangeText={(text) => setFormData({ ...formData, sku: text })}
                placeholder={t('variations.edit.skuPlaceholder')}
                placeholderTextColor={colors.text.secondary}
                editable={!isSaving}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('variations.edit.nameLabel')}</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder={t('variations.edit.namePlaceholder')}
                placeholderTextColor={colors.text.secondary}
                editable={!isSaving}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('variations.edit.unitLabel')}</Text>
              <TextInput
                style={styles.input}
                value={formData.unit}
                onChangeText={(text) => setFormData({ ...formData, unit: text })}
                placeholder={t('variations.edit.unitPlaceholder')}
                placeholderTextColor={colors.text.secondary}
                editable={!isSaving}
              />
            </View>
          </View>

          {/* Inventory & Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('variations.edit.inventoryPricing')}</Text>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('variations.edit.quantityLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.quantity || 0)}
                  onChangeText={(text) =>
                    setFormData({ ...formData, quantity: Number(text) || 0 })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.secondary}
                  editable={!isSaving}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('variations.edit.priceLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.price || 0)}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: Number(text) || 0 })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.secondary}
                  editable={!isSaving}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('variations.edit.salePriceLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.salePrice !== undefined ? String(formData.salePrice) : ''}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      salePrice: text ? Number(text) : undefined,
                    })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.secondary}
                  editable={!isSaving}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('variations.edit.importPriceLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.importPrice !== undefined ? String(formData.importPrice) : ''}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      importPrice: text ? Number(text) : undefined,
                    })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.secondary}
                  editable={!isSaving}
                />
              </View>
            </View>
          </View>

          {/* Advanced Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('variations.edit.advancedPricing')}</Text>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('variations.edit.minPriceLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.minPrice !== undefined ? String(formData.minPrice) : ''}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      minPrice: text ? Number(text) : undefined,
                    })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.secondary}
                  editable={!isSaving}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('variations.edit.maxPriceLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.maxPrice !== undefined ? String(formData.maxPrice) : ''}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      maxPrice: text ? Number(text) : undefined,
                    })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.secondary}
                  editable={!isSaving}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('variations.edit.taxRateLabel')}</Text>
              <TextInput
                style={styles.input}
                value={formData.taxRate !== undefined ? String(formData.taxRate) : ''}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    taxRate: text ? Number(text) : undefined,
                  })
                }
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={colors.text.secondary}
                editable={!isSaving}
              />
            </View>
          </View>

          {/* Image Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('variations.edit.images')}</Text>

            {(() => {
              const fileUrls = variation?.fileUrls || variation?.file_urls;
              const hasExistingImage = isEditMode && fileUrls && fileUrls.length > 0 && !shouldRemoveExistingImage;
              const hasNewImage = imageFiles.length > 0;

              // Show existing image if present and not marked for removal
              if (hasExistingImage && !hasNewImage) {
                return (
                  <View style={styles.imageDisplayContainer}>
                    <View style={styles.existingImagesRow}>
                      {fileUrls.map((url: string, index: number) => (
                        <View key={index} style={styles.existingImageItem}>
                          <Image
                            source={{ uri: url }}
                            style={styles.existingImage}
                            resizeMode="cover"
                          />
                          <Pressable
                            style={styles.deleteButton}
                            onPress={handleRemoveExistingImage}
                            hitSlop={8}
                          >
                            <Trash width={16} height={16} color="#FFFFFF" />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              }

              // Show file upload if no existing image, marked for removal, or for new variations
              if (!hasExistingImage || shouldRemoveExistingImage) {
                return (
                  <>
                    <FileUpload
                      label={t('variations.edit.imageLabel')}
                      files={imageFiles}
                      onFilesChange={setImageFiles}
                      maxFiles={1}
                      required={false}
                    />
                    {/* <Text style={styles.helperText}>
                      {shouldRemoveExistingImage
                        ? t('variations.edit.removeImageHelper')
                        : t('variations.edit.imageHelper')}
                    </Text> */}
                  </>
                );
              }

              return null;
            })()}
          </View>
        </ScrollView>

        {/* Sticky Save Button */}
        <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom }]}>
          <Pressable
            style={[styles.saveButtonBottom, isSaving && styles.saveButtonBottomDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.light} size="small" />
            ) : (
              <Text style={styles.saveButtonBottomText}>
                {t('variations.edit.save')}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  label: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
    backgroundColor: colors.light,
    textAlignVertical: 'center',
  },
  helperText: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  imageDisplayContainer: {
    marginBottom: spacing.md,
  },
  existingImagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  existingImageItem: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.light,
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'relative',
  },
  existingImage: {
    width: '100%',
    height: '100%',
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
  bottomButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.light,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButtonBottom: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonBottomDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  saveButtonBottomText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.light,
  },
});

export default EditVariationScreen;
