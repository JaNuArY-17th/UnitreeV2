import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing } from '@/shared/themes';
import { BackgroundPattern } from '@/shared/components/base';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { MenuSection } from '@/features/profile/components/MenuSection';
import { Bell, Sound, Vibration } from '@/shared/assets/icons';

const NotificationSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('profile');
  
  // Notification settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Handle notification enable/disable
  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    if (!value) {
      // Disable sound and vibration when notifications are disabled
      setSoundEnabled(false);
      setVibrationEnabled(false);
    }
  };

  // Handle sound toggle (only if notifications are enabled)
  const handleSoundToggle = (value: boolean) => {
    if (notificationsEnabled) {
      setSoundEnabled(value);
    }
  };

  // Handle vibration toggle (only if notifications are enabled)
  const handleVibrationToggle = (value: boolean) => {
    if (notificationsEnabled) {
      setVibrationEnabled(value);
    }
  };

  // Create menu items with toggle functionality
  const notificationItems = [
    {
      id: 'notifications',
      title: t('settings.notifications.enable'),
      icon: <Bell width={20} height={20} color={colors.primary} />,
      onPress: () => {}, // Empty function since toggle handles the interaction
      showArrow: false,
      showToggle: true,
      toggleValue: notificationsEnabled,
      onToggle: handleNotificationToggle,
    },
    {
      id: 'sound',
      title: t('settings.notifications.sound'),
      icon: <Sound width={20} height={20} color={notificationsEnabled ? colors.primary : colors.lightGray} />,
      onPress: () => {}, // Empty function since toggle handles the interaction
      showArrow: false,
      showToggle: true,
      toggleValue: soundEnabled,
      onToggle: handleSoundToggle,
      disabled: !notificationsEnabled,
    },
    {
      id: 'vibration',
      title: t('settings.notifications.vibration'),
      icon: <Vibration width={20} height={20} color={notificationsEnabled ? colors.primary : colors.lightGray} />,
      onPress: () => {}, // Empty function since toggle handles the interaction
      showArrow: false,
      showToggle: true,
      toggleValue: vibrationEnabled,
      onToggle: handleVibrationToggle,
      disabled: !notificationsEnabled,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />
      
      <ScreenHeader title={t('settings.notifications.title')} />

      <View style={styles.content}>
        <View style={styles.menuContainer}>
          <MenuSection items={notificationItems} />
        </View>
      </View>
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
    paddingTop: spacing.md,
  },
  menuContainer: {
  },
});

export default NotificationSettingsScreen;
