import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { useTranslation } from 'react-i18next';
import { FONT_WEIGHTS } from '@/shared/themes/fonts';
import { Lock } from '../assets';

type Props = {
    onDismiss?: () => void;
    style?: any;
};

const StoreLockedBanner: React.FC<Props> = ({ onDismiss, style }) => {
    const { t } = useTranslation('store');

    const title = t('locked_banner_title', 'Tài khoản bị khóa - Liên hệ quản trị viên để kích hoạt lại');

    const pulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [pulse]);

    const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
    const fade = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });

    return (
        <Pressable
            style={[styles.container, style]}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityHint={t('common:dismiss', 'Dismiss')}
            // onPress={onDismiss}
        >
            <View style={styles.row}>
                <View style={styles.leading}>
                    <View style={styles.iconWrap}>
                        <Lock width={28} height={28} color={colors.light} />
                        <Animated.View style={[styles.pulseDot, { opacity: fade, transform: [{ scale }] }]} />
                    </View>
                </View>

                <Text variant="body" weight={FONT_WEIGHTS.REGULAR} style={styles.title}>
                    {title}
                </Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        // Red danger theme for locked status
        // backgroundColor: 'rgba(220, 53, 69, 0.12)',
        backgroundColor: colors.danger,
        borderRadius: 12,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        marginHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: colors.danger,
        overflow: 'hidden',
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: {
        color: colors.light,
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
    },
    leading: {
        marginRight: spacing.md,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
    },
    pulseDot: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(224, 198, 201, 0.6)',
    },
});

export default StoreLockedBanner;