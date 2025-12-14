import React from 'react';
import { View, StyleSheet, Pressable, Animated, Vibration, Platform } from 'react-native';
import { colors, dimensions, FONT_WEIGHTS, spacing } from '@shared/themes';
import { Heading } from '@shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { getFontFamily } from '@shared/themes/fonts';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

type Props = {
  onNumberPress: (digit: string) => void;
  onBackspace: () => void;
  hapticsEnabled?: boolean; // enable iOS/Android haptics
};

const NumberPad: React.FC<Props> = ({ onNumberPress, onBackspace, hapticsEnabled = true }) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {KEYS.slice(0, 9).map((k) => (
          <Key key={k} label={k} onPress={() => onNumberPress(k)} hapticsEnabled={hapticsEnabled} />
        ))}
        <View style={styles.key} />
        <Key label={'0'} onPress={() => onNumberPress('0')} hapticsEnabled={hapticsEnabled} />
        <Key label={'delete'} onPress={onBackspace} hapticsEnabled={hapticsEnabled} isIcon />
      </View>
    </View>
  );
};

const Key: React.FC<{ label: string; onPress: () => void; hapticsEnabled?: boolean; isIcon?: boolean }> = ({ label, onPress, hapticsEnabled = true, isIcon = false }) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handlePress = React.useCallback(() => {
    if (hapticsEnabled) {
      if (Platform.OS === 'ios') {
        ReactNativeHapticFeedback.trigger('selection', {
          enableVibrateFallback: false,
          ignoreAndroidSystemSettings: true,
        });
      } else if (Platform.OS === 'android') {
        // very subtle
        Vibration.vibrate(10);
      }
    }
    onPress();
  }, [hapticsEnabled, onPress]);

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      android_ripple={{ color: colors.primaryLight, borderless: false }}
      style={styles.key}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {isIcon ? (
          <HugeiconsIcon icon={Delete02Icon} size={28} color={colors.primary} />
        ) : (
          <Heading level={1} style={styles.keyText}>
            {label}
          </Heading>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  grid: {
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  key: {
    width: '33.33%',
    paddingVertical: dimensions.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  keyPressed: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    opacity: 0.8,
  },
  keyText: {
    color: colors.primary,

    fontSize: dimensions.fontSize.xxxl * 1.1
  },
});

export default NumberPad;
