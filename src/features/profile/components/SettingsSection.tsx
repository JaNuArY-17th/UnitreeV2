import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing } from '@/shared/themes';
import { MenuSection } from './MenuSection';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Notification03Icon,
  Globe02Icon,
  SecurityCheckIcon,
} from '@hugeicons/core-free-icons';

interface SettingsSectionProps { }

export const SettingsSection: React.FC<SettingsSectionProps> = () => {
  const { t } = useTranslation('profile');
  const navigation = useNavigation<any>();

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const handleSecuritySettings = () => {
    navigation.navigate('SecuritySettings');
  };

  // Settings menu items
  const settingsItems = [
    // {
    //   id: 'notifications',
    //   title: t('settings.notifications.title'),
    //   subtitle: t('settings.notifications.subtitle'),
    //   icon: <HugeiconsIcon icon={Notification03Icon} size={22} color={colors.primary} />,
    //   onPress: handleNotificationSettings,
    //   showArrow: true,
    // },
    {
      id: 'security',
      title: t('settings.security.title'),
      subtitle: t('settings.security.subtitle'),
      icon: <HugeiconsIcon icon={SecurityCheckIcon} size={22} color={colors.primary} />,
      onPress: handleSecuritySettings,
      showArrow: true,
    },
    {
      id: 'language',
      title: t('settings.language.title'),
      subtitle: t('settings.language.subtitle'),
      icon: <HugeiconsIcon icon={Globe02Icon} size={22} color={colors.primary} />,
      onPress: () => { }, // Empty function since LanguageSwitcher handles the interaction
      showArrow: false,
      rightComponent: <LanguageSwitcher backgroundColor={colors.primary} />,
    }
  ];

  return (
    <View style={styles.container}>
      <MenuSection
        title={t('settings.title')}
        items={settingsItems}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
});
