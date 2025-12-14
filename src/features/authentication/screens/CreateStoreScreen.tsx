import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar, Keyboard, TextInput, findNodeHandle, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors, FONT_WEIGHTS, getFontFamily, spacing } from '@/shared/themes';
import { Text, Button, Input, SelectField } from '@/shared/components/base';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import provincesData from '@/shared/types/province.json';
import wardsData from '@/shared/types/ward.json';
import { ScreenHeader } from '../../../shared/components';
import { storeService } from '../services/storeService';
import type { CreateStoreRequest } from '../types/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { STORE_QUERY_KEYS, setPersistedHasStore } from '../hooks/useStoreData';
import { useBankId } from '../hooks/useBankData';
import type { TaxCodeInfo } from '@/features/invoice';
import type { StoreType } from '../types/store';

type CreateStoreNav = NativeStackNavigationProp<RootStackParamList>;
type CreateStoreRoute = RouteProp<RootStackParamList, 'CreateStore'>;

interface Province {
  code: string;
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
}

interface Ward {
  code: string;
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  parent_code: string;
}

const CreateStoreScreen: React.FC = () => {
  const navigation = useNavigation<CreateStoreNav>();
  const route = useRoute<CreateStoreRoute>();
  const { t } = useTranslation('store');
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const bankId = useBankId();
  const { data: storeTypes, isLoading: isLoadingStoreTypes } = useQuery<StoreType[]>({
    queryKey: ['storeTypes'],
    queryFn: storeService.getStoreTypes,
  });
  const scrollViewRef = useRef<ScrollView>(null);

  // Get tax code and company info from route params
  const taxCode = route.params?.taxCode || '';
  const companyInfo: TaxCodeInfo | undefined = route.params?.companyInfo;
  const storeType = route.params?.storeType || 'business';

  // Debug: Log received params
  useEffect(() => {
    console.log('[CreateStoreScreen] Route params received:', {
      taxCode,
      companyInfo,
      storeType,
      hasCompanyInfo: !!companyInfo,
      companyInfoKeys: companyInfo ? Object.keys(companyInfo) : 'no companyInfo',
    });
  }, [taxCode, companyInfo, storeType]);

  // Form state
  const [storeName, setStoreName] = useState('');
  const [owner, setOwner] = useState(''); // Owner/representative field
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [detailAddress, setDetailAddress] = useState('');
  const [selectedStoreType, setSelectedStoreType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Touched state for validation on blur
  const [touched, setTouched] = useState({
    storeName: false,
    owner: false,
    province: false,
    ward: false,
    detailAddress: false,
    storeType: false,
  });

  // Validation errors
  const errors = {
    storeName: touched.storeName && !storeName.trim() ? t('error.required.storeName', 'Vui lòng nhập tên cửa hàng') : '',
    owner: touched.owner && !owner.trim() ? t('error.required.owner', 'Vui lòng nhập tên người đại diện') : '',
    province: touched.province && !selectedProvince ? t('error.required.province', 'Vui lòng chọn tỉnh/thành phố') : '',
    ward: touched.ward && !selectedWard ? t('error.required.ward', 'Vui lòng chọn quận/huyện') : '',
    detailAddress: touched.detailAddress && !detailAddress.trim() ? t('error.required.detailAddress', 'Vui lòng nhập địa chỉ chi tiết') : '',
    storeType: touched.storeType && !selectedStoreType.trim() ? t('error.required.storeType', 'Vui lòng chọn lĩnh vực kinh doanh') : '',
  };

  // Handle blur events
  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Pre-filled fields from tax code info (can be null)
  const companyName = companyInfo?.ten_cty || null;
  const companyAddress = companyInfo?.dia_chi || null;
  // Use owner input if provided, otherwise use data from tax code API
  const representative = owner.trim() || companyInfo?.nguoi_dai_dien || '';

  // Pre-fill form with company info when available
  useEffect(() => {
    if (companyInfo) {
      console.log('[CreateStoreScreen] Pre-filling form with company info:', companyInfo);

      // Pre-fill store name with company name
      if (companyInfo.ten_cty && !storeName) {
        setStoreName(companyInfo.ten_cty);
      }

      // Pre-fill owner with representative name
      if (companyInfo.nguoi_dai_dien && !owner) {
        setOwner(companyInfo.nguoi_dai_dien);
      }

      // Pre-fill address if available
      if (companyInfo.dia_chi && !detailAddress) {
        // Try to parse the address to extract detail address
        // The full address might be in format: "detail, ward, province"
        const addressParts = companyInfo.dia_chi.split(',').map(part => part.trim());
        if (addressParts.length > 0) {
          // Last part might be province, second to last might be ward
          // Everything else is detail address
          const detailParts: string[] = [];

          // Try to match province
          let matchedProvince: Province | null = null;
          for (let i = addressParts.length - 1; i >= 0; i--) {
            const part = addressParts[i];
            const province = provinces.find(p =>
              part.toLowerCase().includes(p.name.toLowerCase()) ||
              p.name.toLowerCase().includes(part.toLowerCase())
            );
            if (province) {
              matchedProvince = province;
              setSelectedProvince(province);
              // Everything before this is detail address
              detailParts.push(...addressParts.slice(0, i));
              break;
            }
          }

          // If no province matched, use the whole address as detail
          if (!matchedProvince && addressParts.length > 0) {
            detailParts.push(...addressParts);
          }

          if (detailParts.length > 0) {
            setDetailAddress(detailParts.join(', '));
          }
        }
      }
    }
  }, [companyInfo]);

  // Prepare dropdown data
  const provinces: Province[] = Object.values(provincesData);
  const [availableWards, setAvailableWards] = useState<Ward[]>([]);

  // Update available wards when province changes
  useEffect(() => {
    if (selectedProvince) {
      const wards: Ward[] = Object.values(wardsData).filter(
        (ward: any) => ward.parent_code === selectedProvince.code
      );
      setAvailableWards(wards);
      // Reset ward selection when province changes
      setSelectedWard(null);
    } else {
      setAvailableWards([]);
      setSelectedWard(null);
    }
  }, [selectedProvince]);

  const provinceOptions = provinces.map(province => ({
    label: province.name,
    value: province.code,
    data: province,
  }));

  const wardOptions = availableWards.map(ward => ({
    label: ward.name,
    value: ward.code,
    data: ward,
  }));

  // Business line options from API
  const businessLineOptions = useMemo(() => {
    if (!storeTypes) return [];
    return storeTypes.map(type => ({
      label: type.description,
      value: type.id.toString(),
    }));
  }, [storeTypes]);

  const handleProvinceSelect = (value: string) => {
    const province = provinces.find(p => p.code === value);
    setSelectedProvince(province || null);
  };

  const handleWardSelect = (value: string) => {
    const ward = availableWards.find(w => w.code === value);
    setSelectedWard(ward || null);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!storeName.trim() || !owner.trim() || !selectedProvince || !selectedWard || !detailAddress.trim() || !selectedStoreType.trim()) {
      Alert.alert(
        t('error.title', 'Lỗi'),
        t('error.missingFields', 'Vui lòng điền đầy đủ thông tin bắt buộc (bao gồm người đại diện)'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[CreateStoreScreen] Creating store:', {
        name: storeName,
        taxCode,
        province: selectedProvince,
        ward: selectedWard,
        detailAddress,
        storeType: selectedStoreType,
        businessType: storeType === 'business' ? 'COMPANY' : 'INDIVIDUAL',
        // Company info from tax code API
        companyName,
        companyAddress,
        representative,
      });

      // Create store request payload
      const createStoreRequest: CreateStoreRequest = {
        name: storeName.trim(),
        taxCode: taxCode,
        companyName: companyName, // From tax code API
        companyAddress: companyAddress, // From tax code API
        representative: representative, // From tax code API
        addressProvince: selectedProvince.name,
        addressWard: selectedWard.name,
        addressDetail: detailAddress.trim(),
        type: selectedStoreType,
        businessType: storeType === 'business' ? 'COMPANY' : 'INDIVIDUAL',
        bankId: bankId, // From cached bank data
      };

      // Call create store API
      const response = await storeService.createStore(createStoreRequest);

      console.log('[CreateStoreScreen] Store created successfully:', response);

      // Fetch updated store data and update cache
      try {
        const updatedStoreData = await storeService.getStoreData();
        console.log('[CreateStoreScreen] Updated store data fetched:', updatedStoreData);

        // Update cache with fresh data
        queryClient.setQueryData(STORE_QUERY_KEYS.storeData(), updatedStoreData);

        // Update AsyncStorage hasStore flag
        const hasStore = updatedStoreData.success === true;
        await setPersistedHasStore(hasStore);
        console.log('[CreateStoreScreen] Updated hasStore in AsyncStorage:', hasStore);

        // Invalidate hasStoreFromStorage query to pick up new value
        await queryClient.invalidateQueries({ queryKey: ['store', 'hasStoreFromStorage'] });

        // Also invalidate other store-related queries
        await queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEYS.hasStore() });
      } catch (cacheError) {
        console.warn('[CreateStoreScreen] Failed to update store cache:', cacheError);
        // Fallback: invalidate all store queries to force refetch
        await queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEYS.all });
      }

      // Navigate to upload business license screen with store ID
      navigation.navigate('UploadBusinessLicense', { storeId: response.data.id });
    } catch (error: any) {
      console.error('[CreateStoreScreen] Store creation error:', error);

      // Extract error message from API response
      const errorMessage = error?.message ||
        error?.response?.data?.message ||
        t('error.message', 'Đã xảy ra lỗi khi tạo cửa hàng. Vui lòng thử lại.');

      // Show error alert with actual API error message
      Alert.alert(
        t('error.title', 'Lỗi tạo cửa hàng'),
        errorMessage,
        [
          {
            text: t('common.retry', 'Thử lại'),
            onPress: () => setIsSubmitting(false),
          },
          {
            text: t('common.cancel', 'Hủy'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClose = () => navigation.goBack();

  useStatusBarEffect('transparent', 'dark-content', true);

  const isFormValid = storeName.trim() && owner.trim() && selectedProvince && selectedWard && detailAddress.trim() && selectedStoreType.trim();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <ScreenHeader title={t('createStore.formTitle', 'Thông tin cửa hàng')} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>


            <View style={styles.field}>
              <Text style={styles.label}>
                {t('createStore.fields.name', 'Tên cửa hàng')} <Text style={styles.required}>*</Text>
              </Text>
              {companyInfo?.ten_cty && (
                <Text style={styles.helperText}>
                  {t('createStore.helpers.prefilledFromTaxCode', 'Tự động điền từ mã số thuế')}
                </Text>
              )}
              <Input
                value={storeName}
                onChangeText={setStoreName}
                placeholder={t('createStore.placeholders.name', 'Nhập tên cửa hàng')}
                style={styles.input}
                error={errors.storeName}
                onBlur={() => handleBlur('storeName')}
                onFocus={(e) => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }, 100);
                }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                {t('createStore.fields.owner', 'Người đại diện')} <Text style={styles.required}>*</Text>
              </Text>
              {companyInfo?.nguoi_dai_dien && (
                <Text style={styles.helperText}>
                  {t('createStore.helpers.prefilledFromTaxCode', 'Tự động điền từ mã số thuế')}
                </Text>
              )}

              <Input
                value={owner}
                onChangeText={setOwner}
                placeholder={t('createStore.placeholders.owner', 'Nhập tên người đại diện')}
                style={styles.input}
                error={errors.owner}
                onBlur={() => handleBlur('owner')}
                onFocus={(e) => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 80, animated: true });
                  }, 100);
                }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                {t('createStore.fields.province', 'Tỉnh/Thành phố')} <Text style={styles.required}>*</Text>
              </Text>
              <SelectField
                options={provinceOptions}
                placeholder={t('createStore.placeholders.province', 'Chọn tỉnh/thành phố')}
                value={selectedProvince?.code}
                onChange={handleProvinceSelect}
                style={styles.dropdown}
                error={errors.province}
                onBlur={() => handleBlur('province')}
                searchPlaceholder={t('createStore.placeholders.searchProvince', 'Tìm kiếm tỉnh/thành phố')}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                {t('createStore.fields.ward', 'Quận/Huyện')} <Text style={styles.required}>*</Text>
              </Text>
              <SelectField
                options={wardOptions}
                placeholder={
                  selectedProvince
                    ? t('createStore.placeholders.ward', 'Chọn quận/huyện')
                    : t('createStore.placeholders.selectProvinceFirst', 'Vui lòng chọn tỉnh/thành phố trước')
                }
                value={selectedWard?.code}
                onChange={handleWardSelect}
                disabled={!selectedProvince}
                style={styles.dropdown}
                error={errors.ward}
                onBlur={() => handleBlur('ward')}
                searchPlaceholder={t('createStore.placeholders.searchWard', 'Tìm kiếm quận/huyện')}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                {t('createStore.fields.detailAddress', 'Địa chỉ chi tiết')} <Text style={styles.required}>*</Text>
              </Text>
              {companyInfo?.dia_chi && (
                <Text style={styles.helperText}>
                  {t('createStore.helpers.prefilledFromTaxCode', 'Tự động điền từ mã số thuế')}
                </Text>
              )}
              <Input
                value={detailAddress}
                onChangeText={setDetailAddress}
                placeholder={t('createStore.placeholders.detailAddress', 'Nhập địa chỉ chi tiết')}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
                error={errors.detailAddress}
                onBlur={() => handleBlur('detailAddress')}
                onFocus={(e) => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 350, animated: true });
                  }, 100);
                }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                {t('createStore.fields.businessLine', 'Lĩnh vực kinh doanh')} <Text style={styles.required}>*</Text>
              </Text>
              <SelectField
                options={businessLineOptions}
                placeholder={
                  isLoadingStoreTypes
                    ? t('createStore.placeholders.loadingBusinessLine', 'Đang tải...')
                    : t('createStore.placeholders.businessLine', 'Chọn lĩnh vực kinh doanh')
                }
                value={selectedStoreType}
                onChange={setSelectedStoreType}
                disabled={isLoadingStoreTypes}
                style={styles.dropdown}
                error={errors.storeType}
                onBlur={() => handleBlur('storeType')}
                searchPlaceholder={t('createStore.placeholders.searchBusinessLine', 'Tìm kiếm lĩnh vực kinh doanh')}
              />
            </View>

            <Button
              label={
                isSubmitting
                  ? t('creating', 'Đang tạo...')
                  : t('createStore.submit', 'Tạo cửa hàng')
              }
              size="lg"
              onPress={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              style={styles.submitButton}
            />

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    textAlign: 'center'
  },
  headerSpacer: { width: 24 },
  scrollContainer: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  form: { gap: spacing.sm },
  field: { marginBottom: spacing.md },
  infoBanner: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoBannerBusiness: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  infoBannerPersonal: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  infoBannerText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.danger,
  },
  helperText: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.success,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  input: {

  },
  readOnlyInput: {
    backgroundColor: colors.background,
    opacity: 0.7,
  },
  textArea: {
  },
  dropdown: {
  },
  submitButton: {
    width: '100%',
    marginTop: spacing.xl,
  },
});

export default CreateStoreScreen;
