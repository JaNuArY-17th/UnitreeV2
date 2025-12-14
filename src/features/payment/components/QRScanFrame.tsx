import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';

interface QRScanFrameProps {
  scanText: string;
  scanLinePosition?: number;
  scanFrameScale?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const SCAN_FRAME_SIZE = screenWidth * 0.75;

const QRScanFrame: React.FC<QRScanFrameProps> = ({
  scanText,
  scanLinePosition = 0,
  scanFrameScale = 1,
}) => {
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const frameScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start the scan line animation
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const frameAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(frameScaleAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(frameScaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    scanAnimation.start();
    frameAnimation.start();

    return () => {
      scanAnimation.stop();
      frameAnimation.stop();
    };
  }, []);

  return (
    <View style={styles.scanFrameOverlay}>
      <View style={styles.scanFrameContainer}>
        <Animated.View
          style={[
            styles.scanFrame,
            {
              transform: [{ scale: frameScaleAnim }]
            }
          ]}
        >
          <View style={[styles.corner, styles.topLeftCorner]} />
          <View style={[styles.corner, styles.topRightCorner]} />
          <View style={[styles.corner, styles.bottomLeftCorner]} />
          <View style={[styles.corner, styles.bottomRightCorner]} />

          {/* Animated scanning line */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, SCAN_FRAME_SIZE * 0.8 - 3],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>
        <Text style={styles.scanText}>{scanText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scanFrameOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    paddingTop: Dimensions.get('window').height * 0.3,
  },
  scanFrameContainer: {
    alignItems: 'center',
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE * 0.8,
    height: SCAN_FRAME_SIZE * 0.8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: 3,
    backgroundColor: colors.light,
    shadowColor: colors.light,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  scanText: {
    color: colors.light,
    fontSize: 18,

    marginTop: 40,
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.light,
    borderWidth: 3,
  },
  topLeftCorner: {
    top: -3,
    left: -3,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRightCorner: {
    top: -3,
    right: -3,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeftCorner: {
    bottom: -3,
    left: -3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRightCorner: {
    bottom: -3,
    right: -3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
});

export default QRScanFrame;
