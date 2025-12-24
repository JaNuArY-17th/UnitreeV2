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
import { ChartMini } from '../../../shared/assets';
import { useWifiInfo, getSignalStrengthLabel, getSignalColor } from '@/features/wifi';

interface CurrentWiFiCardProps {
  onPress?: () => void;
}

export const CurrentWiFiCard: React.FC<CurrentWiFiCardProps> = ({
  onPress,
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

      <View style={styles.speedSection}>
          <ChartMini width={80} height={50} color={colors.light} />
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
    marginVertical: spacing.md,
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
  speedSection: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginRight: spacing.sm
  },
  speedValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.dark,
  },
  speedUnit: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  mascotImage: {
    width: 60,
    height: 60,
  },
});
