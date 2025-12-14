import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing } from '@/shared/themes';
import { BackgroundPattern } from '@/shared/components/base';
import { ScreenHeader } from '@/shared/components';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { MenuSection } from '@/features/profile/components/MenuSection';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  PlusSignIcon,
  Link01Icon,
  Globe02Icon,
  File02Icon,
  UserIcon,
  File01Icon,
  VolumeHighIcon,
} from '@hugeicons/core-free-icons';


const SpeakerServiceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('notifications');
  const navigation = useNavigation();

  useStatusBarEffect('transparent', 'dark-content', true);

  const serviceOptions = [
    {
      id: 'buy',
      title: t('speaker.buyMore'),
      icon: <HugeiconsIcon icon={PlusSignIcon} size={20} color={colors.primary} />,
      onPress: () => {
        console.log('Buy more speakers');
      },
    },
    {
      id: 'link',
      title: t('speaker.linkSpeaker'),
      icon: <HugeiconsIcon icon={Link01Icon} size={22} color={colors.primary} />,
      onPress: () => {
        navigation.navigate('LinkSpeaker' as never);
      },
    },
    {
      id: 'wifi',
      title: t('speaker.wifiSettings'),
      icon: <HugeiconsIcon icon={Globe02Icon} size={22} color={colors.primary} />,
      onPress: () => {
        console.log('WiFi settings');
      },
    },
    {
      id: 'contract',
      title: t('speaker.contractManagement'),
      icon: <HugeiconsIcon icon={File02Icon} size={22} color={colors.primary} />,
      onPress: () => {
        console.log('Contract management');
      },
    },
    {
      id: 'staff',
      title: t('speaker.staffManagement'),
      icon: <HugeiconsIcon icon={UserIcon} size={22} color={colors.primary} />,
      onPress: () => {
        console.log('Staff management');
      },
    },
    {
      id: 'package',
      title: t('speaker.packageManagement'),
      icon: <HugeiconsIcon icon={File01Icon} size={22} color={colors.primary} />,
      onPress: () => {
        console.log('Package management');
      },
    },
    {
      id: 'voice',
      title: t('speaker.voiceOfYou'),
      icon: <HugeiconsIcon icon={VolumeHighIcon} size={22} color={colors.primary} />,
      onPress: () => {
        console.log('Voice of you');
      },
    },
  ];


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <BackgroundPattern />

      <ScreenHeader title={t('speaker.serviceTitle')} showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MenuSection items={serviceOptions} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});

export default SpeakerServiceScreen;
