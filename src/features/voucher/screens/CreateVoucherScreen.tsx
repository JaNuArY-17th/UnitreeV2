import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { launchImageLibrary } from 'react-native-image-picker'
import DatePicker from 'react-native-ui-datepicker'
import { useTranslation } from '@/shared/hooks/useTranslation'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStatusBarEffect } from '@shared/utils/StatusBarManager'
import { colors, spacing, typography, getFontFamily, FONT_WEIGHTS, dimensions } from '@/shared/themes'
import { ScreenHeader, Text } from '@/shared/components'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Calendar03Icon, Ticket01Icon, Image02Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import type { RootStackParamList } from '@/navigation/types'
import { voucherService } from '../services/voucherService'
import type { VoucherDiscountType, VoucherCreateRequest, VoucherUpdateRequest } from '../types/voucherTypes'
import { useStoreFileUpload, type RNFile } from '@/features/authentication/hooks/useStoreFileUpload'
import { useStoreData } from '@/features/authentication/hooks/useStoreData'

type CreateVoucherScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateVoucher'>

const CreateVoucherScreen: React.FC = () => {
  const { t } = useTranslation('voucher')
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const route = useRoute<CreateVoucherScreenProps['route']>()
  const insets = useSafeAreaInsets()

  const voucherId = route.params?.voucherId
  const isEditMode = !!voucherId

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [formData, setFormData] = useState<VoucherCreateRequest>({
    name: '',
    description: '',
    code: '',
    imageUrl: '',
    discountType: 'PERCENT',
    discountValue: 0,
    maxDiscount: undefined,
    minOrderValue: undefined,
    totalQuantity: 100,
    maxUsagePerUser: 1,
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  })

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<RNFile | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [uploadedFileId, setUploadedFileId] = useState<string | undefined>(undefined)

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState<'validFrom' | 'validTo'>('validFrom')
  const [tempDate, setTempDate] = useState<Date>(new Date())

  // Hooks
  const { storeData } = useStoreData()
  const { uploadFile, isLoading: isUploadingImage } = useStoreFileUpload()
  const { t: commonT, currentLanguage } = useTranslation('common')

  useStatusBarEffect('light', 'dark-content', false)

  useEffect(() => {
    if (isEditMode && voucherId) {
      fetchVoucher()
    }
  }, [isEditMode, voucherId])

  const fetchVoucher = async () => {
    if (!voucherId) return

    setIsFetching(true)
    console.log('🔄 [CreateVoucherScreen] Fetching voucher:', voucherId)

    try {
      const response = await voucherService.getCampaign(voucherId)

      if (response.success && response.data) {
        const voucher = response.data
        console.log('✅ [CreateVoucherScreen] Voucher fetched successfully')

        setFormData({
          name: voucher.name,
          description: voucher.description || '',
          code: voucher.code,
          imageUrl: voucher.imageUrl || '',
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          maxDiscount: voucher.maxDiscount,
          minOrderValue: voucher.minOrderValue,
          totalQuantity: voucher.totalQuantity,
          maxUsagePerUser: voucher.maxUsagePerUser,
          validFrom: voucher.validFrom,
          validTo: voucher.validTo,
        })

        // Set image if exists
        if (voucher.imageUrl) {
          setUploadedFileId(voucher.imageUrl)
          setImagePreviewUrl(voucher.imageUrl)
        }
      } else {
        console.error('❌ [CreateVoucherScreen] Failed to fetch voucher:', response.message)
        Alert.alert(
          t('error', 'Lỗi'),
          t('fetchFailed', 'Không thể tải thông tin voucher'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        )
      }
    } catch (error: any) {
      console.error('❌ [CreateVoucherScreen] Error fetching voucher:', error)
      Alert.alert(
        t('error', 'Lỗi'),
        error.message || t('fetchFailed', 'Không thể tải thông tin voucher'),
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      )
    } finally {
      setIsFetching(false)
    }
  }

  const handleImagePick = async () => {
    console.log('🔄 [CreateVoucherScreen] Opening image picker')

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      })

      if (result.didCancel) {
        console.log('📝 [CreateVoucherScreen] User cancelled image picker')
        return
      }

      if (result.errorCode) {
        console.error('❌ [CreateVoucherScreen] Image picker error:', result.errorMessage)
        Alert.alert(t('error', 'Lỗi'), result.errorMessage || t('imagePickFailed', 'Không thể chọn ảnh'))
        return
      }

      const asset = result.assets?.[0]
      if (!asset || !asset.uri) {
        console.error('❌ [CreateVoucherScreen] No image selected')
        return
      }

      // Validate image
      const isImage = asset.type?.startsWith('image/')
      if (!isImage) {
        Alert.alert(t('error', 'Lỗi'), t('invalidImageType', 'Chỉ được tải lên file ảnh'))
        return
      }

      const fileSize = asset.fileSize || 0
      const isLt5M = fileSize / 1024 / 1024 < 5
      if (!isLt5M) {
        Alert.alert(t('error', 'Lỗi'), t('imageTooLarge', 'Kích thước ảnh phải nhỏ hơn 5MB'))
        return
      }

      // Store selected image
      const file: RNFile = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'voucher-image.jpg',
      }

      setSelectedImage(file)
      setImagePreviewUrl(asset.uri)
      console.log('✅ [CreateVoucherScreen] Image selected:', file.name)
    } catch (error: any) {
      console.error('❌ [CreateVoucherScreen] Error picking image:', error)
      Alert.alert(t('error', 'Lỗi'), error.message || t('imagePickFailed', 'Không thể chọn ảnh'))
    }
  }

  const handleRemoveImage = () => {
    console.log('🔄 [CreateVoucherScreen] Removing image')
    setSelectedImage(null)
    setImagePreviewUrl(null)
    setUploadedFileId(undefined)
  }

  const uploadImageToServer = async (): Promise<string | undefined> => {
    if (!selectedImage) {
      return uploadedFileId
    }

    if (!storeData?.id) {
      console.error('❌ [CreateVoucherScreen] Store ID not found')
      Alert.alert(t('error', 'Lỗi'), t('storeNotFound', 'Không tìm thấy thông tin cửa hàng'))
      return undefined
    }

    console.log('🔄 [CreateVoucherScreen] Uploading image to server...')

    try {
      const result = await uploadFile(selectedImage, storeData.id)

      if (result.success && result.data?.fileId) {
        console.log('✅ [CreateVoucherScreen] Image uploaded successfully, fileId:', result.data.fileId)
        return result.data.fileId
      } else {
        console.error('❌ [CreateVoucherScreen] Upload failed:', result.message)
        Alert.alert(t('error', 'Lỗi'), result.message || t('uploadFailed', 'Tải ảnh lên thất bại'))
        return undefined
      }
    } catch (error: any) {
      console.error('❌ [CreateVoucherScreen] Upload error:', error)
      Alert.alert(t('error', 'Lỗi'), error.message || t('uploadFailed', 'Có lỗi xảy ra khi tải ảnh lên'))
      return undefined
    }
  }

  const handleDatePickerOpen = (mode: 'validFrom' | 'validTo') => {
    console.log('🔄 [CreateVoucherScreen] Opening date picker:', mode)
    setDatePickerMode(mode)
    const currentDate = mode === 'validFrom' ? new Date(formData.validFrom) : new Date(formData.validTo)
    setTempDate(currentDate)
    setShowDatePicker(true)
  }

  const handleDateChange = (params: any) => {
    if (params.date) {
      setTempDate(new Date(params.date))
    }
  }

  const handleConfirmDate = () => {
    console.log('🔄 [CreateVoucherScreen] Confirming date:', tempDate, 'for', datePickerMode)
    const isoDate = tempDate.toISOString()
    handleInputChange(datePickerMode, isoDate)
    setShowDatePicker(false)
  }

  const handleCancelDate = () => {
    console.log('🔄 [CreateVoucherScreen] Canceling date picker')
    setShowDatePicker(false)
  }

  const getDatePickerLocale = (language: string): string => {
    const localeMap: Record<string, string> = {
      vi: 'vi',
      en: 'en',
    }
    return localeMap[language] || 'en'
  }

  const handleInputChange = (field: keyof VoucherCreateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDiscountTypeChange = (type: VoucherDiscountType) => {
    setFormData(prev => ({ ...prev, discountType: type }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert(t('error', 'Lỗi'), t('nameRequired', 'Vui lòng nhập tên voucher'))
      return false
    }

    if (!formData.code.trim()) {
      Alert.alert(t('error', 'Lỗi'), t('codeRequired', 'Vui lòng nhập mã voucher'))
      return false
    }

    const codeRegex = /^[A-Z0-9_-]{3,50}$/
    if (!codeRegex.test(formData.code)) {
      Alert.alert(
        t('error', 'Lỗi'),
        t('codeInvalid', 'Mã voucher phải từ 3-50 ký tự, chỉ bao gồm chữ in hoa, số, gạch ngang và gạch dưới'),
      )
      return false
    }

    if (formData.discountValue <= 0) {
      Alert.alert(t('error', 'Lỗi'), t('discountValueRequired', 'Giá trị giảm giá phải lớn hơn 0'))
      return false
    }

    if (formData.discountType === 'PERCENT' && formData.discountValue > 100) {
      Alert.alert(t('error', 'Lỗi'), t('discountPercentageMax', 'Giá trị giảm giá không được vượt quá 100%'))
      return false
    }

    if (formData.totalQuantity <= 0) {
      Alert.alert(t('error', 'Lỗi'), t('quantityRequired', 'Số lượng voucher phải lớn hơn 0'))
      return false
    }

    if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
      Alert.alert(t('error', 'Lỗi'), t('dateInvalid', 'Ngày bắt đầu phải trước ngày kết thúc'))
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    if (isEditMode && voucherId) {
      await handleUpdate()
    } else {
      await handleCreate()
    }
  }

  const handleCreate = async () => {
    setIsLoading(true)
    console.log('🔄 [CreateVoucherScreen] Creating voucher:', formData)

    try {
      // Check if code exists
      const codeCheckResponse = await voucherService.checkCodeExists(formData.code)
      if (codeCheckResponse.success && codeCheckResponse.data) {
        Alert.alert(t('error', 'Lỗi'), t('codeExists', 'Mã voucher đã tồn tại'))
        setIsLoading(false)
        return
      }

      // Upload image first if there's a selected image
      let imageFileId = uploadedFileId
      if (selectedImage) {
        console.log('🔄 [CreateVoucherScreen] Uploading image before creating voucher...')
        imageFileId = await uploadImageToServer()
        if (!imageFileId && selectedImage) {
          // Upload failed and there was a file to upload
          setIsLoading(false)
          return
        }
      }

      // Create voucher with image fileId
      const requestData: VoucherCreateRequest = {
        ...formData,
        imageUrl: imageFileId,
      }

      const response = await voucherService.createCampaign(requestData)

      if (response.success) {
        console.log('✅ [CreateVoucherScreen] Voucher created successfully')
        Alert.alert(
          t('success', 'Thành công'),
          t('createSuccess', 'Tạo voucher thành công'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        )
      } else {
        console.error('❌ [CreateVoucherScreen] Failed to create voucher:', response.message)
        Alert.alert(t('error', 'Lỗi'), response.message || t('createFailed', 'Tạo voucher thất bại'))
      }
    } catch (error: any) {
      console.error('❌ [CreateVoucherScreen] Error creating voucher:', error)
      Alert.alert(t('error', 'Lỗi'), error.message || t('createFailed', 'Tạo voucher thất bại'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!voucherId) return

    setIsLoading(true)
    console.log('🔄 [CreateVoucherScreen] Updating voucher:', voucherId, formData)

    try {
      // Upload image first if there's a selected image
      let imageFileId = uploadedFileId
      if (selectedImage) {
        console.log('🔄 [CreateVoucherScreen] Uploading image before updating voucher...')
        imageFileId = await uploadImageToServer()
        if (!imageFileId && selectedImage) {
          // Upload failed and there was a file to upload
          setIsLoading(false)
          return
        }
      }

      // Map to update request (only updatable fields)
      const updateData: VoucherUpdateRequest = {
        name: formData.name,
        description: formData.description,
        imageUrl: imageFileId,
        maxDiscount: formData.maxDiscount,
        minOrderValue: formData.minOrderValue,
        totalQuantity: formData.totalQuantity,
        maxUsagePerUser: formData.maxUsagePerUser,
        validTo: formData.validTo,
      }

      const response = await voucherService.updateCampaign(voucherId, updateData)

      if (response.success) {
        console.log('✅ [CreateVoucherScreen] Voucher updated successfully')
        Alert.alert(
          t('success', 'Thành công'),
          t('updateSuccess', 'Cập nhật voucher thành công'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        )
      } else {
        console.error('❌ [CreateVoucherScreen] Failed to update voucher:', response.message)
        Alert.alert(t('error', 'Lỗi'), response.message || t('updateFailed', 'Cập nhật voucher thất bại'))
      }
    } catch (error: any) {
      console.error('❌ [CreateVoucherScreen] Error updating voucher:', error)
      Alert.alert(t('error', 'Lỗi'), error.message || t('updateFailed', 'Cập nhật voucher thất bại'))
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {}).format(amount)
  }

  const formatNumberWithCommas = (value: string) => {
    // Remove all non-numeric characters except numbers
    const numericValue = value.replace(/[^0-9]/g, '')
    // Format with commas
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const parseFormattedNumber = (value: string): number => {
    // Remove commas and parse to number
    return parseFloat(value.replace(/,/g, '')) || 0
  }

  if (isFetching) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.light} />
        <ScreenHeader title={isEditMode ? t('editTitle', 'Chỉnh sửa Voucher') : t('createTitle', 'Tạo Voucher')} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading', 'Đang tải...')}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} />

      <ScreenHeader title={isEditMode ? t('editTitle', 'Chỉnh sửa Voucher') : t('createTitle', 'Tạo Voucher')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Voucher Name */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('name', 'Tên voucher')} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('namePlaceholder', 'Nhập tên voucher')}
            value={formData.name}
            onChangeText={text => handleInputChange('name', text)}
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        {/* Voucher Code */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('code', 'Mã voucher')} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, isEditMode && styles.inputDisabled]}
            placeholder={t('codePlaceholder', 'VD: GIAM10K')}
            value={formData.code}
            onChangeText={text => handleInputChange('code', text.toUpperCase())}
            placeholderTextColor={colors.text.secondary}
            autoCapitalize="characters"
            editable={!isEditMode}
          />
          <Text style={styles.hint}>
            {isEditMode
              ? t('codeNotEditable', 'Mã voucher không thể chỉnh sửa')
              : t('codeHint', 'Chỉ bao gồm chữ in hoa, số, gạch ngang và gạch dưới (3-50 ký tự)')}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('description', 'Mô tả')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('descriptionPlaceholder', 'Nhập mô tả voucher')}
            value={formData.description}
            onChangeText={text => handleInputChange('description', text)}
            placeholderTextColor={colors.text.secondary}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('image', 'Hình ảnh')}</Text>
          {imagePreviewUrl ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imagePreviewUrl }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
                activeOpacity={0.7}
              >
                <HugeiconsIcon icon={Delete02Icon} size={20} color={colors.light} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imageUploadButton}
              onPress={handleImagePick}
              activeOpacity={0.7}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <HugeiconsIcon icon={Image02Icon} size={32} color={colors.text.secondary} />
                  <Text style={styles.imageUploadText}>{t('selectImage', 'Chọn ảnh')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          <Text style={styles.hint}>{t('imageHint', 'Kích thước ảnh tối đa 5MB')}</Text>
        </View>

        {/* Discount Type */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('discountType', 'Loại giảm giá')} <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.discountTypeContainer}>
            <TouchableOpacity
              style={[
                styles.discountTypeButton,
                formData.discountType === 'PERCENT' && styles.discountTypeButtonActive,
                isEditMode && styles.discountTypeButtonDisabled,
              ]}
              onPress={() => !isEditMode && handleDiscountTypeChange('PERCENT')}
              activeOpacity={isEditMode ? 1 : 0.7}
              disabled={isEditMode}
            >
              <Text
                style={[
                  styles.discountTypeText,
                  formData.discountType === 'PERCENT' && styles.discountTypeTextActive,
                ]}
              >
                {t('percentage', 'Phần trăm (%)')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.discountTypeButton,
                formData.discountType === 'AMOUNT' && styles.discountTypeButtonActive,
                isEditMode && styles.discountTypeButtonDisabled,
              ]}
              onPress={() => !isEditMode && handleDiscountTypeChange('AMOUNT')}
              activeOpacity={isEditMode ? 1 : 0.7}
              disabled={isEditMode}
            >
              <Text
                style={[
                  styles.discountTypeText,
                  formData.discountType === 'AMOUNT' && styles.discountTypeTextActive,
                ]}
              >
                {t('amount', 'Số tiền cố định')}
              </Text>
            </TouchableOpacity>
          </View>
          {isEditMode && (
            <Text style={styles.hint}>
              {t('discountTypeNotEditable', 'Loại giảm giá không thể chỉnh sửa')}
            </Text>
          )}
        </View>

        {/* Discount Value */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('discountValue', 'Giá trị giảm giá')} <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWithUnit}>
            <TextInput
              style={[styles.input, styles.inputWithUnitInput, isEditMode && styles.inputDisabled]}
              placeholder="0"
              value={
                formData.discountValue > 0
                  ? formData.discountType === 'PERCENT'
                    ? formData.discountValue.toString()
                    : formatNumberWithCommas(formData.discountValue.toString())
                  : ''
              }
              onChangeText={text => {
                if (formData.discountType === 'PERCENT') {
                  handleInputChange('discountValue', parseFloat(text) || 0)
                } else {
                  const numericValue = parseFormattedNumber(text)
                  handleInputChange('discountValue', numericValue)
                }
              }}
              keyboardType="numeric"
              placeholderTextColor={colors.text.secondary}
              editable={!isEditMode}
            />
            <Text style={styles.unit}>
              {formData.discountType === 'PERCENT' ? '%' : 'đ'}
            </Text>
          </View>
          {isEditMode && (
            <Text style={styles.hint}>
              {t('discountValueNotEditable', 'Giá trị giảm giá không thể chỉnh sửa')}
            </Text>
          )}
        </View>

        {/* Max Discount (for PERCENTAGE type) */}
        {formData.discountType === 'PERCENT' && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('maxDiscount', 'Giảm tối đa')}</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[styles.input, styles.inputWithUnitInput]}
                placeholder="0"
                value={formData.maxDiscount ? formatNumberWithCommas(formData.maxDiscount.toString()) : ''}
                onChangeText={text => {
                  const numericValue = parseFormattedNumber(text)
                  handleInputChange('maxDiscount', numericValue || undefined)
                }}
                keyboardType="numeric"
                placeholderTextColor={colors.text.secondary}
              />
              <Text style={styles.unit}>đ</Text>
            </View>
          </View>
        )}

        {/* Min Order Value */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('minOrderValue', 'Đơn hàng tối thiểu')}</Text>
          <View style={styles.inputWithUnit}>
            <TextInput
              style={[styles.input, styles.inputWithUnitInput]}
              placeholder="0"
              value={formData.minOrderValue ? formatNumberWithCommas(formData.minOrderValue.toString()) : ''}
              onChangeText={text => {
                const numericValue = parseFormattedNumber(text)
                handleInputChange('minOrderValue', numericValue || undefined)
              }}
              keyboardType="numeric"
              placeholderTextColor={colors.text.secondary}
            />
            <Text style={styles.unit}>đ</Text>
          </View>
        </View>

        {/* Total Quantity */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('totalQuantity', 'Số lượng voucher')} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="100"
            value={formData.totalQuantity.toString()}
            onChangeText={text => handleInputChange('totalQuantity', parseInt(text) || 0)}
            keyboardType="numeric"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        {/* Max Usage Per User */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('maxUsagePerUser', 'Giới hạn sử dụng/người')}</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            value={formData.maxUsagePerUser ? formData.maxUsagePerUser.toString() : ''}
            onChangeText={text => handleInputChange('maxUsagePerUser', parseInt(text) || undefined)}
            keyboardType="numeric"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        {/* Valid From & To */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('validPeriod', 'Thời gian hiệu lực')} <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.dateRow}>
            {/* Valid From */}
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateInputLabel}>{t('from', 'Từ')}</Text>
              <Pressable
                style={[styles.dateInputButton, isEditMode && styles.dateInputButtonDisabled]}
                onPress={() => !isEditMode && handleDatePickerOpen('validFrom')}
                disabled={isEditMode}
              >
                <HugeiconsIcon icon={Calendar03Icon} size={16} color={colors.primary} />
                <Text style={styles.dateInputText}>
                  {new Date(formData.validFrom).toLocaleDateString('vi-VN')}
                </Text>
              </Pressable>
            </View>

            {/* Valid To */}
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateInputLabel}>{t('to', 'Đến')}</Text>
              <Pressable
                style={styles.dateInputButton}
                onPress={() => handleDatePickerOpen('validTo')}
              >
                <HugeiconsIcon icon={Calendar03Icon} size={16} color={colors.primary} />
                <Text style={styles.dateInputText}>
                  {new Date(formData.validTo).toLocaleDateString('vi-VN')}
                </Text>
              </Pressable>
            </View>
          </View>
          {isEditMode && (
            <Text style={styles.hint}>
              {t('validFromNotEditable', 'Ngày bắt đầu không thể chỉnh sửa')}
            </Text>
          )}
        </View>

        {/* Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>{t('preview', 'Xem trước')}</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewIconContainer}>
                <HugeiconsIcon icon={Ticket01Icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.previewHeaderContent}>
                <Text style={styles.previewName}>{formData.name || t('voucherName', 'Tên voucher')}</Text>
                <Text style={styles.previewCode}>
                  {formData.code || t('voucherCode', 'MÃ VOUCHER')}
                </Text>
              </View>
            </View>
            <View style={styles.previewDiscount}>
              <Text style={styles.previewDiscountValue}>
                {formData.discountType === 'PERCENT'
                  ? `${formData.discountValue}%`
                  : `${formatCurrency(formData.discountValue)}đ`}
              </Text>
              <Text style={styles.previewDiscountLabel}>{t('discount', 'Giảm giá')}</Text>
            </View>
            {formData.description && (
              <Text style={styles.previewDescription}>{formData.description}</Text>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.light} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? t('updateVoucher', 'Cập nhật Voucher') : t('createVoucher', 'Tạo Voucher')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDate}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCancelDate} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {datePickerMode === 'validFrom' ? t('selectStartDate', 'Chọn ngày bắt đầu') : t('selectEndDate', 'Chọn ngày kết thúc')}
              </Text>
            </View>

            <DatePicker
              mode="single"
              date={tempDate}
              onChange={handleDateChange}
              locale={getDatePickerLocale(currentLanguage)}
              timePicker={false}
              styles={{
                day_cell: {
                  marginVertical: 1,
                },
                day_label: {
                  paddingTop: spacing.xs,
                  fontSize: 18,
                  fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
                },
                today: {
                  backgroundColor: colors.secondary,
                  borderRadius: dimensions.radius.round,
                  borderWidth: 1,
                  borderColor: colors.primary,
                },
                today_label: {
                  color: colors.primary,
                },
                selected: {
                  backgroundColor: colors.primary,
                  borderRadius: dimensions.radius.round,
                },
                selected_label: {
                  color: colors.light,
                },
              }}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={handleCancelDate}>
                <Text style={styles.cancelButtonText}>{commonT('cancel', 'Hủy')}</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={handleConfirmDate}>
                <Text style={styles.confirmButtonText}>{commonT('confirm', 'Xác nhận')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.danger,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
  },
  inputDisabled: {
    backgroundColor: colors.lightGray,
    color: colors.text.secondary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  discountTypeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  discountTypeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  discountTypeButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  discountTypeText: {
    ...typography.body,
    color: colors.text.secondary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  discountTypeTextActive: {
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  discountTypeButtonDisabled: {
    opacity: 0.6,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithUnitInput: {
    flex: 1,
    marginBottom: 0,
  },
  unit: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  dateValue: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  dateSeparator: {
    ...typography.body,
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
  },
  previewSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  previewTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  previewCard: {
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  previewIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  previewHeaderContent: {
    flex: 1,
  },
  previewName: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  previewCode: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  previewDiscount: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  previewDiscountValue: {
    ...typography.h1,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  previewDiscountLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  previewDescription: {
    ...typography.body,
    color: colors.text.secondary,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.danger,
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateInputLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  dateInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  dateInputButtonDisabled: {
    backgroundColor: colors.lightGray,
    borderColor: colors.border,
    opacity: 0.6,
  },
  dateInputText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text.secondary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...typography.body,
    color: colors.light,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    backgroundColor: colors.light,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.secondary,
  },
  submitButtonText: {
    ...typography.subtitle,
    color: colors.light,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
})

export default CreateVoucherScreen
