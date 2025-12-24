import React from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';
import { spacing } from '@/shared/themes';

interface MascotProps {
  showMascot?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({ showMascot = true }) => {
  if (!showMascot) return null;

  return (
    <View style={styles.mascotContainer}>
      <Image
        source={require('@/shared/assets/mascots/Unitree - Mascot-1.png')}
        style={styles.mascotImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mascotContainer: {
    position: 'absolute',
    right: spacing.lg,
    top: 105,
    zIndex: 9999,
  },
  mascotImage: {
    width: 160,
    height: 160,
  },
});
