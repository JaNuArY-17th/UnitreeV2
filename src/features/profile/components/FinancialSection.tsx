import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MenuSection } from './MenuSection';
import { CreditCard, Settings, Shield } from '@/shared/assets/icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors } from '@/shared/themes';

export const FinancialSection: React.FC = () => {
  const { t } = useTranslation('profile');

  const financialItems = [
    {
      id: 'linked-accounts',
      title: t('financial.linkedAccounts.title'),
      icon: <CreditCard width={24} height={24} color={colors.primary} />,
      onPress: () => console.log('Linked Accounts pressed'),
    },
    {
      id: 'auto-payment',
      title: t('financial.autoPayment.title'),
      subtitle: t('financial.autoPayment.subtitle'),
      icon: <Settings width={24} height={24} color={colors.primary} />,
      onPress: () => console.log('Auto Payment pressed'),
    },
    {
      id: 'zalopay-credit',
      title: t('financial.zalopayCredit.title'),
      icon: <Shield width={24} height={24} color={colors.primary} />,
      onPress: () => console.log('Zalopay Credit pressed'),
    },
  ];

  const handleViewMore = () => {
    console.log('View More Financial pressed');
  };

  return (
    <MenuSection
      title={t('financial.title')}
      items={financialItems}
      showViewMore={true}
      onViewMore={handleViewMore}
      viewMoreText={t('financial.viewMore')}
    />
  );
};
