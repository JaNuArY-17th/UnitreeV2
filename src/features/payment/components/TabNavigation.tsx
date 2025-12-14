import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, getFontFamily, FONT_WEIGHTS, spacing } from '@/shared/themes';

interface TabNavigationProps {
  activeTab: 'bank' | 'wallet';
  onTabPress: (tab: 'bank' | 'wallet') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const { t } = useTranslation('payment');

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'bank' && styles.activeTab]}
        onPress={() => onTabPress('bank')}
      >
        <Text style={[styles.tabText, activeTab === 'bank' && styles.activeTabText]}>
          {t('transferMethod.bankTransfer')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'wallet' && styles.activeTab]}
        onPress={() => onTabPress('wallet')}
      >
        <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>
          {t('transferMethod.ezyWallet')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,

  },
});
