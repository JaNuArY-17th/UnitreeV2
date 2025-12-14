import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MenuSection } from './MenuSection';
import { FileText, Briefcase, Ticket } from '@/shared/assets/icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors } from '@/shared/themes';

export const UtilitiesSection: React.FC = () => {
  const { t } = useTranslation('profile');

  const utilityItems = [
    {
      id: 'bill-management',
      title: t('utilities.billManagement.title'),
      icon: <FileText width={24} height={24} color={colors.primary} />,
      onPress: () => console.log('Bill Management pressed'),
    },
    {
      id: 'contract-management',
      title: t('utilities.contractManagement.title'),
      icon: <Briefcase width={24} height={24} color={colors.primary} />,
      onPress: () => console.log('Contract Management pressed'),
    },
    {
      id: 'ticket-management',
      title: t('utilities.ticketManagement.title'),
      icon: <Ticket width={24} height={24} color={colors.primary} />,
      onPress: () => console.log('Ticket Management pressed'),
    },
  ];

  return (
    <MenuSection
      title={t('utilities.title')}
      items={utilityItems}
    />
  );
};
