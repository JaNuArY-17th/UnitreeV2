import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { Text } from '@/shared/components';
import { CircularProgressBar } from '@/shared/components/CircularProgressBar';
import { colors, spacing, typography } from '@/shared/themes';
import { ChartMini, Flash, Wifi } from '@shared/assets/icons';
import { getLoadingAnimation } from '@/shared/assets/animations';
import { useSessionTimer } from '../hooks/useSessionTimer';

interface SessionTimerProps {
  pointsGained: number;
  isActive?: boolean;
  targetSeconds?: number; // Session target time in seconds (default: 3600 = 1 hour)
  initialSeconds?: number; // Starting seconds (default: 0)
  scrollOffsetAnim?: any; // Scroll animation value for fade in/out
  onConfettiTrigger?: (show: boolean) => void; // Callback to trigger confetti
  onTimerElapsedChange?: (seconds: number) => void; // Callback when elapsed seconds change
}

const TIMER_SIZE = 140;
const CIRCLE_RADIUS = 60;
const TIMER_HEIGHT = 150; // Should match HomeScreen TIMER_HEIGHT

export const SessionTimer: React.FC<SessionTimerProps> = ({
  pointsGained,
  isActive = true,
  targetSeconds = 3600, // 1 hour default
  initialSeconds = 0,
  scrollOffsetAnim,
  onConfettiTrigger,
  onTimerElapsedChange,
}) => {
  const {
    elapsedSeconds,
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
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (isActive && !isRunning) {
      start();
    } else if (!isActive && isRunning) {
      stop();
    }
  }, [isActive, isRunning, start, stop]);

  // Notify parent when elapsed seconds change
  useEffect(() => {
    if (onTimerElapsedChange) {
      onTimerElapsedChange(elapsedSeconds);
    }
  }, [elapsedSeconds, onTimerElapsedChange]);

  // Format elapsed seconds to HH:MM:SS
  const getFormattedTimeWithSeconds = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const timeWithSeconds = getFormattedTimeWithSeconds(elapsedSeconds);

  // Animation for fade in timer content
  const timerContentAnimStyle = useAnimatedStyle(() => {
    if (!scrollOffsetAnim) return {};
    return {
      opacity: interpolate(
        scrollOffsetAnim.value,
        [0, TIMER_HEIGHT],
        [0, 1],
        'clamp'
      ),
    };
  });

  // Animation for fade out ChartMini
  const chartMiniAnimStyle = useAnimatedStyle(() => {
    if (!scrollOffsetAnim) return {};
    return {
      opacity: interpolate(
        scrollOffsetAnim.value,
        [0, TIMER_HEIGHT],
        [1, 0],
        'clamp'
      ),
    };
  });

  return (
    <View style={styles.container}>
      {/* Glow Effect */}
      <View style={styles.glowBackground} />

      {/* Timer Wrapper Border/Background */}
      <View style={styles.timerWrapperOuter} />

      {/* Timer Circle with Progress - Static Content */}
      <View style={styles.timerWrapperInner}>
        <CircularProgressBar
          value={progress}
          radius={CIRCLE_RADIUS}
          isDualSegment={true}
          loadedStrokeWidth={10}
          remainingStrokeWidth={8}
          segmentSpacing={4}
          activeStrokeColor={colors.thirdary}
          inActiveStrokeColor={colors.light}
        />

        {/* Timer Content - Fade In */}
        <Animated.View style={[styles.timerContent, timerContentAnimStyle]}>
          <Text style={styles.sessionTime}>{timeWithSeconds}</Text>
        </Animated.View>

        {/* ChartMini - Fade In */}
        <Animated.View style={[styles.chartMiniContainer, chartMiniAnimStyle]}>
          <ChartMini width={90} height={50} color={colors.light} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    position: 'relative',
  },
  glowBackground: {
  },
  timerWrapperOuter: {
    position: 'absolute',
    width: CIRCLE_RADIUS * 2.1,
    height: CIRCLE_RADIUS * 2.1,
    borderRadius: CIRCLE_RADIUS * 1.1,
    backgroundColor: colors.primary,
  },
  timerWrapperInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100
  },
  chartMiniContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionLabel: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sessionTime: {
    ...typography.h1,
    fontWeight: '700',
    color: colors.light,
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
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.dark,
  },
  wifiIconContainer: {
    position: 'absolute',
    right: -5,
    top: 15,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
