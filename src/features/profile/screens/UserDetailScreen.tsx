import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { ScreenHeader } from '@/shared/components';
import { Text } from '@/shared/components/base';
import { BackgroundPattern } from '@/shared/components/base';
import { Avatar, AvatarChangeModal } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  UserIcon,
  Call02Icon,
  Mail01Icon,
  Delete02Icon,
  UserMultiple02Icon,
  Calendar03Icon,
  IdentityCardIcon,
  Location01Icon,
  PencilEdit02Icon,
} from '@hugeicons/core-free-icons';
import { MenuSection } from '../components/MenuSection';
import { useUserData, USER_QUERY_KEYS } from '../hooks/useUserData';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import type { RootStackParamList } from '@/navigation';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { useUpdateAvatar, useGenerateUploadUrl } from '../hooks/useProfileMutations';

type UserDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const UserDetailScreen: React.FC = () => {
  const navigation = useNavigation<UserDetailScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('profile');
  const { t: commonT } = useTranslation('common');
  const queryClient = useQueryClient();
  const { data: userData, isLoading, error } = useUserData();

  // Avatar modal state
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  useStatusBarEffect('transparent', 'dark-content', true);

  // Debug cache status when UserDetailScreen loads

  // Format data for display
  const formatPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return '--';
    // Format as +84 XXX XXX XXX (show full number)
    const cleanPhone = phone.replace(/^84/, '');
    if (cleanPhone.length >= 9) {
      return `+84 ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
    }
    return phone;
  };

  const formatEmail = (email: string | null | undefined) => {
    if (!email) return '--';
    return email;
  };

  const formatName = (name: string | null | undefined) => {
    if (!name) return '--';
    return name;
  };

  const formatGender = (gender: string | boolean | null | undefined) => {
    if (gender === null || gender === undefined) return '--';
    if (typeof gender === 'boolean') {
      return gender ? t('user.male') : t('user.female');
    }
    if (typeof gender === 'string') {
      return gender === 'male' ? t('user.male') : gender === 'female' ? t('user.female') : gender;
    }
    return '--';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '--';
    }
  };

  const formatAddress = (address: string | null | undefined) => {
    if (!address) return '--';
    // Remove \n and display in one line
    return address.replace(/\n/g, ', ');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profileDetail.deleteAccount'),
      t('profileDetail.deleteAccountConfirm'),
      [
        {
          text: commonT('cancel'),
          style: 'cancel',
        },
        {
          text: t('profileDetail.deleteAccount'),
          style: 'destructive',
          onPress: () => {
            // Handle delete account logic
            console.log('Delete account pressed');
          },
        },
      ],
    );
  };

  const handleAvatarPress = () => {
    setIsAvatarModalVisible(true);
  };

  const handleChangePhone = () => {
    navigation.navigate('EditContact', { mode: 'phone' });
  };

  const handleChangeEmail = () => {
    navigation.navigate('EditContact', { mode: 'email' });
  };

  // const profileItems = [

  // ];

  // const verificationItems = [

  // ];

  const contactItems = [
    {
      id: 'name',
      title: formatName(userData?.full_name),
      subtitle: t('user.name'),
      icon: <HugeiconsIcon icon={UserIcon} size={24} color={colors.primary} />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'phone',
      title: formatPhoneNumber(userData?.phone_number),
      subtitle: t('user.phone'),
      icon: <HugeiconsIcon icon={Call02Icon} size={24} color={colors.primary} />,
      onPress: handleChangePhone,
      showArrow: false,
      rightComponent: (
        <HugeiconsIcon icon={PencilEdit02Icon} size={20} color={colors.primary} />
      ),
    },
    {
      id: 'email',
      title: formatEmail(userData?.email),
      subtitle: t('user.email'),
      icon: <HugeiconsIcon icon={Mail01Icon} size={24} color={colors.primary} />,
      onPress: handleChangeEmail,
      showArrow: false,
      rightComponent: (
        <HugeiconsIcon icon={PencilEdit02Icon} size={20} color={colors.primary} />
      ),
    },
    {
      id: 'gender',
      title: formatGender(userData?.gender),
      subtitle: t('user.gender'),
      icon: <HugeiconsIcon icon={UserMultiple02Icon} size={24} color={colors.primary} />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'dateOfBirth',
      title: formatDate(userData?.date_of_birth),
      subtitle: t('user.dateOfBirth'),
      icon: <HugeiconsIcon icon={Calendar03Icon} size={24} color={colors.primary} />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'nationality',
      title: userData?.nationality || '--',
      subtitle: t('user.nationality'),
      icon: <HugeiconsIcon icon={IdentityCardIcon} size={24} color={colors.primary} />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'permanentAddress',
      title: formatAddress(userData?.permanent_address),
      subtitle: t('user.permanentAddress'),
      icon: <HugeiconsIcon icon={Location01Icon} size={24} color={colors.primary} />,
      onPress: () => { },
      showArrow: false,
    },
    {
      id: 'contactAddress',
      title: formatAddress(userData?.contact_address),
      subtitle: t('user.contactAddress'),
      icon: <HugeiconsIcon icon={Location01Icon} size={24} color={colors.primary} />,
      onPress: () => { },
      showArrow: false,
    },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor='transparent' />
        <BackgroundPattern />
        <ScreenHeader
          title={t('profileDetail.title')}
          showBack

        />
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error || !userData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor='transparent' />
        <BackgroundPattern />
        <ScreenHeader
          title={t('profileDetail.title')}
          showBack
        />
        <View style={styles.errorContainer}>
          <Text>Error loading user data</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />

      <ScreenHeader
        title={t('profileDetail.title')}
        showBack
      />

      <View style={styles.content}>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Avatar
                size={100}
                name={userData?.full_name || 'User'}
                imageUri={userData?.avatar?.file_url}
              />
              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={handleAvatarPress}
              >
                <HugeiconsIcon icon={PencilEdit02Icon} size={15} color={colors.light} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic Profile Details Section */}
          {/* <MenuSection title={t('user.profile')} items={profileItems} /> */}

          {/* Verification Information Section */}
          {/* <MenuSection title={t('user.verificationInfo')} items={verificationItems} /> */}

          {/* Contact Information Section */}
          <MenuSection items={contactItems} reverse={true} />
          <View style={styles.deleteAccountContainer}>
            <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
              <HugeiconsIcon icon={Delete02Icon} size={26} color={colors.danger} />
              <View style={styles.deleteAccountTextContainer}>
                <Text style={styles.deleteAccountTitle}>{t('profileDetail.deleteAccount')}</Text>
                <Text style={styles.deleteAccountSubtitle}>{t('profileDetail.deleteAccountDescription')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Avatar Change Modal */}
      <AvatarChangeModal
        visible={isAvatarModalVisible}
        onClose={() => setIsAvatarModalVisible(false)}
        onAvatarUpdated={async (avatarData) => {
          // Refresh user data after avatar update
          await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.userData });
        }}
        currentAvatarUrl={userData?.avatar?.file_url}
        userName={userData?.full_name || 'User'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avatarSection: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  avatarContainer: {
    position: 'relative',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.light,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  validationCard: {
    backgroundColor: colors.light,
    borderRadius: 14,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  validationContent: {
    alignItems: 'center',
  },
  guidedByText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  validateButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  validateButtonText: {
    ...typography.buttonText,
    color: colors.light,
  },
  deleteAccountContainer: {
    backgroundColor: colors.light,
    borderRadius: 14,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,

  },
  deleteAccountTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  deleteAccountTitle: {
    ...typography.body,
    color: colors.danger,
    marginBottom: 2,
  },
  deleteAccountSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.light,
    marginBottom: spacing.sm,
  },
  modalOptionText: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
  },
  removeOption: {
    backgroundColor: colors.dangerSoft,
  },
});

export default UserDetailScreen;
