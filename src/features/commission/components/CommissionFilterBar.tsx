import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '@/shared/components/base/Text';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '../../../shared/themes';

interface CommissionFilterBarProps {
    isPaidFilter: boolean | undefined;
    onPaidFilterChange: (paid?: boolean) => void;
}

const CommissionFilterBar: React.FC<CommissionFilterBarProps> = ({
    isPaidFilter,
    onPaidFilterChange,
}) => {
    const { t } = useTranslation('commission');

    return (
        <View style={styles.filterBar}>
            <Pressable
                style={[styles.filterButton, isPaidFilter === undefined && styles.filterButtonActive]}
                onPress={() => onPaidFilterChange(undefined)}
            >
                <Text style={[styles.filterButtonText, isPaidFilter === undefined && styles.filterButtonTextActive]}>
                    {t('all', 'All')}
                </Text>
            </Pressable>
            <Pressable
                style={[styles.filterButton, isPaidFilter === true && styles.filterButtonActive]}
                onPress={() => onPaidFilterChange(true)}
            >
                <Text style={[styles.filterButtonText, isPaidFilter === true && styles.filterButtonTextActive]}>
                    {t('paidOnly', 'Paid Only')}
                </Text>
            </Pressable>
            <Pressable
                style={[styles.filterButton, isPaidFilter === false && styles.filterButtonActive]}
                onPress={() => onPaidFilterChange(false)}
            >
                <Text style={[styles.filterButtonText, isPaidFilter === false && styles.filterButtonTextActive]}>
                    {t('unpaidOnly', 'Unpaid Only')}
                </Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    filterBar: {
        flexDirection: 'row',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: dimensions.radius.md,
        paddingVertical: spacing.xs,
        gap: spacing.sm,
    },
    filterButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: dimensions.radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonText: {
        fontSize: 13,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
        color: colors.text.secondary,
    },
    filterButtonTextActive: {
        color: colors.light,
        fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    },
});

export default CommissionFilterBar;