import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/shared/themes';

interface PlantTabsProps {
  selectedType: 'virtual' | 'real';
  onTypeChange: (type: 'virtual' | 'real') => void;
}

export const PlantTabs: React.FC<PlantTabsProps> = ({ selectedType, onTypeChange }) => {
  return (
    <View style={styles.tabsContainer}>
      <View style={styles.pillTabsContainer}>
        <View style={styles.pillTabs}>
          <TouchableOpacity
            style={[styles.pillTab, selectedType === 'virtual' && styles.pillTabActive]}
            onPress={() => onTypeChange('virtual')}
          >
            <Text style={[styles.pillTabText, selectedType === 'virtual' && styles.pillTabTextActive]}>
              Virtual Plants
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pillTab, selectedType === 'real' && styles.pillTabActive]}
            onPress={() => onTypeChange('real')}
          >
            <Text style={[styles.pillTabText, selectedType === 'real' && styles.pillTabTextActive]}>
              Real Plants
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.secondary, // Header background
  },
  pillTabsContainer: {
    marginBottom: 20,
  },
  pillTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    padding: 4,
  },
  pillTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTabActive: {
    backgroundColor: colors.primary, // Green like #98D56D
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pillTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  pillTabTextActive: {
    color: '#fff',
  },
});