import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
  TextInput,
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
import { Add01Icon, Delete02Icon, Edit02Icon, Location01Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import BottomSheetModal from '@/shared/components/base/BottomSheetModal';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import { useLocations } from '../hooks/useLocations';
import { useLocationMutations } from '../hooks/useLocationMutations';
import type { LocationResponse, LocationFormData } from '../types/location';

const LocationManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation('product');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationResponse | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    description: '',
  });

  const { width } = Dimensions.get('window');
  const isTablet = width > 768;
  const maxHeightRatio = isTablet ? 0.65 : 0.85;

  // Get store data
  const { storeData, hasStore, isLoading: isLoadingStore } = useStoreData();
  const storeId = storeData?.id;

  // Use locations API hook
  const {
    data: locationsResponse,
    isLoading: isLoadingLocations,
    error: locationsError,
    refetch: refetchLocations,
  } = useLocations({ page, size: 20, searchTerm: searchText.trim() || undefined }, {
    enabled: true,
  });

  // Use mutations
  const {
    createLocation,
    updateLocation,
    deleteLocation,
    isMutating,
  } = useLocationMutations();

  // Extract locations from API response
  const locations = useMemo(() => {
    return locationsResponse?.data?.content || [];
  }, [locationsResponse]);

  const pagination = locationsResponse?.data;
  const hasMore = pagination?.has_next || false;

  // Loading and error states
  const loadingInitial = (isLoadingStore || isLoadingLocations) && page === 0;
  const loadingMore = isLoadingLocations && page > 0;
  const error = locationsError ? 'Không thể tải danh sách vị trí kho' : null;

  // Set status bar
  useStatusBarEffect('transparent', 'dark-content', true);

  // Handlers
  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleCreatePress = () => {
    setEditingLocation(null);
    setFormData({ name: '', description: '' });
    setIsModalVisible(true);
  };

  const handleEditPress = (location: LocationResponse) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description || '',
    });
    setIsModalVisible(true);
  };

  const handleDeletePress = (location: LocationResponse) => {
    Alert.alert(
      t('locationDeleteConfirm', 'Xác nhận xóa'),
      t('locationDeleteConfirmMessage', 'Bạn có chắc muốn xóa vị trí kho "{{name}}"?', { name: location.name }),
      [
        { text: t('locationCancel', 'Hủy'), style: 'cancel' },
        {
          text: t('delete', 'Xóa'),
          style: 'destructive',
          onPress: () => handleDelete(location.id),
        },
      ]
    );
  };

  const handleDelete = async (locationId: string) => {
    try {
      await deleteLocation.mutateAsync(locationId);
      Alert.alert(t('locationDeleteSuccess', 'Thành công'), t('locationDeleteSuccess', 'Đã xóa vị trí kho'));
    } catch (error: any) {
      Alert.alert(t('locationDeleteError', 'Lỗi'), error.message || t('locationDeleteError', 'Không thể xóa vị trí kho'));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t('locationCreateError', 'Lỗi'), t('locationNameRequired', 'Vui lòng nhập tên vị trí kho'));
      return;
    }

    try {
      if (editingLocation) {
        // Update
        await updateLocation.mutateAsync({
          locationId: editingLocation.id,
          data: {
            name: formData.name.trim(),
            description: formData.description?.trim() || undefined,
          },
        });
        Alert.alert(t('locationUpdateSuccess', 'Thành công'), t('locationUpdateSuccess', 'Đã cập nhật vị trí kho'));
      } else {
        // Create
        await createLocation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
        });
        Alert.alert(t('locationCreateSuccess', 'Thành công'), t('locationCreateSuccess', 'Đã tạo vị trí kho mới'));
      }
      setIsModalVisible(false);
      setFormData({ name: '', description: '' });
      setEditingLocation(null);
    } catch (error: any) {
      Alert.alert(t('locationCreateError', 'Lỗi'), error.message || t('locationCreateError', 'Không thể lưu vị trí kho'));
    }
  };

  const handleEndReached = () => {
    if (hasMore && !loadingMore && !loadingInitial) {
      setPage(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    setPage(0);
    refetchLocations();
  };

  // Render functions
  const renderItem = ({ item }: { item: LocationResponse }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <HugeiconsIcon icon={Location01Icon} size={24} color={colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.locationName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
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
            ? t('locationNotFound', 'Không tìm thấy vị trí kho')
            : t('locationEmpty', 'Chưa có vị trí kho')}
        </Text>
        <Text variant="caption" style={styles.emptySubtext}>
          {t('locationEmptyHelper', 'Nhấn nút + để thêm vị trí kho mới')}
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
        <ScreenHeader title="Quản lý vị trí kho" showBack={true} />
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
        <ScreenHeader title="Quản lý vị trí kho" showBack={true} />
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
        <ScreenHeader title={t('locationManagementTitle', 'Quản lý vị trí kho')} showBack={true} />

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder={t('locationSearchPlaceholder', 'Tìm kiếm theo tên hoặc mô tả...')}
          />
        </View>

        {/* Location List */}
        {loadingInitial ? (
          <View style={styles.initialLoader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>{t('retry')}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={locations}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              locations.length === 0 && styles.emptyList,
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
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('locationName', 'Tên vị trí kho')} *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder={t('locationNamePlaceholder', 'Nhập tên vị trí kho (VD: Kho A, Tầng 1, Kệ B1...)')}
                placeholderTextColor={colors.text.secondary}
                maxLength={255}
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('locationDescription', 'Mô tả')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder={t('locationDescriptionPlaceholder', 'Nhập mô tả về vị trí kho...')}
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
                <Text style={styles.cancelButtonText}>{t('locationCancel', 'Hủy')}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isMutating}
              >
                {isMutating ? (
                  <ActivityIndicator color={colors.light} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('locationSave', 'Lưu')}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </BottomSheetModal>
      </View>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: dimensions.radius.xl,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  locationName: {
    ...typography.subtitle,
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    fontSize: 13,
    color: colors.text.secondary,
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

export default LocationManagementScreen;
