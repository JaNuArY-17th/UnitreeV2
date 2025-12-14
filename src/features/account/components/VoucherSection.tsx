import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import Text from '@/shared/components/base/Text';

// Mock voucher data - replace with actual data from API or store
const mockVouchers = [
  { id: '1', title: 'Giảm 10%', description: 'Áp dụng cho đơn hàng từ 500k', expiry: '31/12/2025', imageUrl: 'https://via.placeholder.com/100x60/FF6B6B/FFFFFF?text=10%25' },
  { id: '2', title: 'Miễn phí ship', description: 'Đơn hàng trên 300k', expiry: '15/01/2026', imageUrl: 'https://via.placeholder.com/100x60/4ECDC4/FFFFFF?text=FREE' },
  { id: '3', title: 'Giảm 20%', description: 'Khuyến mãi đặc biệt', expiry: '28/02/2026', imageUrl: 'https://via.placeholder.com/100x60/45B7D1/FFFFFF?text=20%25' },
  { id: '4', title: 'Hoàn tiền 5%', description: 'Cho khách hàng mới', expiry: '10/03/2026', imageUrl: 'https://via.placeholder.com/100x60/F7DC6F/FFFFFF?text=5%25' },
];

interface VoucherItemProps {
  voucher: {
    id: string;
    title: string;
    description: string;
    expiry: string;
    imageUrl: string;
  };
}

const VoucherItem: React.FC<VoucherItemProps> = ({ voucher }) => {
  const { t } = useTranslation('account');

  return (
    <TouchableOpacity style={styles.voucherItem} activeOpacity={0.7}>
      <View style={styles.voucherContent}>
        <Image source={{ uri: voucher.imageUrl }} style={styles.voucherImage} />
        <Text style={styles.voucherTitle}>{voucher.title}</Text>
        <Text style={styles.voucherDescription} numberOfLines={2}>
          {voucher.description}
        </Text>
        <Text style={styles.voucherExpiry}>
          {t('voucher.expiry')}: {voucher.expiry}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface VoucherSectionProps {
  style?: any;
  scrollable?: boolean;
}

const VoucherSection: React.FC<VoucherSectionProps> = ({ style, scrollable = true }) => {
  const { t } = useTranslation('account');

  const renderVoucherItem = ({ item }: { item: typeof mockVouchers[0] }) => (
    <VoucherItem voucher={item} />
  );

  return (
    <View style={[styles.container, scrollable && styles.fullScreenContainer, style]}>
      <Text style={styles.sectionTitle}>{t('voucher.title')}</Text>
      <FlatList
        data={mockVouchers}
        renderItem={renderVoucherItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollable}
        contentContainerStyle={[styles.listContent, !scrollable && styles.noScrollContent]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  fullScreenContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  voucherItem: {
    flex: 1,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  voucherContent: {
    flex: 1,
  },
  voucherImage: {
    width: '100%',
    height: 60,
    borderRadius: dimensions.radius.sm,
    marginBottom: spacing.sm,
  },
  voucherTitle: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  voucherDescription: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.dark,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  voucherExpiry: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.gray,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  noScrollContent: {
    paddingBottom: spacing.xl,
  },
});

export default VoucherSection;