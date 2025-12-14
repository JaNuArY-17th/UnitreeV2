import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily } from '@/shared/themes';

interface QRHighlightFrameProps {
  showHighlightFrame: boolean;
  frameX: number;
  frameY: number;
  frameWidth: number;
  frameHeight: number;
  frameOpacity: number;
  scanFrameScale?: number;
}

const QRHighlightFrame: React.FC<QRHighlightFrameProps> = ({
  showHighlightFrame,
  frameX,
  frameY,
  frameWidth,
  frameHeight,
  frameOpacity,
  scanFrameScale = 1,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showHighlightFrame) {
      // Start pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );

      // Animate check mark
      const checkAnimation = Animated.timing(checkAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      });

      pulseAnimation.start();
      checkAnimation.start();

      return () => {
        pulseAnimation.stop();
        checkAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
      checkAnim.setValue(0);
    }
  }, [showHighlightFrame]);

  if (!showHighlightFrame) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.highlightFrame,
        {
          left: frameX,
          top: frameY,
          width: frameWidth || 200,
          height: frameHeight || 200,
          opacity: frameOpacity || 0.8,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {/* Corners for emphasis */}
      <View style={[styles.corner, styles.topLeftCorner]} />
      <View style={[styles.corner, styles.topRightCorner]} />
      <View style={[styles.corner, styles.bottomLeftCorner]} />
      <View style={[styles.corner, styles.bottomRightCorner]} />

      {/* Check mark in the center */}
      <Animated.View
        style={[
          styles.checkContainer,
          {
            transform: [{ scale: checkAnim }],
          },
        ]}
      >
        <View style={styles.checkCircle}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  highlightFrame: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
  },
  checkContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  checkText: {
    color: colors.light,
    fontSize: 18,

  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: colors.light,
    borderWidth: 2,
  },
  topLeftCorner: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRightCorner: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeftCorner: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRightCorner: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },
});

export default QRHighlightFrame;
