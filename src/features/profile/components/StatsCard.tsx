import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from '@/shared/components';
import { colors, spacing, dimensions, typography } from '@/shared/themes';

interface StatsCardProps {
  points: number;
  trees: number;
  co2: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  points,
  trees,
  co2,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Your Impact</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Icon name="star" size={24} color={colors.success} />
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="tree" size={24} color={colors.success} />
          <Text style={styles.statValue}>{trees}</Text>
          <Text style={styles.statLabel}>Trees</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="cloud-outline" size={24} color={colors.success} />
          <Text style={styles.statValue}>{co2}</Text>
          <Text style={styles.statLabel}>kg CO₂/year</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    ...typography.h1,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h0,
    fontWeight: 'bold',
    color: colors.success,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.text.light,
    marginHorizontal: spacing.lg,
  },
});
