import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '../../../shared/themes';

interface CommissionSectionHeaderProps {
    title: string;
    count?: number;
}

const CommissionSectionHeader: React.FC<CommissionSectionHeaderProps> = ({
    title,
    count,
}) => {
    return (
        <View style={styles.headerContainer}>
            <Text style={styles.headerText}>
                {title}
                {count !== undefined && (
                    <Text style={styles.countText}> ({count})</Text>
                )}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingVertical: spacing.sm,
    },
    headerText: {
        fontSize: 14,
        fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
        color: colors.text.primary,
    },
    countText: {
        fontSize: 14,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
        color: colors.text.secondary,
    },
});

export default CommissionSectionHeader;