import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MenuSection } from './MenuSection';
import { Share } from '@/shared/assets/icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors } from '@/shared/themes';

export const ReferSection: React.FC = () => {
  const { t } = useTranslation('profile');

  const referItems = [
    {
      id: 'refer-earn',
      title: t('refer.title'),
      subtitle: t('refer.subtitle'),
      icon: <Share width={24} height={24} color="#2D796D" />,
      onPress: () => console.log('Refer & Earn pressed'),
    },
  ];

  return (
    <MenuSection
      items={referItems}
    />
  );
};
