import React, { useState } from 'react';
import { Pressable, StyleSheet, View, Alert, StatusBar, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { Heading, Text, Button, Input } from '@/shared/components/base';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { Close, Shop } from '@/shared/assets/icons';
import { CreateStorePhoto } from '../../../shared/assets';
import { useUserData } from '@/features/profile/hooks/useUserData';

type CreateStoreNav = NativeStackNavigationProp<RootStackParamList>;

type StoreType = 'business' | 'personal' | null;

const CreateStoreStartScreen: React.FC = () => {
  const navigation = useNavigation<CreateStoreNav>();
  const { t } = useTranslation('authentication');
  const [isProcessing, setIsProcessing] = useState(false);
  const [storeType, setStoreType] = useState<StoreType>(null);
  const [taxCode, setTaxCode] = useState('');
  const [shouldLookup, setShouldLookup] = useState(false);
  const insets = useSafeAreaInsets();
  const { data: userData } = useUserData();

  const onContinue = async () => {
    if (isProcessing) return;

    // Validate store type selection
    if (!storeType) {
      Alert.alert(
        t('store.error.title', 'Lỗi'),
        t('store.error.storeTypeRequired', 'Vui lòng chọn loại cửa hàng'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    // If personal store, use identification_number from userData
    if (storeType === 'personal') {
      if (!userData?.identification_number) {
        Alert.alert(
          t('store.error.title', 'Lỗi'),
          t('store.error.identificationRequired', 'Không tìm thấy số CCCD. Vui lòng hoàn tất xác thực eKYC trước.'),
          [{ text: t('common.ok', 'OK') }]
        );
        return;
      }

      // Navigate directly to CreateStore with identification_number as taxCode
      console.log('[CreateStoreStartScreen] Personal store selected, using identification_number:', userData.identification_number);
      navigation.navigate('CreateStore', {
        taxCode: userData.identification_number,
        storeType: 'personal',
      });
      return;
    }

    // For business, validate tax code
    if (!taxCode.trim()) {
      Alert.alert(
        t('store.error.title', 'Lỗi'),
        t('store.error.taxCodeRequired', 'Vui lòng nhập mã số thuế'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    // Simple validation: tax code should be 10 or 13 digits
    const taxCodePattern = /^\d{10}(-\d{3})?$/;
    if (!taxCodePattern.test(taxCode.trim())) {
      Alert.alert(
        t('store.error.title', 'Lỗi'),
        t('store.error.invalidTaxCode', 'Mã số thuế không hợp lệ. Vui lòng nhập 10 hoặc 13 chữ số'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    setIsProcessing(true);
    setShouldLookup(true);

    console.log('[CreateStoreStartScreen] Starting tax code lookup:', taxCode);
  };

  // Handle tax code lookup results
  React.useEffect(() => {
    if (!shouldLookup || isTaxCodeLoading) return;

    // Handle success
    if (taxCodeData?.success && taxCodeData.data) {
      console.log('[CreateStoreStartScreen] Tax code info retrieved:', taxCodeData.data);

      // Extract actual company data from nested structure
      // taxCodeData.data might be { data: {...}, code: 200, message: '...' }
      const actualData = (taxCodeData.data as any)?.data || taxCodeData.data;

      console.log('[CreateStoreStartScreen] Navigating with params:', {
        taxCode: taxCode.trim(),
        actualData,
        actualDataKeys: actualData ? Object.keys(actualData) : 'no data',
      });

      // Navigate to CreateStore with tax code and company info
      // Make sure to pass a plain object (not nested)
      navigation.navigate('CreateStore', {
        taxCode: taxCode.trim(),
        storeType: 'business',
        companyInfo: actualData ? {
          ma_so_thue: actualData.ma_so_thue,
          masothue_id: actualData.masothue_id,
          ten_cty: actualData.ten_cty,
          dia_chi: actualData.dia_chi,
          cqthuecap_tinh: actualData.cqthuecap_tinh,
          cqthue_ql: actualData.cqthue_ql,
          nguoi_dai_dien: actualData.nguoi_dai_dien,
          ngay_thanh_lap: actualData.ngay_thanh_lap,
          tthai: actualData.tthai,
          ten_tthai: actualData.ten_tthai,
        } : undefined
      });

      // Reset states
      setShouldLookup(false);
      setIsProcessing(false);
      return;
    }

    // Handle error
    if (taxCodeError || (taxCodeData && !taxCodeData.success)) {
      // Extract error message from various possible structures
      const errorMessage = taxCodeData?.message ||
        (taxCodeError as any)?.message ||
        (taxCodeError as any)?.response?.data?.message ||
        t('store.error.taxCodeNotFound', 'Không tìm thấy thông tin mã số thuế');

      console.error('[CreateStoreStartScreen] Tax code lookup error:', taxCodeError || taxCodeData);

      Alert.alert(
        t('store.error.title', 'Lỗi'),
        errorMessage,
        [{ text: t('common.ok', 'OK') }]
      );

      // Reset states
      setShouldLookup(false);
      setIsProcessing(false);
    }
  }, [shouldLookup, isTaxCodeLoading, taxCodeData, taxCodeError, taxCode, navigation, t]);

  const onClose = () => navigation.goBack();

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor='transparent' />
          <View style={styles.header}>
            <Pressable onPress={onClose} accessibilityLabel={t('closeLabel', 'Close')} hitSlop={10}>
              <Close width={24} height={24} color={colors.text.primary} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.illustrationWrap}>
              <View style={styles.iconContainer}>
                <CreateStorePhoto width={120} height={120} />
              </View>
            </View>

            <View style={styles.texts}>
              <Heading style={styles.title}>
                {t('store.createStore.title', 'Tạo cửa hàng của bạn')}
              </Heading>
              <Text style={styles.subtitle}>
                {t('store.createStore.subtitle', 'Bắt đầu kinh doanh với nền tảng ESPay. Chọn loại cửa hàng để bắt đầu.')}
              </Text>
            </View>

            {/* Store Type Selection */}
            <View style={styles.storeTypeContainer}>
              <Text style={styles.storeTypeLabel}>
                {t('store.storeType.label', 'Loại cửa hàng')}
              </Text>
              <View style={styles.storeTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.storeTypeButton,
                    storeType === 'business' && styles.storeTypeButtonActive
                  ]}
                  onPress={() => setStoreType('business')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.storeTypeButtonText,
                    storeType === 'business' && styles.storeTypeButtonTextActive
                  ]}>
                    {t('store.storeType.business', 'Doanh nghiệp')}
                  </Text>
                  <Text style={[
                    styles.storeTypeButtonSubtext,
                    storeType === 'business' && styles.storeTypeButtonSubtextActive
                  ]}>
                    {t('store.storeType.businessDesc', 'Có mã số thuế')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.storeTypeButton,
                    storeType === 'personal' && styles.storeTypeButtonActive
                  ]}
                  onPress={() => setStoreType('personal')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.storeTypeButtonText,
                    storeType === 'personal' && styles.storeTypeButtonTextActive
                  ]}>
                    {t('store.storeType.personal', 'Cửa hàng cá nhân')}
                  </Text>
                  <Text style={[
                    styles.storeTypeButtonSubtext,
                    storeType === 'personal' && styles.storeTypeButtonSubtextActive
                  ]}>
                    {t('store.storeType.personalDesc', 'Dùng số CCCD')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tax Code Input - Only show for business */}
            {storeType === 'business' && (
              <View style={styles.inputContainer}>
                <Input
                  label={t('store.taxCode.label', 'Mã số thuế')}
                  placeholder={t('store.taxCode.placeholder', 'Nhập mã số thuế (10 hoặc 13 chữ số)')}
                  value={taxCode}
                  onChangeText={setTaxCode}
                  keyboardType="number-pad"
                  maxLength={13}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.cta}>
              <Button
                label={isProcessing ? t('store.processing', 'Đang xử lý...') : t('store.createStore.button', 'Tiếp tục')}
                size="lg"
                onPress={onContinue}
                disabled={isProcessing || !storeType || (storeType === 'business' && !taxCode.trim())}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light, paddingHorizontal: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center' },
  content: { height: '100%', justifyContent: 'center', paddingBottom: spacing.xxxl * 5 },
  illustrationWrap: { alignItems: 'center', marginTop: spacing.xxl },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { alignItems: 'center', marginHorizontal: spacing.lg },
  title: { textAlign: 'center', marginTop: spacing.xl },
  subtitle: { textAlign: 'center', color: colors.text.secondary, marginTop: spacing.md, lineHeight: 24 },
  storeTypeContainer: { marginTop: spacing.xl },
  storeTypeLabel: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  storeTypeButtons: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  storeTypeButton: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: dimensions.radius.md,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  storeTypeButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  storeTypeButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  storeTypeButtonTextActive: {
    color: colors.primary,
  },
  storeTypeButtonSubtext: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
  storeTypeButtonSubtextActive: {
    color: colors.primary,
  },
  inputContainer: { marginTop: spacing.xl },
  cta: { marginTop: spacing.xl, paddingBottom: spacing.md },
});

export default CreateStoreStartScreen;
