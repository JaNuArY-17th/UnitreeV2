import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon, Edit02Icon, Delete02Icon, Add01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, typography, dimensions } from '@/shared/themes';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import { useCategories } from '../hooks/useCategories';
import { useCategoryMutations } from '../hooks/useCategoryMutations';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { setPendingCategorySelection } from '../components/CategorySelector';
import type { RootStackParamList } from '@/navigation/types';
import type { CategoryResponse } from '../types/category';

type CategoryManagementScreenRouteProp = RouteProp<RootStackParamList, 'CategoryManagement'>;
type CategoryManagementScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryManagement'>;

const CategoryManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CategoryManagementScreenNavigationProp>();
  const route = useRoute<CategoryManagementScreenRouteProp>();
  const { storeData } = useStoreData();
  const { t } = useTranslation('product');
  const storeId = storeData?.id;

  // Check if we're in select mode (came from CategorySelector)
  const selectMode = route.params?.selectMode ?? false;
  const returnScreen = route.params?.returnScreen;

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Set status bar
  useStatusBarEffect('transparent', 'dark-content', true);

  // Fetch categories
  const {
    data: categoriesResponse,
    isLoading,
    refetch,
  } = useCategories({ page: 0, size: 100 }, {
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutations
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    isMutating,
  } = useCategoryMutations();

  const categories = useMemo(() => {
    return categoriesResponse?.data?.content || [];
  }, [categoriesResponse]);

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setInputValue('');
  };

  const handleStartEdit = (category: CategoryResponse) => {
    setEditingId(category.id);
    setIsCreating(false);
    setInputValue(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setInputValue('');
  };

  const handleCreate = async () => {
    if (!inputValue.trim()) {
      Alert.alert(t('categoryNameRequired', 'Lỗi'), t('categoryNameRequiredMessage', 'Vui lòng nhập tên danh mục'));
      return;
    }

    try {
      const result = await createCategory.mutateAsync({
        name: inputValue.trim(),
      });

      // If in select mode, set the pending selection and go back
      if (selectMode && result?.data) {
        setPendingCategorySelection({
          id: result.data.id,
          name: result.data.name,
        });
        Alert.alert(
          t('categoryCreateSuccess', 'Thành công'),
          t('categoryCreatedAndSelected', 'Đã tạo và chọn danh mục mới'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(t('categoryCreateSuccess', 'Thành công'), t('categoryCreatedMessage', 'Đã tạo danh mục mới'));
        setIsCreating(false);
        setInputValue('');
      }
    } catch (error: any) {
      Alert.alert(t('categoryCreateError', 'Lỗi'), error.message || t('categoryCreateErrorMessage', 'Không thể tạo danh mục'));
    }
  };

  const handleUpdate = async (categoryId: string) => {
    if (!inputValue.trim()) {
      Alert.alert(t('categoryNameRequired', 'Lỗi'), t('categoryNameRequiredMessage', 'Vui lòng nhập tên danh mục'));
      return;
    }

    try {
      await updateCategory.mutateAsync({
        categoryId,
        data: {
          name: inputValue.trim(),
        },
      });

      Alert.alert(t('categoryUpdateSuccess', 'Thành công'), t('categoryUpdatedMessage', 'Đã cập nhật danh mục'));
      setEditingId(null);
      setInputValue('');
    } catch (error: any) {
      Alert.alert(t('categoryUpdateError', 'Lỗi'), error.message || t('categoryUpdateErrorMessage', 'Không thể cập nhật danh mục'));
    }
  };

  const handleDelete = (category: CategoryResponse) => {
    Alert.alert(
      t('categoryDeleteConfirm', 'Xác nhận xóa'),
      t('categoryDeleteConfirmMessage', 'Bạn có chắc muốn xóa danh mục "{{name}}"?').replace('{{name}}', category.name),
      [
        { text: t('cancel', 'Hủy'), style: 'cancel' },
        {
          text: t('delete', 'Xóa'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory.mutateAsync(category.id);
              Alert.alert(t('categoryDeleteSuccess', 'Thành công'), t('categoryDeletedMessage', 'Đã xóa danh mục'));
            } catch (error: any) {
              Alert.alert(t('categoryDeleteError', 'Lỗi'), error.message || t('categoryDeleteErrorMessage', 'Không thể xóa danh mục'));
            }
          },
        },
      ]
    );
  };

  // Handle selecting an existing category (in select mode)
  const handleSelectCategory = (category: CategoryResponse) => {
    if (selectMode) {
      setPendingCategorySelection({
        id: category.id,
        name: category.name,
      });
      navigation.goBack();
    }
  };

  const renderItem = ({ item }: { item: CategoryResponse }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={styles.itemContainer}>
        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.editInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={t('categoryNamePlaceholder', 'Tên danh mục')}
              placeholderTextColor={colors.text.secondary}
              autoFocus
            />
            <Pressable
              style={styles.iconButton}
              onPress={() => handleUpdate(item.id)}
              disabled={isMutating}
            >
              <HugeiconsIcon icon={Tick02Icon} size={20} color={colors.success} />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={handleCancelEdit}
              disabled={isMutating}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} color={colors.danger} />
            </Pressable>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.itemRow}
            onPress={() => selectMode && handleSelectCategory(item)}
            disabled={!selectMode}
            activeOpacity={selectMode ? 0.7 : 1}
          >
            <Text style={styles.itemText} numberOfLines={1}>
              {item.name}
            </Text>
            {!selectMode && (
              <View style={styles.actionButtons}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => handleStartEdit(item)}
                >
                  <HugeiconsIcon icon={Edit02Icon} size={18} color={colors.primary} />
                </Pressable>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => handleDelete(item)}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={18} color={colors.danger} />
                </Pressable>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.emptyText}>{t('categoryLoading', 'Đang tải...')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('categoryEmptyTitle', 'Chưa có danh mục')}</Text>
        <Text style={styles.emptySubtext}>{t('categoryEmptyHelper', 'Nhấn nút + để tạo danh mục mới')}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ScreenHeader
        title={selectMode
          ? t('categorySelectTitle', 'Chọn danh mục')
          : t('categoryManagementTitle', 'Quản lý danh mục')
        }
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Create Input - Moved outside FlatList to prevent re-render focus loss */}
        {isCreating && (
          <View style={styles.createContainerFixed}>
            <TextInput
              style={styles.createInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={t('categoryNewNamePlaceholder', 'Tên danh mục mới')}
              placeholderTextColor={colors.text.secondary}
              autoFocus
            />
            <Pressable
              style={[styles.createButton, isMutating && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={isMutating}
            >
              {isMutating ? (
                <ActivityIndicator color={colors.light} size="small" />
              ) : (
                <Text style={styles.createButtonText}>{t('categoryCreate', 'Tạo')}</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Category List */}
        <FlatList
          style={styles.list}
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            categories.length === 0 && styles.emptyList,
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>

      {/* Floating Action Button */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
        onPress={handleStartCreate}
      >
        <HugeiconsIcon icon={Add01Icon} size={24} color={colors.light} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  keyboardView: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.subtitle,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  createContainerFixed: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.light,
  },
  createContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  createInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background,
    textAlignVertical: 'center',
  },
  createButton: {
    paddingHorizontal: spacing.lg,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: dimensions.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    ...typography.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.light,
  },
  itemContainer: {
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.lg,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingVertical: spacing.lg,
  },
  itemText: {
    flex: 1,
    ...typography.subtitle,
    fontSize: 15,
    color: colors.text.primary,
    marginRight: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  editInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.light,
    textAlignVertical: 'center',
  },
  separator: {
    height: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default CategoryManagementScreen;
