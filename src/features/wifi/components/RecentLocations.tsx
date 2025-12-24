import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/themes';
import { Address, Clock } from '@/shared/assets/icons';
import { useTranslation } from 'react-i18next';

interface Location {
  name: string;
  time: string;
  points: number;
}

interface RecentLocationsProps {
  locations: Location[];
  onLocationPress?: (location: Location) => void;
}

export const RecentLocations: React.FC<RecentLocationsProps> = ({
  locations,
  onLocationPress,
}) => {
  const { t } = useTranslation('wifi');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('recentLocations.title')}</Text>
      {locations.map((location, index) => (
        <TouchableOpacity
          key={index}
          style={styles.locationCard}
          onPress={() => onLocationPress?.(location)}
          activeOpacity={0.7}
        >
          <View style={styles.locationIcon}>
            <Address width={24} height={24} color={colors.primary} />
          </View>
          <View style={styles.locationContent}>
            <Text style={styles.locationName}>{location.name}</Text>
            <View style={styles.locationMeta}>
              <Clock width={14} height={14} color={colors.text.secondary} />
              <Text style={styles.locationTime}>{location.time}</Text>
            </View>
          </View>
          <View style={styles.locationPoints}>
            <Text style={styles.pointsLabel}>+{location.points}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationTime: {
    ...typography.caption,
  },
  locationPoints: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  pointsLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
});
