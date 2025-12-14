import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, dimensions } from '@/shared/themes';
import typographyStyles from '@/shared/themes/typography';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { Text, Input, Checkbox } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import CategorySelector from '../components/CategorySelector';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import { useProduct } from '../hooks/useProduct';
import { useCategories } from '../hooks/useCategories';
import { useProductMutations } from '../hooks/useProductMutations';
import { InfoIcon } from '@/shared/assets/icons';
import type { RootStackParamList } from '@/navigation/types';

type EditProductScreenRouteProp = RouteProp<RootStackParamList, 'EditProduct'>;
type EditProductScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProduct'>;

const EditProductScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<EditProductScreenNavigationProp>();
  const route = useRoute<EditProductScreenRouteProp>();
  const { t } = useTranslation('product');
  const { productId } = route.params || {};
  const isCreateMode = !productId;

  // Get store data
  const { storeData } = useStoreData();
  const storeId = storeData?.id;

  // Fetch product data if editing
  const {
    data: productResponse,
    isLoading: isLoadingProduct,
  } = useProduct(productId || '', {
    enabled: !!productId && !isCreateMode,
  });

  // Fetch categories to find ID from name
  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
  } = useCategories({ page: 0, size: 100 }, {
    enabled: !isCreateMode && !!productId,
  });

  // Product mutations
  const {
    createProduct,
    updateProduct,
    isCreating,
    isUpdating,
  } = useProductMutations();

  // Form state
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [hasVariation, setHasVariation] = useState(false);
  const [currency, setCurrency] = useState('VND');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dirty state tracking
  const [isDirty, setIsDirty] = useState(false);

  // Set status bar
  useStatusBarEffect('transparent', 'dark-content', true);

  // Load product data from API
  useEffect(() => {
    if (!isCreateMode && productResponse?.data) {
      const product = productResponse.data;
      setName(product.name);

      // Find category ID by matching category name
      if (product.category_name && categoriesResponse?.data?.content) {
        const foundCategory = categoriesResponse.data.content.find(
          cat => cat.name === product.category_name
        );
        if (foundCategory) {
          setCategoryId(foundCategory.id);
        }
      }

      setDescription(product.description || '');
      setHasVariation(product.has_variation || false);
      setCurrency(product.currency || 'VND');
    }
  }, [productResponse, categoriesResponse, isCreateMode]);

  // Mark as dirty when any field changes (only in edit mode)
  useEffect(() => {
    if (!isCreateMode) {
      setIsDirty(true);
    }
  }, [isCreateMode, name, categoryId, description, hasVariation, currency]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('required', 'Bắt buộc');
    }

    if (isCreateMode && !categoryId) {
      newErrors.categoryId = t('required', 'Bắt buộc');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert(
        t('validationError', 'Vui lòng kiểm tra lại thông tin'),
        t('validationErrorMessage', 'Có một số trường bắt buộc chưa được điền'),
      );
      return;
    }

    if (!storeId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin cửa hàng');
      return;
    }

    try {
      if (isCreateMode) {
        // For create, categoryId is required
        if (!categoryId) {
          Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
          return;
        }

        await createProduct.mutateAsync({
          name: name.trim(),
          categoryId,
          description: description.trim() || undefined,
          currency: currency || undefined,
          hasVariation,
        });
        Alert.alert(
          t('createSuccess', 'Tạo sản phẩm thành công'),
          '',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else if (productId) {
        // For update, all fields are optional
        await updateProduct.mutateAsync({
          productId,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
            categoryId: categoryId || undefined,
            currency: currency || undefined,
            hasVariation,
          },
        });
        Alert.alert(
          t('saveSuccess', 'Lưu sản phẩm thành công'),
          '',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    } catch (error: any) {
      Alert.alert(
        isCreateMode
          ? t('createError', 'Tạo sản phẩm thất bại')
          : t('saveError', 'Lưu sản phẩm thất bại'),
        error.message || t('saveErrorMessage', 'Đã có lỗi xảy ra, vui lòng thử lại'),
      );
    }
  };

  // Handle back with unsaved changes
  const handleBack = () => {
    if (!isCreateMode && isDirty) {
      Alert.alert(
        t('unsavedChanges', 'Bạn có thay đổi chưa lưu'),
        t('unsavedChangesMessage', 'Bạn có muốn thoát?'),
        [
          { text: t('cancel', 'Hủy'), style: 'cancel' },
          { text: t('exit', 'Thoát'), onPress: () => navigation.goBack() },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  const isSaving = isCreating || isUpdating;
  const isLoadingData = isLoadingProduct || isLoadingCategories;

  // Show loading state when fetching product
  if (isLoadingData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={t('editTitle', 'Chỉnh sửa sản phẩm')}
          showBack={true}
          onBackPress={handleBack}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ScreenHeader
        title={isCreateMode ? t('createTitle', 'Tạo sản phẩm mới') : t('editTitle', 'Chỉnh sửa sản phẩm')}
        showBack={true}
        onBackPress={handleBack}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Thông tin cơ bản */}
          <View style={styles.section}>
            <Input
              label={`${t('productName', 'Tên sản phẩm')} *`}
              value={name}
              onChangeText={setName}
              placeholder={t('productNamePlaceholder', 'Nhập tên sản phẩm')}
              error={errors.name}
              containerStyle={styles.fieldSpacing}
            />

            <CategorySelector
              label={`${t('category', 'Danh mục')}${isCreateMode ? ' *' : ''}`}
              placeholder={t('selectCategory', 'Chọn danh mục')}
              value={categoryId}
              onChange={setCategoryId}
              error={errors.categoryId}
              containerStyle={styles.fieldSpacing}
            />
          </View>

          {/* Mô tả */}
          {/* <View style={styles.section}>
            <Input
              label={t('description', 'Mô tả sản phẩm')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('descriptionPlaceholder', 'Nhập mô tả sản phẩm')}
              multiline
              numberOfLines={4}
              inputContainerStyle={styles.multilineInputContainer}
              style={styles.multilineInputText}
            />
          </View> */}

          {/* Có biến thể */}
          <View style={styles.section}>
            <Checkbox
              value={hasVariation}
              onChange={setHasVariation}
              label={t('hasVariation', 'Sản phẩm có biến thể')}
            />
            {hasVariation && (
              <Text style={styles.helperText}>
                {t('hasVariationHelper', 'Bạn có thể thêm các biến thể (màu sắc, kích thước...) sau khi tạo sản phẩm')}
              </Text>
            )}
          </View>

          {/* <View style={styles.infoBox}>
            <InfoIcon width={16} height={16} color={colors.primary} />
            <Text style={styles.infoText}>
              {t('productInfoNote', 'Sau khi tạo sản phẩm, bạn có thể thêm biến thể và quản lý tồn kho chi tiết hơn.')}
            </Text>
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>

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
              {t('save', 'Lưu')}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
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
  },
  sectionTitle: {
    ...typographyStyles.title,
    marginBottom: spacing.md,
  },
  fieldSpacing: {
    marginBottom: spacing.md,
  },
  multilineInputContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: 'white',
  },
  multilineInputText: {
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  helperText: {
    ...typographyStyles.caption,
    marginLeft: spacing.xl + spacing.sm,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: dimensions.radius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    ...typographyStyles.bodySmall,
    color: colors.primary,
    lineHeight: 20,
    flex: 1,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typographyStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  saveButton: {
    ...typographyStyles.body,
    color: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
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
    borderRadius: dimensions.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonBottomDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  saveButtonBottomText: {
    ...typographyStyles.body,
    color: colors.light,
  },
});

export default EditProductScreen;
