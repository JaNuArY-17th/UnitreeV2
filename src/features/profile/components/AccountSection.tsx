import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MenuSection } from './MenuSection';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { UserIcon, Store01Icon, Wallet01Icon, VolumeHighIcon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { RootStackParamList } from '@/navigation';
import { colors } from '@/shared/themes';
import { useAccountType } from '../../authentication';

type AccountSectionNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AccountSection: React.FC = () => {
  const { t } = useTranslation('profile');
  const navigation = useNavigation<AccountSectionNavigationProp>();
  const { userData } = useAccountType();
  const userAccountType = userData?.account_type || (userData?.is_shop ? 'STORE' : 'USER');

  const handleProfileDetails = () => {
    navigation.navigate('UserDetail');
  };

  const handleStoreDetails = () => {
    navigation.navigate('StoreDetail');
  }

  const handleMyWallet = () => {
    navigation.navigate('AccountManagement');
  };

  const handleSpeakerNotification = () => {
    navigation.navigate('SpeakerNotificationSettings');
  };

  const accountItems = [
    {
      id: 'profile-details',
      title: t('account.profileDetails.title'),
      subtitle: t('account.profileDetails.subtitle'),
      icon: <HugeiconsIcon icon={UserIcon} size={24} color={colors.primary} />,
      onPress: handleProfileDetails,
    },
    ...(userAccountType === 'STORE' ? [{
      id: 'shop-details',
      title: t('account.shopDetails.title'),
      subtitle: t('account.shopDetails.subtitle'),
      icon: <HugeiconsIcon icon={Store01Icon} size={24} color={colors.primary} />,
      onPress: handleStoreDetails,
    }] : []),
    {
      id: 'my-wallet',
      title: t('account.myWallet.title'),
      subtitle: t('account.myWallet.subtitle'),
      icon: <HugeiconsIcon icon={Wallet01Icon} size={20} color={colors.primary} />,
      onPress: handleMyWallet,
    },
    ...(userAccountType === 'STORE' ? [{
      id: 'speaker-notification',
      title: t('account.speakerNotification.title'),
      subtitle: t('account.speakerNotification.subtitle'),
      icon: <HugeiconsIcon icon={VolumeHighIcon} size={24} color={colors.primary} />,
      onPress: handleSpeakerNotification,
    }] : []),
  ];

  return (
    <MenuSection
      title={t('account.title')}
      items={accountItems}
    />
  );
};
