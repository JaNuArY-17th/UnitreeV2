import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Text from '@/shared/components/base/Text';
import { Avatar, BackgroundPatternSolid } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CheckmarkCircle02Icon, PencilEdit02Icon, UserIcon } from '@hugeicons/core-free-icons';
import { SkeletonCircle, SkeletonLine, SkeletonBlock } from '@/shared/components/skeleton';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import type { RootStackParamList } from '@/navigation';
import { useUserData } from '../hooks/useUserData';
import { BackgroundPattern } from '@/shared/components/base';

type UserProfileCardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const UserProfileCard: React.FC = () => {
  const { t } = useTranslation('profile');
  const navigation = useNavigation<UserProfileCardNavigationProp>();
  const { data: userData, isLoading, error } = useUserData();

  const handleCardPress = () => {
    navigation.navigate('UserDetail');
  };

  // Format phone number from 84359028368 to +84 359 028 368
  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return '--';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('84') && cleaned.length >= 11) {
      const countryCode = '+84';
      const number = cleaned.substring(2);
      return `${countryCode} ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    return phone;
  };

  if (isLoading) {
    return (
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.8} disabled>
        <View style={styles.container}>
          <BackgroundPatternSolid borderRadius={dimensions.radius.lg} backgroundColor={colors.primary} patternColor={colors.light} />
          <View style={styles.userInfo}>
            {/* Avatar skeleton */}
            <SkeletonCircle
              width={60}
              style={styles.avatarSkeleton}
            />

            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                {/* Name skeleton */}
                <SkeletonLine
                  width={120}
                  height={20}
                  style={styles.nameSkeleton}
                />
                {/* Verification icon skeleton */}
                <SkeletonCircle
                  width={16}
                  style={styles.verificationSkeleton}
                />
              </View>

              {/* Phone skeleton */}
              <SkeletonLine
                width={140}
                height={16}
                style={styles.phoneSkeleton}
              />

              {/* Verified badge skeleton */}
              {/* <SkeletonBlock
                width={80}
                height={24}
                borderRadius={dimensions.radius.sm}
                style={styles.badgeSkeleton}
              /> */}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (error || !userData) {
    return (
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.8}>
        {/* <BackgroundPatternSolid borderRadius={dimensions.radius.lg} backgroundColor={colors.primary} patternColor={colors.light} /> */}
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <HugeiconsIcon icon={UserIcon} size={30} color={colors.light} />
          </View>

          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{t('user.unableToLoad')}</Text>
            </View>

            <Text style={styles.userPhone}>--</Text>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <HugeiconsIcon icon={PencilEdit02Icon} size={20} color={colors.light} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  const isVerified = userData.is_verified || false;

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.8}>

      <View style={styles.container}>
        <BackgroundPatternSolid borderRadius={dimensions.radius.lg} backgroundColor={colors.primary} patternColor={colors.light} />

        <View style={styles.userInfo}>
          <Avatar
            size={40}
            name={userData.full_name || 'User'}
            imageUri={userData.avatar?.file_url}
            backgroundColor={colors.light}
            textColor={colors.primary}
          />

          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{userData.full_name || '--'}</Text>
              {isVerified && (
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={16}
                  color={colors.light}
                />
              )}
            </View>

            <Text style={styles.userPhone}>
              {formatPhoneNumber(userData.phone_number)}
            </Text>

            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>
                  {t('user.verified', 'Verified')}
                </Text>
              </View>
            )}
          </View>

          {/* <TouchableOpacity style={styles.editButton}>
            <PencilEdit width={20} height={20} color={colors.light} />
          </TouchableOpacity> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    // marginTop: spacing.lg,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    // backgroundColor: colors.primary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.title,
    lineHeight: 0,
    color: colors.text.light,
    marginRight: spacing.xs,
  },
  userPhone: {
    ...typography.body,
    color: colors.text.light,
    marginBottom: spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.sm,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    ...typography.caption,
    color: colors.primary,
  },
  editButton: {
    padding: spacing.sm,
  },
  // Skeleton styles
  avatarSkeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  nameSkeleton: {
    marginRight: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  verificationSkeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  phoneSkeleton: {
    marginBottom: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeSkeleton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
