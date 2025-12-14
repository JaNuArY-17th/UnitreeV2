import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/shared/components/base';
import { Plus, Close } from '@/shared/assets/icons';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import HapticFeedback from 'react-native-haptic-feedback';

interface QuantityControlProps {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
  value,
  onDecrease,
  onIncrease,
  min = 1,
}) => {
  const handleDecrease = () => {
    if (value > min) {
      HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
      onDecrease();
    }
  };

  const handleIncrease = () => {
    HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
    onIncrease();
  };

  const isMinReached = value <= min;

  return (
    <View style={styles.container}>
      {/* Decrease Button */}
      <Pressable
        onPress={handleDecrease}
        disabled={isMinReached}
        style={({ pressed }) => [
          styles.button,
          styles.decreaseButton,
          isMinReached && styles.buttonDisabled,
          pressed && !isMinReached && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        hitSlop={8}
      >
        <View style={styles.iconContainer}>
          <View style={styles.minusIcon} />
        </View>
      </Pressable>

      {/* Value Display */}
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{value}</Text>
      </View>

      {/* Increase Button */}
      <Pressable
        onPress={handleIncrease}
        style={({ pressed }) => [
          styles.button,
          styles.increaseButton,
          pressed && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        hitSlop={8}
      >
        <Plus width={10} height={10} color={colors.light} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // Soft neumorphic shadow
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  decreaseButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  increaseButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.4,
    backgroundColor: colors.lightGray,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minusIcon: {
    width: 8,
    height: 2,
    backgroundColor: colors.text.secondary,
    borderRadius: 1,
  },
  valueContainer: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.primary,
  },
});

export default QuantityControl;
