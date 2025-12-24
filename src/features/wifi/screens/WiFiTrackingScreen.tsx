import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, colors, dimensions } from '@/shared/themes';

const { width, height } = Dimensions.get('window');

interface WaterDropProps {
  delay: number;
  animationValue: Animated.Value;
}

const WaterDrop: React.FC<WaterDropProps> = ({ delay, animationValue }) => {
  const dropY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const dropOpacity = animationValue.interpolate({
    inputRange: [0, 0.9, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.waterDrop,
        {
          transform: [{ translateY: dropY }],
          opacity: dropOpacity,
        },
      ]}
    />
  );
};

const WiFiTrackingScreen = () => {
  const insets = useSafeAreaInsets();
  const animationValue = useRef(new Animated.Value(0)).current;
  const [wifiTime] = React.useState('2h 15m 32s');
  const [connectedNetwork] = React.useState('Starbucks_5G');
  const [signalStrength] = React.useState(92);
  const [speed] = React.useState('45.3 Mbps');
  const [pointsEarned] = React.useState(267);

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animationValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(animationValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animate();
  }, [animationValue]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.headerTitle}>WiFi Tracking</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        {/* Main Tracking Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>Current Session</Text>

          {/* Animated Water Circle */}
          <View style={styles.animationWrapper}>
            <View style={styles.circleContainer}>
              <View style={styles.outerCircle}>
                {/* Water drops animation */}
                <WaterDrop delay={0} animationValue={animationValue} />
                <WaterDrop delay={0.33} animationValue={animationValue} />
                <WaterDrop delay={0.66} animationValue={animationValue} />
              </View>
              <View style={styles.innerDisplay}>
                <Text style={styles.timeDisplay}>{wifiTime}</Text>
                <Text style={styles.timeLabel}>Time Connected</Text>
              </View>
            </View>
          </View>

          {/* Connected Network Info */}
          <View style={styles.networkInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Connected Network</Text>
              <Text style={styles.infoValue}>{connectedNetwork}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Signal Strength</Text>
              <View style={styles.signalBar}>
                <View
                  style={[
                    styles.signalFill,
                    { width: `${signalStrength}%` },
                  ]}
                />
              </View>
              <Text style={styles.infoValue}>{signalStrength}%</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Speed</Text>
              <Text style={styles.infoValue}>{speed}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Points Earned</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                +{pointsEarned}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.endSessionBtn}>
              <Text style={styles.endSessionText}>End Session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsBtn}>
              <Text style={styles.detailsText}>View Statistics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statLabel}>Total Time</Text>
              <Text style={styles.statValue}>8h 45m</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🌐</Text>
              <Text style={styles.statLabel}>Sessions</Text>
              <Text style={styles.statValue}>5</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💎</Text>
              <Text style={styles.statLabel}>Points Today</Text>
              <Text style={styles.statValue}>892</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📍</Text>
              <Text style={styles.statLabel}>Locations</Text>
              <Text style={styles.statValue}>3</Text>
            </View>
          </View>
        </View>

        {/* Recent Locations */}
        <View style={styles.locationsContainer}>
          <Text style={styles.sectionTitle}>Recent Locations</Text>
          {[
            { name: 'Starbucks Downtown', time: '2h 15m', points: 267 },
            { name: 'Central Library', time: '1h 30m', points: 189 },
            { name: 'Airport WiFi', time: '45m', points: 89 },
          ].map((location, index) => (
            <TouchableOpacity key={index} style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Text style={styles.locationEmoji}>📍</Text>
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationTime}>{location.time}</Text>
              </View>
              <View style={styles.locationPoints}>
                <Text style={styles.pointsLabel}>+{location.points}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  mainCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  animationWrapper: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  circleContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: colors.text.primary,
    overflow: 'hidden',
  },
  innerDisplay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  timeDisplay: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text.primary,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.text.primary,
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  waterDrop: {
    position: 'absolute',
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text.primary,
    opacity: 0.6,
  },
  networkInfo: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    opacity: 0.8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  signalBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  signalFill: {
    height: '100%',
    backgroundColor: colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  endSessionBtn: {
    flex: 1,
    backgroundColor: colors.text.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  endSessionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.text.primary,
  },
  detailsText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickStatsContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statItem: {
    width: (width - spacing.md * 2 - spacing.sm) / 2,
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  locationsContainer: {
    marginBottom: spacing.lg,
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
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  locationEmoji: {
    fontSize: 24,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  locationTime: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  locationPoints: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
});

export default WiFiTrackingScreen;
