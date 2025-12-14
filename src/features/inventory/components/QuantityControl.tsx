/**
 * Quantity Control Component
 * Reusable quantity increment/decrement control
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, dimensions } from '@/shared/themes';
import Text from '@/shared/components/base/Text';

interface QuantityControlProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minValue?: number;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
  value,
  onIncrement,
  onDecrement,
  minValue = 1,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onDecrement}
        disabled={value <= minValue}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity style={styles.button} onPress={onIncrement} activeOpacity={0.7}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
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
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.sm,
  },
  buttonText: {
    ...typography.subtitle,
    fontSize: 20,
    color: colors.primary,
  },
  value: {
    ...typography.subtitle,
    color: colors.dark,
    marginHorizontal: spacing.md,
    minWidth: 30,
    textAlign: 'center',
  },
});

export default QuantityControl;
