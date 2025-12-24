import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Text } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/themes';
import { LOADING_ANIMATIONS } from '@/shared/assets/animations';
import { Water } from '@/shared/assets/icons';

interface AnimatedWaterCircleProps {
  timeDisplay: string;
  isActive?: boolean;
}

export const AnimatedWaterCircle: React.FC<AnimatedWaterCircleProps> = ({
  timeDisplay,
  isActive = true,
}) => {
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
          <Text style={styles.timeDisplay}>{timeDisplay}</Text>
          
          {/* Status Badge */}
          {isActive && (
            <View style={styles.statusBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.statusText}>TRACKING ACTIVE</Text>
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
  },
  timeDisplay: {
    ...typography.h0,
    letterSpacing: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
