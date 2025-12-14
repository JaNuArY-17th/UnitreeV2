import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing } from '@/shared/themes';

import { UserProfileCard } from '../components/UserProfileCard';
import { AccountSection } from '../components/AccountSection';
import { SettingsSection } from '../components/SettingsSection';
import { LogoutButton } from '../components/LogoutButton';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('profile');
  const queryClient = useQueryClient();

  // Debug cache status when ProfileScreen loads
  useEffect(() => {
    console.log('🏠 [ProfileScreen] Screen loaded - checking cache status...');
  }, [queryClient]);

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      {/* <BackgroundPattern /> */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <UserProfileCard />
        <AccountSection />
        <SettingsSection />
        {/* <HelpCenterSection /> */}

        {/* <ReferSection />
        <SupportSection /> */}
        <LogoutButton />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
});

export default ProfileScreen;
