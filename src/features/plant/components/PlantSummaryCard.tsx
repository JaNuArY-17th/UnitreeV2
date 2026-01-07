import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/shared/themes';

interface PlantSummaryCardProps {
  totalPlanted: number;
  totalPoints: number;
  activePlants: number;
}

export const PlantSummaryCard: React.FC<PlantSummaryCardProps> = ({
  totalPlanted,
  totalPoints,
  activePlants,
}) => {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalPlanted}</Text>
          <Text style={styles.statLabel}>Trees Planted</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Points Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activePlants}</Text>
          <Text style={styles.statLabel}>Active Trees</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
});