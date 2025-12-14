import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, TouchableOpacity, Keyboard } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Add01Icon, ArrowRight01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { colors, spacing, dimensions } from '@/shared/themes';
import { useCategories } from '../hooks/useCategories';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import { useTranslation } from '@/shared/hooks/useTranslation';
import BottomSheetFlatList from '@/shared/components/base/BottomSheetFlatList';
import SearchBar from '@/shared/components/SearchBar';
import type { RootStackParamList } from '@/navigation/types';
import type { CategoryResponse } from '../types/category';

// Storage for selected category after creation
let pendingCategorySelection: { id: string; name: string } | null = null;

// Function to set pending category selection (called from CategoryManagementScreen)
export const setPendingCategorySelection = (category: { id: string; name: string } | null) => {
  pendingCategorySelection = category;
};

// Function to get and clear pending category selection
export const consumePendingCategorySelection = () => {
  const selection = pendingCategorySelection;
  pendingCategorySelection = null;
  return selection;
};

interface CategorySelectorProps {
  label: string;
  placeholder: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  error?: string;
  containerStyle?: any;
}

const CREATE_NEW_CATEGORY_VALUE = '__CREATE_NEW__';

const CategorySelector: React.FC<CategorySelectorProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  containerStyle,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { storeData } = useStoreData();
  const { t } = useTranslation('product');
  const storeId = storeData?.id;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Fetch categories from API
  const {
    data: categoriesResponse,
    isLoading,
    refetch,
  } = useCategories({ page: 0, size: 100 }, {
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch too often
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Check for pending category selection when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const pendingCategory = consumePendingCategorySelection();
      if (pendingCategory) {
        onChange(pendingCategory.id);
        // Refetch categories to include the new one
        refetch();
      }
    }, [onChange, refetch])
  );

  // Convert API response to options with "Create New" at top
  const categoryOptions = React.useMemo(() => {
    const categories = categoriesResponse?.data?.content || [];

    // Filter by search query
    let filtered = categories;
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase();
      filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(q)
      );
    }

    // Create option items
    const options = filtered.map(cat => ({
      label: cat.name,
      value: cat.id,
      isCreateNew: false,
    }));

    // Always add "Create New Category" at the top
    return [
      {
        label: t('createNewCategory', 'Tạo danh mục mới'),
        value: CREATE_NEW_CATEGORY_VALUE,
        isCreateNew: true,
      },
      ...options,
    ];
  }, [categoriesResponse, debouncedQuery, t]);

  // Get display value
  const displayValue = React.useMemo(() => {
    if (!value) return undefined;
    const categories = categoriesResponse?.data?.content || [];
    const found = categories.find(cat => cat.id === value);
    return found?.name;
  }, [value, categoriesResponse]);

  const handleClose = () => {
    setQuery('');
    setOpen(false);
  };

  const handleOptionSelect = (optionValue: string) => {
    if (optionValue === CREATE_NEW_CATEGORY_VALUE) {
      handleClose();
      // Navigate to category management in select mode
      navigation.navigate('CategoryManagement', {
        selectMode: true,
        returnScreen: 'EditProduct',
      });
    } else {
      onChange(optionValue);
      handleClose();
    }
  };

  const renderItem = ({ item }: { item: { label: string; value: string; isCreateNew: boolean } }) => {
    const selected = item.value === value;

    if (item.isCreateNew) {
      return (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => handleOptionSelect(item.value)}
          style={styles.createNewItem}
        >
          <View style={styles.createNewIconContainer}>
            <HugeiconsIcon icon={Add01Icon} size={18} color={colors.primary} />
          </View>
          <Text variant="body" style={styles.createNewText}>{item.label}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={selected ? { selected: true } : undefined}
        onPress={() => handleOptionSelect(item.value)}
        style={styles.listItem}
      >
        <Text variant="body" style={{ flex: 1 }}>{item.label}</Text>
        {selected && (
          <HugeiconsIcon icon={Tick02Icon} size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="body" style={styles.emptyText}>
        {t('categoryEmpty', 'Không tìm thấy danh mục')}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text variant="subtitle" style={styles.label}>{label}</Text>}
      <TouchableOpacity
        onPress={() => {
          // Dismiss keyboard first, then open immediately
          Keyboard.dismiss();
          setOpen(true);
        }}
        style={[styles.field, error && styles.errorField]}
      >
        <Text
          variant="body"
          style={[styles.value, !displayValue && styles.placeholder]}
          numberOfLines={1}
        >
          {isLoading
            ? t('categoryLoading', 'Đang tải...')
            : displayValue || placeholder
          }
        </Text>
        <View style={[styles.chevronBox, { transform: [{ rotate: open ? '-90deg' : '90deg' }] }]}>
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={colors.text.secondary} />
        </View>
      </TouchableOpacity>

      {error ? (
        <Text variant="caption" style={styles.errorText}>{error}</Text>
      ) : null}

      {/* BottomSheetFlatList Dropdown */}
      <BottomSheetFlatList
        visible={open}
        onClose={handleClose}
        title={label || placeholder}
        testID="category-selector-sheet"
        data={categoryOptions}
        maxHeightRatio={0.8}
        fillToMaxHeight={true}
        keyExtractor={(item, index) => `${(item as any).value}-${index}`}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.searchContainer}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={t('categorySearchPlaceholder', 'Tìm danh mục')}
            />
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={24}
        windowSize={7}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginTop: spacing.xs,
    color: colors.text.primary,
  },
  field: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.light,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorField: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.danger,
  },
  value: {
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 16,
  },
  placeholder: {
    color: colors.text.secondary,
  },
  chevronBox: {
    width: 20,
    height: 20,
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
  },
  sep: {
    height: 1,
    backgroundColor: colors.mutedLine,
  },
  listItem: {
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  createNewItem: {
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  createNewIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  createNewText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default CategorySelector;
