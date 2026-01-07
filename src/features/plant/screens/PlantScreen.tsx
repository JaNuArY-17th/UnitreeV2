import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, FlatList } from 'react-native';
import { colors } from '@/shared/themes';
import { PlantHeader, PlantSummaryCard, PlantCard } from '../components';

interface Plant {
  id: string;
  name: string;
  species: string;
  stage: string;
  pointsCost: number;
  imageUri?: string;
  isPlanted: boolean;
}

export function PlantScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load plants data
    loadPlants();
  }, []);

  const loadPlants = async () => {
    setLoading(true);
    // Mock data for now
    const mockPlants: Plant[] = [
      {
        id: '1',
        name: 'Oak Tree',
        species: 'Quercus',
        stage: 'seedling',
        pointsCost: 100,
        isPlanted: false,
      },
      {
        id: '2',
        name: 'Maple Tree',
        species: 'Acer',
        stage: 'sapling',
        pointsCost: 150,
        isPlanted: true,
      },
      // Add more mock plants
    ];
    setPlants(mockPlants);
    setLoading(false);
  };

  const totalPlanted = plants.filter(p => p.isPlanted).length;
  const totalPoints = plants.reduce((sum, p) => sum + (p.isPlanted ? p.pointsCost : 0), 0);
  const activePlants = plants.filter(p => p.isPlanted).length;

  const renderPlantCard = ({ item }: { item: Plant }) => (
    <PlantCard plant={item} onPress={() => { /* Handle plant press */ }} />
  );

  return (
    <View style={styles.container}>
      <PlantHeader />

      <View style={styles.contentSection}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PlantSummaryCard
            totalPlanted={totalPlanted}
            totalPoints={totalPoints}
            activePlants={activePlants}
          />

          {loading ? (
            <Text style={styles.loadingText}>Loading plants...</Text>
          ) : plants.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No plants available
              </Text>
            </View>
          ) : (
            <FlatList
              data={plants}
              renderItem={renderPlantCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.plantList}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  contentSection: {
    flex: 1,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 75,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 25,
    borderRadius: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  plantList: {
    paddingBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: '80%',
  },
});
