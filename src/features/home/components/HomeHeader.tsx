import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ImageBackground,
} from 'react-native';
import { Text } from '@/shared/components';
import { colors, dimensions, spacing, typography } from '@/shared/themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from '@shared/assets/icons';

interface HomeHeaderProps {
  userName: string;
  userAvatar?: string;
  isOnline?: boolean;
  onNotificationPress?: () => void;
  hasNotification?: boolean;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  userAvatar,
  isOnline = true,
  onNotificationPress,
  hasNotification = true,
}) => {
  const insets = useSafeAreaInsets();

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      Alert.alert('Thông báo', 'Bạn không có thông báo mới');
    }
  };

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: insets.top - spacing.xl },
      ]}
    >
      <View style={styles.leftSection}>
        <ImageBackground
          source={require('@shared/assets/mascots/Unitree - Mascot-2-round.png')}
          style={styles.mascotBackground}
          imageStyle={styles.mascotImage}
        >
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {userName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {isOnline && <View style={styles.onlineIndicator} />}
          </View>
        </ImageBackground>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTime}>Good Morning,</Text>
          <Text style={styles.greetingName}>{userName}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={handleNotificationPress}
        activeOpacity={0.7}
      >
        <Bell width={24} height={24} color={colors.dark} />
        {hasNotification && (
          <>
            <View style={styles.notificationPulse} />
            <View style={styles.notificationDot} />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: spacing.lg,
    // position: 'absolute',
    // top: -20,
    // left: 0,
    // right: 0,
    // zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mascotBackground: {
    width: 100,
    height: 100,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  mascotImage: {
    opacity: 1,
    resizeMode: 'contain',
  },
  avatarContainer: {
    position: 'absolute',
    top: 49,
    left: 27
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: dimensions.radius.round,
    borderWidth: 2,
    borderColor: colors.light,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: dimensions.radius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  avatarPlaceholderText: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.dark,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.light,
  },
  greetingContainer: {
  },
  greetingTime: {
    ...typography.subtitle,
    color: colors.gray,
  },
  greetingName: {
    ...typography.h2,
    color: colors.dark,
  },
  notificationButton: {
    width: 52,
    height: 52,
    borderRadius: dimensions.radius.round,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationPulse: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 7,
    height: 7,
    borderRadius: dimensions.radius.round,
    backgroundColor: colors.primary,
    opacity: 0.6,
  },
  notificationDot: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 7,
    height: 7,
    borderRadius: dimensions.radius.round,
    backgroundColor: colors.primary,
  },
});
