import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wifi, Settings } from '@/shared/assets/icons';
import { useTranslation } from 'react-i18next';

interface WifiHeaderProps {
  onWifiPress?: () => void;
  onSettingsPress?: () => void;
}

export const WifiHeader: React.FC<WifiHeaderProps> = ({ 
  onWifiPress,
  onSettingsPress 
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('wifi');

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onWifiPress}
        activeOpacity={0.7}
      >
        <View style={styles.wifiIconContainer}>
          <Wifi width={28} height={28} color={colors.primary} />
        </View>
      </TouchableOpacity>
      
      <Text style={styles.title}>{t('header.title')}</Text>
      
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onSettingsPress}
        activeOpacity={0.7}
      >
        <Settings width={28} height={28} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wifiIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
  },
});
