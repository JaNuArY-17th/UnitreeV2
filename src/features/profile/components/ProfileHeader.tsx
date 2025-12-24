import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from '@/shared/components';
import { colors, spacing, dimensions, typography } from '@/shared/themes';

interface ProfileHeaderProps {
  avatar?: string;
  fullname?: string;
  email?: string;
  isUploading?: boolean;
  onAvatarPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatar,
  fullname = 'User',
  email = 'No email provided',
  isUploading = false,
  onAvatarPress,
}) => {
  const [avatarError, setAvatarError] = React.useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onAvatarPress}
        disabled={isUploading}
      >
        <View style={styles.avatar}>
          {avatar && !avatarError ? (
            <Image
              source={{ uri: avatar }}
              style={styles.avatarImage}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <Text style={styles.avatarLabel}>{fullname?.charAt(0) || 'U'}</Text>
          )}
          {isUploading && (
            <View style={styles.avatarOverlay}>
              <Icon name="loading" size={24} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.avatarEditIcon}>
          <Icon name="camera" size={16} color="#fff" />
        </View>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{fullname}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: spacing.md,
    right: 0,
    backgroundColor: colors.success,
    borderRadius: dimensions.radius.md,
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: colors.light,
  },
  avatarLabel: {
    fontSize: dimensions.fontSize.xxxl,
    color: colors.light,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    ...typography.h0,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  email: {
    ...typography.subtitle,
    color: colors.success,
    opacity: 0.8,
    textAlign: 'center',
  },
});
