import React from 'react';
import { View, Text, Image, StyleSheet, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/shared/themes';

interface PlantHeaderProps {
  title?: string;
  subtitle?: string;
  overlayOpacity?: number;
}

export const PlantHeader: React.FC<PlantHeaderProps> = ({
  title = 'Plant Trees',
  subtitle = 'Grow your virtual forest and earn rewards',
  overlayOpacity = 0.3,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('@/shared/assets/background/forest.png')}
      resizeMode="cover"
      style={[styles.headerSection]}
    >
      <View style={[styles.overlay]}>
        <View style={styles.treeContainer}>
          <Image
            source={require('@shared/assets/trees/stage06.png')}
            style={styles.treeImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    minHeight: '40%',
    width: '100%',
  },
  overlay: {
    flex: 1,
  },
  treeContainer: {
    // position: 'absolute',
    bottom: -150,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  treeImage: {
    width: 200,
    height: 200,
  },
});