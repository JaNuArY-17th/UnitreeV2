import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, StatusBar, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from '@/shared/hooks/useTranslation'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStatusBarEffect } from '@shared/utils/StatusBarManager'
import { colors, spacing, dimensions, typography, getFontFamily, FONT_WEIGHTS } from '@/shared/themes'
import { ScreenHeader, Text } from '@/shared/components'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Add01Icon } from '@hugeicons/core-free-icons'
import type { RootStackParamList } from '@/navigation/types'
import VoucherCard from '../components/VoucherCard'
import VoucherFilterBar from '../components/VoucherFilterBar'
import { useVoucherList } from '../hooks/useVoucherList'
import type { VoucherStatus, VoucherCampaignResponse } from '../types/voucherTypes'

const VoucherManagementScreen: React.FC = () => {
  const { t } = useTranslation('voucher')
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const {
    vouchers,
    isLoading,
    isRefreshing,
    fetchVouchers,
    refreshVouchers,
    deleteVoucher,
  } = useVoucherList()

  const [activeFilter, setActiveFilter] = useState<VoucherStatus | 'ALL'>('ALL')

  useStatusBarEffect('light', 'dark-content', false)

  useFocusEffect(
    useCallback(() => {
      loadVouchers()
    }, [activeFilter]),
  )

  const loadVouchers = () => {
    const params = activeFilter !== 'ALL' ? { status: activeFilter } : {}
    fetchVouchers(params)
  }

  const handleRefresh = () => {
    const params = activeFilter !== 'ALL' ? { status: activeFilter } : {}
    refreshVouchers(params)
  }

  const handleFilterChange = (filter: VoucherStatus | 'ALL') => {
    console.log('🔄 [VoucherManagementScreen] Filter changed:', filter)
    setActiveFilter(filter)
  }

  const handleCreateVoucher = () => {
    console.log('🔄 [VoucherManagementScreen] Create voucher pressed')
    navigation.navigate('CreateVoucher')
  }

  const handleVoucherPress = (voucher: VoucherCampaignResponse) => {
    console.log('🔄 [VoucherManagementScreen] Voucher pressed:', voucher.id)
    // Navigate to edit voucher screen
    handleEditVoucher(voucher)
  }

  const handleEditVoucher = (voucher: VoucherCampaignResponse) => {
    console.log('🔄 [VoucherManagementScreen] Edit voucher:', voucher.id)
    navigation.navigate('CreateVoucher', { voucherId: voucher.id })
  }

  const handleDeleteVoucher = (voucher: VoucherCampaignResponse) => {
    Alert.alert(
      t('deleteConfirmTitle', 'Xác nhận xóa'),
      t('deleteConfirmMessage', 'Bạn có chắc chắn muốn xóa voucher này?'),
      [
        {
          text: t('cancel', 'Hủy'),
          style: 'cancel',
        },
        {
          text: t('delete', 'Xóa'),
          style: 'destructive',
          onPress: async () => {
            console.log('🔄 [VoucherManagementScreen] Deleting voucher:', voucher.id)
            const result = await deleteVoucher(voucher.id)
            if (result.success) {
              Alert.alert(t('success', 'Thành công'), t('deleteSuccess', 'Xóa voucher thành công'))
            } else {
              Alert.alert(t('error', 'Lỗi'), result.message)
            }
          },
        },
      ],
    )
  }

  const renderVoucherItem = ({ item }: { item: VoucherCampaignResponse }) => (
    <VoucherCard
      voucher={item}
      onPress={() => handleVoucherPress(item)}
      onEdit={() => handleEditVoucher(item)}
      onDelete={() => handleDeleteVoucher(item)}
    />
  )

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {t('noVouchers', 'Chưa có voucher nào')}
      </Text>
      <Text style={styles.emptySubtext}>
        {t('createFirstVoucher', 'Tạo voucher đầu tiên của bạn')}
      </Text>
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} />

      <ScreenHeader
        title={t('title', 'Quản lý Voucher')}
      />

      <VoucherFilterBar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{vouchers.length}</Text>
          <Text style={styles.statLabel}>{t('total', 'Tổng số')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {vouchers.filter(v => v.status === 'ACTIVE').length}
          </Text>
          <Text style={styles.statLabel}>{t('active', 'Đang hoạt động')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {vouchers.filter(v => v.status === 'EXPIRED').length}
          </Text>
          <Text style={styles.statLabel}>{t('expired', 'Đã hết hạn')}</Text>
        </View>
      </View>

      <FlatList
        data={vouchers}
        renderItem={renderVoucherItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? renderEmptyList : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateVoucher}
        activeOpacity={0.8}
      >
        <HugeiconsIcon icon={Add01Icon} size={24} color={colors.light} />
        <Text style={styles.createButtonText}>
          {t('createVoucher', 'Tạo Voucher')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.light,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.subtitle,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.secondary,
  },
  createButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    ...typography.subtitle,
    color: colors.light,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
})

export default VoucherManagementScreen