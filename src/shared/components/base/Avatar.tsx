import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily } from '@/shared/themes';
import Text from './Text';

export interface AvatarProps {
  size?: number;
  name?: string;
  imageUri?: string | null;
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
}

const getInitials = (name: string) => {
  const parts = name.split(' ').filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

/**
 * Safely extract URI from avatar data
 */
const extractAvatarUri = (avatar: any): string => {
  if (!avatar) return '';

  if (typeof avatar === 'string') return avatar;

  if (typeof avatar === 'object') {
    return avatar.file_url || avatar.uri || avatar.url || '';
  }

  return '';
};

/**
 * Check if avatar URI is valid
 */
const isValidAvatarUri = (uri: string): boolean => {
  if (!uri || typeof uri !== 'string' || uri.trim() === '') return false;
  return uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:') || uri.startsWith('file://');
};

/**
 * Get avatar source for Image component
 */
const getAvatarSource = (avatar: any): { uri: string } | null => {
  const uri = extractAvatarUri(avatar);
  return isValidAvatarUri(uri) ? { uri } : null;
};

const Avatar: React.FC<AvatarProps> = ({
  size = 88,
  name = '',
  imageUri,
  backgroundColor = '#8FD1A5',
  textColor = colors.light,
  onPress,
}) => {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
  };

  const AvatarContent = () => {
    const avatarSource = getAvatarSource(imageUri);

    if (avatarSource) {
      return (
        <View style={[styles.avatar, avatarStyle]}>
          <Image
            source={avatarSource}
            style={[styles.avatarImage, avatarStyle]}
            resizeMode="cover"
          />
        </View>
      );
    }

    // Fallback to initials
    return (
      <View style={[styles.avatar, styles.avatarFallback, avatarStyle]}>
        <Text
          variant="h2"
          style={[styles.initials, { color: textColor, fontSize: size * 0.35 }]}
        >
          {getInitials(name)}
        </Text>
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <AvatarContent />
      </TouchableOpacity>
    );
  }

  return <AvatarContent />;
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    backgroundColor: '#8FD1A5',
  },
  avatarImage: {
    // Image will inherit size from avatarStyle
  },
  initials: {

  },
});

export default Avatar;
