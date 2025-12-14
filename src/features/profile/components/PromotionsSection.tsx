import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MenuSection } from './MenuSection';
import { Gift, TrendingUp } from '@/shared/assets/icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors } from '@/shared/themes';

export const PromotionsSection: React.FC = () => {
  const { t } = useTranslation('profile');

  const promotionItems = [
    {
      id: 'gifts',
      title: t('promotions.myGifts.title'),
      subtitle: t('promotions.myGifts.count', { count: 30 }),
      icon: <Gift width={24} height={24} color={colors.primary} />,
      onPress: () => console.log('My Gifts pressed'),
    },
    {
      id: 'trends',
      title: t('promotions.trends.title'),
      subtitle: t('promotions.trends.count', { count: 329 }),
      icon: <TrendingUp width={24} height={24} color={colors.primary} />,
      onPress: () => console.log('Trends pressed'),
    },
  ];

  return (
    <MenuSection
      title={t('promotions.title')}
      items={promotionItems}
    />
  );
};
