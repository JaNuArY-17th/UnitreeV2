import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MenuSection } from './MenuSection';
import { Star, People, HelpCenter } from '@/shared/assets/icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors } from '@/shared/themes';

export const SupportSection: React.FC = () => {
  const { t } = useTranslation('profile');

  const supportItems = [
    {
      id: 'rate-us',
      title: t('support.rateUs.title'),
      subtitle: t('support.rateUs.subtitle'),
      icon: <Star width={24} height={24} color="#2D796D" />,
      onPress: () => console.log('Rate us pressed'),
    },
    {
      id: 'about-gastos',
      title: t('support.aboutGastos.title'),
      subtitle: t('support.aboutGastos.subtitle'),
      icon: <People width={24} height={24} color="#2D796D" />,
      onPress: () => console.log('About Gastos pressed'),
    },
    {
      id: 'help-support',
      title: t('support.helpSupport.title'),
      subtitle: t('support.helpSupport.subtitle'),
      icon: <HelpCenter width={24} height={24} color="#2D796D" />,
      onPress: () => console.log('Help & Support pressed'),
    },
  ];

  return (
    <MenuSection
      items={supportItems}
    />
  );
};
