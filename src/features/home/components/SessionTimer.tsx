import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Text } from '@/shared/components';
import { CircularProgressBar } from '@/shared/components/CircularProgressBar';
import { colors, spacing, typography } from '@/shared/themes';
import { Flash, Wifi } from '@shared/assets/icons';
import { getLoadingAnimation } from '@/shared/assets/animations';
import { useSessionTimer } from '../hooks/useSessionTimer';

interface SessionTimerProps {
  pointsGained: number;
  isActive?: boolean;
  targetSeconds?: number; // Session target time in seconds (default: 3600 = 1 hour)
  initialSeconds?: number; // Starting seconds (default: 0)
  opacityAnim?: any; // Track when timer is hidden
  onConfettiTrigger?: (show: boolean) => void; // Callback to trigger confetti
}

const TIMER_SIZE = 280;
const CIRCLE_RADIUS = 120;

export const SessionTimer: React.FC<SessionTimerProps> = ({
  pointsGained,
  isActive = true,
  targetSeconds = 3600, // 1 hour default
  initialSeconds = 0,
  opacityAnim,
  onConfettiTrigger,
}) => {
  const {
    formattedTime,
    formattedSeconds,
    progress,
    isRunning,
    start,
    stop,
  } = useSessionTimer({
    initialSeconds,
    targetSeconds,
    autoStart: isActive,
  });
  const heartbeatAnim = useSharedValue(1);
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (isActive && !isRunning) {
      start();
    } else if (!isActive && isRunning) {
      stop();
    }
  }, [isActive, isRunning, start, stop]);

  // Heartbeat animation
  useEffect(() => {
    heartbeatAnim.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
        withDelay(2000, withTiming(1, { duration: 0 }))
      ),
      -1
    );
  }, [heartbeatAnim]);

  const heartbeatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartbeatAnim.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Glow Effect */}
      <View style={styles.glowBackground} />

      {/* Timer Wrapper Border/Background with Heartbeat */}
      <Animated.View style={[styles.timerWrapperOuter, heartbeatStyle]} />

      {/* Timer Circle with Progress - Static Content */}
      <View style={styles.timerWrapperInner}>
        <CircularProgressBar
          value={progress}
          radius={CIRCLE_RADIUS}
          isDualSegment={true}
          loadedStrokeWidth={20}
          remainingStrokeWidth={15}
          segmentSpacing={8}
          activeStrokeColor={colors.primary}
          inActiveStrokeColor={colors.thirdary}
        />

        {/* Center Content */}
        <View style={styles.timerContent}>
          <Text style={styles.sessionLabel}>Current Session</Text>
          <Text style={styles.sessionTime}>{formattedTime}</Text>
          <Text style={styles.sessionSeconds}>{formattedSeconds}</Text>

          {/* Points Badge */}
          <View style={styles.pointsBadge}>
            <Flash width={16} height={16} color={colors.dark} />
            <Text style={styles.pointsText}>+{pointsGained} pts</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  glowBackground: {
  },
  timerWrapperOuter: {
    position: 'absolute',
    width: CIRCLE_RADIUS * 2.1,
    height: CIRCLE_RADIUS * 2.1,
    borderRadius: CIRCLE_RADIUS * 1.1,
    backgroundColor: colors.light,
  },
  timerWrapperInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: CIRCLE_RADIUS * 2.2,
    height: CIRCLE_RADIUS * 2.2,
    zIndex: 1,
    backgroundColor: colors.secondarySoft,
  },
  timerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
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
    fontWeight: '700',
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
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.dark,
  },
  wifiIconContainer: {
    position: 'absolute',
    right: -10,
    top: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
