import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, Text, View, StyleSheet } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { FONT_WEIGHTS, getFontFamily, theme } from '@/shared/themes';
import { bottomTabStyles, hapticOptions } from '../styles/bottomTabStyles';
import { QR, QRScanEmpty } from '@/shared/assets/icons';
import { EnsogoFlowerLogo } from '@/shared/assets/images/EnsogoFlower';
import { getUserTypeColor } from '@/shared/themes/colors';

interface QRScanButtonProps {
  onPress?: () => void;
}

export const QRScanButton: React.FC<QRScanButtonProps> = ({ onPress }) => {
  const [scale] = useState(new Animated.Value(1));
  const [breathe] = useState(new Animated.Value(1));
  const [iconScale] = useState(new Animated.Value(1));
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cornerScale = useRef(new Animated.Value(1)).current; // Always visible

  // Icon sequence: QR -> QRScanEmpty -> EnsogoFlower -> ESPay text
  const icons = [
    { type: 'QR', component: QR },
    { type: 'QRScanEmpty', component: QRScanEmpty },
    { type: 'EnsogoFlower', component: EnsogoFlowerLogo },
    { type: 'Text', component: null }
  ];

  // Icon transition animation
  useEffect(() => {
    const animateIconTransition = () => {
      // Animate corners closing in to center
      Animated.sequence([
        Animated.timing(cornerScale, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(cornerScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Zoom out current icon
        Animated.timing(iconScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Change to next icon
          setCurrentIconIndex((prevIndex) => (prevIndex + 1) % icons.length);

          // Zoom in new icon
          Animated.timing(iconScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      });
    };

    // Start the cycle
    const iconInterval = setInterval(() => {
      animateIconTransition();
    }, 2600); // 150ms + 150ms + 300ms out + 300ms in + 2000ms display = 2900ms total

    return () => {
      clearInterval(iconInterval);
    };
  }, [iconScale, cornerScale, icons.length]);

  // Add breathing effect animation
  useEffect(() => {
    const breatheAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    breatheAnimation.start();

    return () => {
      breatheAnimation.stop();
    };
  }, [breathe]);

  // Vertical scan line animation - synced with icon transitions
  useEffect(() => {
    const scanCycle = () => {
      Animated.sequence([
        // Wait for corner + icon transition (600ms total)
        Animated.delay(600),
        // Scan animation for 1s after icon changes
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        // Wait for remaining time (1s) before next cycle
        Animated.delay(1000),
      ]).start(() => {
        // Restart the cycle
        scanCycle();
      });
    };

    scanCycle();

    return () => {
      scanLineAnim.stopAnimation();
    };
  }, [scanLineAnim]);

  const handlePressIn = () => {
    onPress?.();
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    Animated.spring(scale, {
      toValue: 0.9,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Render current icon
  const renderCurrentIcon = () => {
    const currentIcon = icons[currentIconIndex];

    if (currentIcon.type === 'Text') {
      return (
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Text style={textStyle}>
            ESPay
          </Text>
        </Animated.View>
      );
    }

    const IconComponent = currentIcon.component;
    if (IconComponent) {
      return (
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <IconComponent width={26} height={26} color={theme.colors.light} />
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <Animated.View
      style={[
        bottomTabStyles.scanButton,
        {
          backgroundColor: getUserTypeColor(),
          transform: [
            { scale: Animated.multiply(scale, breathe) }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={bottomTabStyles.scanButtonTouch}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessibilityLabel="Quét mã QR"
        accessibilityRole="button"
      >
        {renderCurrentIcon()}

        {/* 4 Corner Indicators */}
        <Animated.View
          style={[
            styles.cornerTopLeft,
            {
              transform: [
                {
                  translateX: cornerScale.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [2, 0], // Move slightly towards center
                  }),
                },
                {
                  translateY: cornerScale.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [2, 0], // Move slightly towards center
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.cornerTopRight,
            {
              transform: [
                {
                  translateX: cornerScale.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [-2, 0], // Move slightly towards center
                  }),
                },
                {
                  translateY: cornerScale.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [2, 0], // Move slightly towards center
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.cornerBottomLeft,
            {
              transform: [
                {
                  translateX: cornerScale.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [2, 0], // Move slightly towards center
                  }),
                },
                {
                  translateY: cornerScale.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [-2, 0], // Move slightly towards center
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.cornerBottomRight,
            {
              transform: [
                {
                  translateX: cornerScale.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [-2, 0], // Move slightly towards center
                  }),
                },
                {
                  translateY: cornerScale.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [-2, 0], // Move slightly towards center
                  }),
                },
              ],
            },
          ]}
        />

        {/* Vertical Scan Frame */}
        <View style={styles.scanFrame}>
          {/* Vertical scan line */}
          <Animated.View
            style={[
              styles.verticalScanLine,
              {
                transform: [
                  {
                    translateY: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-35, 35], // Full circle diameter movement
                    }),
                  },
                  {
                    scaleX: scanLineAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 2, 0], // Scale varies to fit circle
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scanFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  verticalScanLine: {
    position: 'absolute',
    height: 1,
    width: 56, // Fixed width, will be scaled by scaleX
    backgroundColor: theme.colors.light,
    shadowColor: theme.colors.light,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 7,
    opacity: 0.2,
  },
  // Corner indicators - positioned inside button, around icon
  cornerTopLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: theme.colors.light,
    borderTopLeftRadius: 4,
    pointerEvents: 'none',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: theme.colors.light,
    borderTopRightRadius: 4,
    pointerEvents: 'none',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: theme.colors.light,
    borderBottomLeftRadius: 4,
    pointerEvents: 'none',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: theme.colors.light,
    borderBottomRightRadius: 4,
    pointerEvents: 'none',
  },
});

const textStyle = {
  fontSize: 12,

  color: theme.colors.light,
  textAlign: 'center' as const,
};
