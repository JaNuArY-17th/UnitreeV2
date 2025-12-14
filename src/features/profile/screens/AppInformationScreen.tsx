import React from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import { Text } from '@/shared/components/base';
import { BackgroundPattern } from '@/shared/components/base';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const AppInformationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('profile');

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <BackgroundPattern />

      <ScreenHeader
        title={t('appInformation.title')}
        showBack
      />

      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.appName}>ESPay</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
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
    alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  appName: {
    fontSize: 24,

    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  version: {
    fontSize: 18,
    color: colors.gray,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AppInformationScreen;
