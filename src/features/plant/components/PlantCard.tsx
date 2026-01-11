import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors } from '@/shared/themes';

interface Plant {
  id: string;
  name: string;
  species: string;
  stage: string;
  pointsCost: number;
  imageUri?: string;
  isPlanted: boolean;
}

interface PlantCardProps {
  plant: Plant;
  onPress: () => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ plant, onPress }) => {
  const { name, species, stage, pointsCost, imageUri, isPlanted } = plant;

  const dynamicStyles = {
    plantStatus: {
      color: isPlanted ? colors.success || '#4CAF50' : colors.warning || '#FF9800',
    },
    plantCard: {
      ...styles.plantCard,
      borderColor: isPlanted ? colors.success || '#4CAF50' : 'transparent',
      borderWidth: isPlanted ? 2 : 0,
    },
  };

  return (
    <TouchableOpacity style={dynamicStyles.plantCard} onPress={onPress}>
      <View style={styles.plantHeader}>
        <View style={styles.plantImageContainer}>
          <Image
            source={imageUri ? { uri: imageUri } : require('@shared/assets/trees/stage06.png')} // Assuming default image
            style={styles.plantImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{name}</Text>
          <Text style={styles.plantSpecies}>{species}</Text>
          <Text style={styles.plantStage}>{stage}</Text>
        </View>
      </View>
      <View style={styles.plantFooter}>
        <Text style={styles.pointsCost}>{pointsCost} Points</Text>
        <Text style={[styles.plantStatus, dynamicStyles.plantStatus]}>{isPlanted ? 'Planted' : 'Available'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  plantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  plantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  plantImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  plantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  plantSpecies: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  plantStage: {
    fontSize: 14,
    color: '#666',
  },
  plantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  plantStatus: {
    fontSize: 14,
    color: colors.primary
  },
});