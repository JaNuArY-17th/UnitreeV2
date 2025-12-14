import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useTranslation } from 'react-i18next';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '../../../shared/themes';
import { DollarSign } from '../../../shared/assets';

interface CommissionItemProps {
    transactionCode: string;
    commissionPercent: number;
    originalAmount: string;
    commissionAmount: string;
    createdAt: string;
    isPaid: boolean;
    lastItem?: boolean;
    lastItemInSection?: boolean;
}

const CommissionItem: React.FC<CommissionItemProps> = ({
    transactionCode,
    commissionPercent,
    originalAmount,
    commissionAmount,
    createdAt,
    isPaid,
    lastItem,
    lastItemInSection
}) => {
    const { t } = useTranslation('commission');

    const formatAmount = (amount: string) => {
        if (!amount || typeof amount !== 'string') return '0đ';
        return `${amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`;
    };

    const formatDateTime = (isoDate: string) => {
        try {
            const date = new Date(isoDate);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hour}:${minute}`;
        } catch {
            return isoDate;
        }
    };

    const getStatusColor = () => {
        return isPaid ? colors.success : colors.warning;
    };

    const getStatusText = () => {
        return isPaid ? t('paid', 'Đã thanh toán') : t('unpaid', 'Chưa thanh toán');
    };

    return (
        <View style={[{ paddingHorizontal: spacing.xs }]}>
            <View style={[styles.item, lastItem && styles.lastItem]}>
                <View style={styles.iconContainer}>
                    <DollarSign width={24} height={24} color={colors.success} />
                </View>
                <View style={styles.itemContent}>
                    <View style={styles.leftContent}>
                        <Text style={styles.itemDescription}>{transactionCode}</Text>
                        <Text style={styles.itemTime}>{formatDateTime(createdAt)}</Text>
                        <Text style={styles.commissionPercent}>
                            {t('commissionRate', 'Tỷ lệ hoa hồng')}: {commissionPercent}%
                        </Text>
                    </View>
                    <View style={styles.rightContent}>
                        <Text style={[styles.itemAmount, { color: colors.success }]}>
                            +{formatAmount(commissionAmount)}
                        </Text>
                        <Text style={[styles.itemState, { color: getStatusColor() }]}>
                            {getStatusText()}
                        </Text>
                    </View>
                </View>
            </View>
            {!lastItemInSection && <View style={styles.separator} />}
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        paddingVertical: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: spacing.xl,
        marginVertical: spacing.xs,
    },
    iconContainer: {
        marginRight: spacing.md,
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftContent: {
        flex: 1,
    },
    rightContent: {
        alignItems: 'flex-end',
    },
    itemDescription: {
        fontSize: 16,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
        color: colors.text.primary,
        marginBottom: 4,
    },
    itemTime: {
        fontSize: 12,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
        color: colors.text.secondary,
        marginBottom: 2,
    },
    commissionPercent: {
        fontSize: 12,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
        color: colors.text.secondary,
    },
    itemAmount: {
        fontSize: 16,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
        marginBottom: 2,
    },
    itemState: {
        fontSize: 12,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    },
    lastItem: {
        marginBottom: spacing.lg * 7,
    },
});

export default CommissionItem;