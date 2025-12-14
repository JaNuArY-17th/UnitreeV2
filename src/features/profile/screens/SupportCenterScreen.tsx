import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors, spacing } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import { Text } from '@/shared/components/base';
import { BackgroundPattern } from '@/shared/components/base';
import { MenuSection } from '../components/MenuSection';
import { CreditCard, Address, Profile, Phone, Calendar, Shield, CallCalling } from '@/shared/assets/icons';

const SupportCenterScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('profile');

    useStatusBarEffect('transparent', 'dark-content', true);

    const contactItems = [
        {
            id: 'taxCode',
            title: '0107940246',
            subtitle: t('supportCenter.contactInfo.labels.taxCode'),
            icon: <CreditCard width={28} height={28} color={colors.primary} />,
            onPress: () => {},
            showArrow: false,
        },
        {
            id: 'taxAddress',
            title: 'Thôn Quyết Tiến, Xã An Khánh, Thành phố Hà Nội, Việt Nam',
            subtitle: t('supportCenter.contactInfo.labels.taxAddress'),
            icon: <Address width={28} height={28} color={colors.primary} />,
            onPress: () => {},
            showArrow: false,
        },
        {
            id: 'address',
            title: 'Thôn Quyết Tiến, Xã La Phú, Huyện Hoài Đức, Thành phố Hà Nội, Việt Nam',
            subtitle: t('supportCenter.contactInfo.labels.address'),
            icon: <Address width={28} height={28} color={colors.primary} />,
            onPress: () => {},
            showArrow: false,
        },
        {
            id: 'legalRepresentative',
            title: 'NGO THI NHUNG',
            subtitle: t('supportCenter.contactInfo.labels.legalRepresentative'),
            icon: <Profile width={28} height={28} color={colors.primary} />,
            onPress: () => {},
            showArrow: false,
        },
        {
            id: 'phone',
            title: '+84 336 809 975',
            subtitle: t('supportCenter.contactInfo.labels.phone'),
            icon: <CallCalling width={28} height={28} color={colors.primary} />,
            onPress: () => {},
            showArrow: false,
        },
        {
            id: 'establishedDate',
            title: '28/07/2017',
            subtitle: t('supportCenter.contactInfo.labels.establishedDate'),
            icon: <Calendar width={28} height={28} color={colors.primary} />,
            onPress: () => {},
            showArrow: false,
        },
        {
            id: 'managedBy',
            title: 'Chi cục Thuế Hoài Đức - Cục Thuế Thành phố Hà Nội',
            subtitle: t('supportCenter.contactInfo.labels.managedBy'),
            icon: <Shield width={28} height={28} color={colors.primary} />,
            onPress: () => {},
            showArrow: false,
        },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" />
            <BackgroundPattern />

            <ScreenHeader
                title={t('supportCenter.title')}
                showBack
            />

            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.subtitle}>
                        {t('supportCenter.contactInfo.subtitle')}
                    </Text>
                </View>

                <MenuSection
                    items={contactItems}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        // paddingHorizontal: spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        // marginTop: spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: colors.gray,
        lineHeight: 20,
    },
});

export default SupportCenterScreen;