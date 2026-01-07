import React from 'react';
import { View, Text, Image, StyleSheet, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/shared/themes';

interface PlantHeaderProps {
  title?: string;
  subtitle?: string;
}

export const PlantHeader: React.FC<PlantHeaderProps> = ({
  title = 'Plant Trees',
  subtitle = 'Grow your virtual forest and earn rewards',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('@/shared/assets/background/forest.png')}
      resizeMode="cover"
      style={[styles.headerSection, { paddingTop: insets.top + 20 }]}
    >
      <View style={styles.overlay}>
        <View style={styles.welcomeSection}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </View>
        <View style={styles.treeContainer}>
          <Image
            source={require('@shared/assets/trees/stage06.png')} // Assuming tree image exists
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
    minHeight: 250,
    width: '100%',
    opacity: 0.8,
    paddingBottom: 90,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Dark overlay for text readability
  },
  welcomeSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 28,
    textAlign: 'center',
  },
  treeContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  treeImage: {
    width: 150,
    height: 150,
  },
});