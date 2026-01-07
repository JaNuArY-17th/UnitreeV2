import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Text } from '@/shared/components';
import { colors, dimensions, spacing, typography } from '@/shared/themes';
import { LOADING_ANIMATIONS } from '@/shared/assets/animations';
import { Water, Flash } from '@/shared/assets/icons';

interface AnimatedWaterCircleProps {
  timeDisplay: string;
  isActive?: boolean;
  elapsedSeconds?: number; // Sync with timer state
  pointsGained?: number; // Points to display
}

export const AnimatedWaterCircle: React.FC<AnimatedWaterCircleProps> = ({
  timeDisplay,
  isActive = true,
  elapsedSeconds,
  pointsGained = 0,
}) => {
  // Format elapsed seconds to HH:MM:SS if provided
  const getFormattedTime = (seconds?: number): string => {
    if (!seconds) return timeDisplay;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Format seconds part (SS)
  const getFormattedSeconds = (seconds?: number): string => {
    if (!seconds) return '00s';
    const secs = seconds % 60;
    return `${String(secs).padStart(2, '0')}s`;
  };

  const displayTime = elapsedSeconds !== undefined ? getFormattedTime(elapsedSeconds) : timeDisplay;
  const displaySeconds = elapsedSeconds !== undefined ? getFormattedSeconds(elapsedSeconds) : '00s';
  return (
    <View style={styles.container}>
      {/* Circle Background */}
      <View style={styles.circleBackground}>
        {/* Liquid Circle Animation - Border effect */}
        <LottieView
          source={LOADING_ANIMATIONS.liquidCircle.source}
          autoPlay
          loop
          style={styles.liquidCircle}
        />
        {/* Water Animation - Fills from bottom */}
          <LottieView
            source={LOADING_ANIMATIONS.Water.source}
            autoPlay
            loop
            style={styles.water}
          />


        {/* Time Display */}
        <View style={styles.timeContainer}>
          <View>
          {/* <Text style={styles.sessionLabel}>Current Session</Text> */}
          <Text style={styles.sessionTime}>{displayTime}</Text>
          </View>

          {/* Points Badge */}
          {isActive && (
            <View style={styles.pointsBadge}>
              <Flash width={16} height={16} color={colors.dark} />
              <Text style={styles.pointsText}>+{pointsGained} pts</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dropContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 5,
  },
  circleBackground: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  waterContainer: {
    position: 'absolute',
    bottom: 0,
    // width: 280,
    // height: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  water: {
    width: 280,
    height: 280,
    // opacity: 0.7,
  },
  liquidCircle: {
    position: 'absolute',
    width: 279,
    height: 279,
  },
  timeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    gap: spacing.xl * 2,
    top: 85
  },
  sessionLabel: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sessionTime: {
    ...typography.h0,
    // fontWeight: '700',
    color: colors.dark,
    marginTop: spacing.xs,
  },
  sessionSeconds: {
    ...typography.h3,
    fontWeight: '500',
    color: colors.gray,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs / 2,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.radius.round,
    backgroundColor: colors.background,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.dark,
  },
});
