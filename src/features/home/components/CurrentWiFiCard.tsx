import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/shared/components';
import { colors, dimensions, spacing, typography } from '@/shared/themes';
import { SessionTimer } from './SessionTimer';
import { useWifiInfo, getSignalStrengthLabel, getSignalColor } from '@/features/wifi';

interface CurrentWiFiCardProps {
  onPress?: () => void;
  pointsGained?: number;
  isSessionActive?: boolean;
  elapsedSeconds?: number; // Sync timer with parent
  scrollOffsetAnim?: any; // Scroll animation for fade animations
  onTimerElapsedChange?: (seconds: number) => void; // Notify parent of time changes
}

export const CurrentWiFiCard: React.FC<CurrentWiFiCardProps> = ({
  onPress,
  pointsGained = 0,
  isSessionActive = true,
  elapsedSeconds,
  scrollOffsetAnim,
  onTimerElapsedChange,
}) => {
  const { ssid, bssid, signalLevel, isLoading } = useWifiInfo();

  const signalStrength = getSignalStrengthLabel(signalLevel);
  const signalColor = getSignalColor(signalStrength);
  const wifiName = ssid || 'Loading...';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image
          source={require('@shared/assets/gif/green-planet.gif')}
          style={styles.gif}
        />
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.wifiName}>{wifiName}</Text>
        <View style={styles.signalContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color={signalColor} />
          ) : (
            <>
              <View
                style={[
                  styles.signalDot,
                  { backgroundColor: signalColor },
                ]}
              />
              <Text
                style={[
                  styles.signalText,
                  { color: signalColor },
                ]}
              >
                {signalStrength}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.timerSection}>
        <SessionTimer
          pointsGained={pointsGained}
          isActive={isSessionActive}
          targetSeconds={3600}
          initialSeconds={elapsedSeconds || 0}
          scrollOffsetAnim={scrollOffsetAnim}
          onTimerElapsedChange={onTimerElapsedChange}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: dimensions.radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: dimensions.radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  gif: {
    width: 64,
    height: 64,
    borderRadius: dimensions.radius.round,
  },
  contentSection: {
    flex: 1,
    // gap: spacing.sm,
  },
  wifiName: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.dark,
  },
  bssidText: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.xs,
    fontSize: 11,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  signalText: {
    ...typography.subtitle,
    fontWeight: '500',
  },
  timerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    transform: [{ scale: 0.5 }],
  },
  mascotImage: {
    width: 60,
    height: 60,
  },
});
