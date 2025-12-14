import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MenuSection } from './MenuSection';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CustomerSupportIcon, Shield01Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { RootStackParamList } from '@/navigation';
import { colors, spacing } from '@/shared/themes';

type HelpCenterSectionNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HelpCenterSection: React.FC = () => {
  const { t } = useTranslation('profile');
  const navigation = useNavigation<HelpCenterSectionNavigationProp>();

  const handleAppInformation = () => {
    navigation.navigate('AppInformation');
  };

  const handleSupportCenter = () => {
    navigation.navigate('SupportCenter');
  };

  const handlePolicySecurityRisk = () => {
    navigation.navigate('Policy');
  };

  const helpCenterItems = [
    // {
    //   id: 'app-information',
    //   title: t('helpCenter.appInformation.title'),
    //   subtitle: t('helpCenter.appInformation.subtitle'),
    //   icon: <InfoIcon width={24} height={24} color={colors.primary} />,
    //   onPress: handleAppInformation,
    // },
    {
      id: 'support-center',
      title: t('helpCenter.supportCenter.title'),
      subtitle: t('helpCenter.supportCenter.subtitle'),
      icon: <HugeiconsIcon icon={CustomerSupportIcon} size={24} color={colors.primary} />,
      onPress: handleSupportCenter,
    },
    {
      id: 'policy-security-risk',
      title: t('helpCenter.policySecurityRisk.title'),
      subtitle: t('helpCenter.policySecurityRisk.subtitle'),
      icon: <HugeiconsIcon icon={Shield01Icon} size={24} color={colors.primary} />,
      onPress: handlePolicySecurityRisk,
    },
  ];

  return (
    <View style={styles.container}>
      <MenuSection
        title={t('helpCenter.title')}
        items={helpCenterItems}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
});
