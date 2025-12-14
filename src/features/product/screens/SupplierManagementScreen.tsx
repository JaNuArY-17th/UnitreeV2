import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions, typography } from '@/shared/themes';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import ScreenHeader from '@/shared/components/ScreenHeader';
import SearchBar from '@/shared/components/SearchBar';
import { Text } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Add01Icon, Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import BottomSheetModal from '@/shared/components/base/BottomSheetModal';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import { useInfiniteSuppliers } from '../hooks/useSuppliers';
import { useSupplierMutations } from '../hooks/useSupplierMutations';
import type { SupplierResponse, SupplierFormData } from '../types/supplier';

const SupplierManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation('product');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierResponse | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contactInfo: '',
  });

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchText]);

  // Determine if device is tablet (width > 768px)
  const { width } = Dimensions.get('window');
  const isTablet = width > 768;
  const maxHeightRatio = isTablet ? 0.65 : 0.85;

  // Get store data
  const { storeData, hasStore, isLoading: isLoadingStore } = useStoreData();
  const storeId = storeData?.id;

  // Use suppliers API hook
  const {
    data: suppliersResponse,
    isLoading: isLoadingSuppliers,
    error: suppliersError,
    refetch: refetchSuppliers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSuppliers({
    searchTerm: debouncedSearchText,
  }, {
    enabled: true,
  });

  // Use mutations
  const {
    createSupplier,
    updateSupplier,
    deleteSupplier,
    isMutating,
  } = useSupplierMutations();

  // Extract suppliers from API response
  const suppliers = useMemo(() => {
    return suppliersResponse?.pages?.flatMap((page: any) => page.data?.content || []) || [];
  }, [suppliersResponse]);

  // Loading and error states
  const loadingInitial = (isLoadingStore || isLoadingSuppliers) && !suppliersResponse;
  const loadingMore = isFetchingNextPage;
  const error = suppliersError ? 'Không thể tải danh sách nhà cung cấp' : null;

  // Set status bar
  useStatusBarEffect('transparent', 'dark-content', true);

  // Handlers
  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleCreatePress = () => {
    setEditingSupplier(null);
    setFormData({ name: '', contactInfo: '' });
    setIsModalVisible(true);
  };

  const handleEditPress = (supplier: SupplierResponse) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactInfo: supplier.contact_info || '',
    });
    setIsModalVisible(true);
  };

  const handleDeletePress = (supplier: SupplierResponse) => {
    Alert.alert(
      t('supplierDeleteConfirm', 'Xác nhận xóa'),
      t('supplierDeleteConfirmMessage', 'Bạn có chắc muốn xóa nhà cung cấp "{{name}}"?', { name: supplier.name }),
      [
        { text: t('supplierCancel', 'Hủy'), style: 'cancel' },
        {
          text: t('delete', 'Xóa'),
          style: 'destructive',
          onPress: () => handleDelete(supplier.id),
        },
      ]
    );
  };

  const handleDelete = async (supplierId: string) => {
    try {
      await deleteSupplier.mutateAsync(supplierId);
      Alert.alert(t('supplierDeleteSuccess', 'Thành công'), t('supplierDeleteSuccess', 'Đã xóa nhà cung cấp'));
    } catch (error: any) {
      Alert.alert(t('supplierDeleteError', 'Lỗi'), error.message || t('supplierDeleteError', 'Không thể xóa nhà cung cấp'));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t('supplierCreateError', 'Lỗi'), t('supplierNameRequired', 'Vui lòng nhập tên nhà cung cấp'));
      return;
    }

    try {
      if (editingSupplier) {
        // Update
        await updateSupplier.mutateAsync({
          supplierId: editingSupplier.id,
          data: {
            name: formData.name.trim(),
            contactInfo: formData.contactInfo?.trim() || undefined,
          },
        });
        Alert.alert(t('supplierUpdateSuccess', 'Thành công'), t('supplierUpdateSuccess', 'Đã cập nhật nhà cung cấp'));
      } else {
        // Create
        await createSupplier.mutateAsync({
          name: formData.name.trim(),
          contactInfo: formData.contactInfo?.trim() || undefined,
        });
        Alert.alert(t('supplierCreateSuccess', 'Thành công'), t('supplierCreateSuccess', 'Đã tạo nhà cung cấp mới'));
      }
      setIsModalVisible(false);
      setFormData({ name: '', contactInfo: '' });
      setEditingSupplier(null);
    } catch (error: any) {
      Alert.alert(t('supplierCreateError', 'Lỗi'), error.message || t('supplierCreateError', 'Không thể lưu nhà cung cấp'));
    }
  };

  const handleEndReached = () => {
    if (hasNextPage && !loadingMore && !loadingInitial) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetchSuppliers();
  };

  // Render functions
  const renderItem = ({ item }: { item: SupplierResponse }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.supplierName} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleEditPress(item)}
          >
            <HugeiconsIcon icon={Edit02Icon} size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeletePress(item)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={20} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderItemSeparator = () => <View style={{ height: spacing.md }} />;

  const renderEmptyComponent = () => {
    if (loadingInitial) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchText
            ? t('supplierNotFound', 'Không tìm thấy nhà cung cấp')
            : t('supplierEmpty', 'Chưa có nhà cung cấp')}
        </Text>
        <Text variant="caption" style={styles.emptySubtext}>
          {t('supplierEmptyHelper', 'Nhấn nút + để thêm nhà cung cấp mới')}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>{t('supplierLoading', 'Đang tải...')}</Text>
      </View>
    );
  };

  // Show store loading state
  if (isLoadingStore) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('supplierManagementTitle', 'Quản lý nhà cung cấp')} showBack={true} />
        <View style={styles.initialLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('supplierLoading', 'Đang tải...')}</Text>
        </View>
      </View>
    );
  }

  // Show no store warning
  if (!hasStore || !storeId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('supplierManagementTitle', 'Quản lý nhà cung cấp')} showBack={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t('supplierNoStore', 'Bạn chưa có cửa hàng. Vui lòng tạo cửa hàng trước.')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <VerificationRequiredOverlay>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <ScreenHeader title={t('supplierManagementTitle', 'Quản lý nhà cung cấp')} showBack={true} />

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder={t('supplierSearchPlaceholder', 'Tìm kiếm theo tên hoặc thông tin liên hệ...')}
          />
        </View>

        {/* Supplier List */}
        {loadingInitial ? (
          <View style={styles.initialLoader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t('supplierLoading', 'Đang tải...')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>{t('supplierRetry', 'Thử lại')}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={suppliers}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              suppliers.length === 0 && styles.emptyList,
            ]}
            ItemSeparatorComponent={renderItemSeparator}
            ListEmptyComponent={renderEmptyComponent}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={loadingInitial}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Floating Action Button */}
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
          onPress={handleCreatePress}
        >
          <HugeiconsIcon icon={Add01Icon} size={24} color={colors.light} />
        </Pressable>

        {/* Create/Edit Bottom Sheet */}
        <BottomSheetModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          maxHeightRatio={maxHeightRatio}
          fillToMaxHeight
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('supplierName', 'Tên nhà cung cấp')} *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder={t('supplierNamePlaceholder', 'Nhập tên nhà cung cấp')}
                  placeholderTextColor={colors.text.secondary}
                  maxLength={255}
                  autoFocus
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('contactInfo', 'Thông tin liên hệ')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.contactInfo}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, contactInfo: text }))}
                  placeholder={t('contactInfoPlaceholder', 'Nhập số điện thoại, email, địa chỉ...')}
                  placeholderTextColor={colors.text.secondary}
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                />
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsModalVisible(false)}
                  disabled={isMutating}
                >
                  <Text style={styles.cancelButtonText}>{t('supplierCancel', 'Hủy')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={isMutating}
                >
                  {isMutating ? (
                    <ActivityIndicator color={colors.light} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>{t('supplierSave', 'Lưu')}</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </BottomSheetModal>
      </View>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: dimensions.radius.lg,
    padding: spacing.md,
    paddingVertical: spacing.lg,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: dimensions.radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.subtitle,
    color: colors.primary,
  },
  cardInfo: {
    flex: 1,
  },
  supplierName: {
    ...typography.subtitle,
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  dateText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
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
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  initialLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.subtitle,
    color: colors.danger,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: dimensions.radius.md,
  },
  retryButtonText: {
    ...typography.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.light,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
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
  formContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.subtitle,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: dimensions.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    ...typography.body,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.light,
  },
});

export default SupplierManagementScreen;
