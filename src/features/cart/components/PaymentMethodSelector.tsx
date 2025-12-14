import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/shared/components/base';
import { Wallet, CreditCard } from '@/shared/assets/icons';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import type { PaymentMethod } from '../types';
import HapticFeedback from 'react-native-haptic-feedback';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  methods,
  selectedId,
  onSelect,
}) => {
  const handleSelect = (id: string) => {
    if (id !== selectedId) {
      HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
      onSelect(id);
    }
  };

  const getIcon = (methodId: string, isSelected: boolean) => {
    const iconColor = isSelected ? colors.light : colors.text.secondary;
    const iconSize = 20;

    if (methodId === 'cash') {
      return <Wallet width={iconSize} height={iconSize} color={iconColor} />;
    }
    return <CreditCard width={iconSize} height={iconSize} color={iconColor} />;
  };

  return (
    <View style={styles.container}>
      {methods.map((method) => {
        const isSelected = method.id === selectedId;
        return (
          <Pressable
            key={method.id}
            onPress={() => handleSelect(method.id)}
            style={({ pressed }) => [
              styles.methodButton,
              isSelected && styles.methodButtonSelected,
              pressed && styles.methodButtonPressed,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={method.label}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              {getIcon(method.id, isSelected)}
            </View>

            {/* Label */}
            <Text
              style={[
                styles.methodLabel,
                isSelected && styles.methodLabelSelected,
              ]}
              numberOfLines={1}
            >
              {method.label}
            </Text>

            {/* Selection Indicator */}
            {isSelected && (
              <View style={styles.selectionIndicator}>
                <View style={styles.selectionDot} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    // Soft shadow
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  methodButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    // Slightly stronger shadow when selected
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  methodButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
    color: colors.text.secondary,
  },
  methodLabelSelected: {
    color: colors.light,
  },
  selectionIndicator: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light,
  },
});

export default PaymentMethodSelector;

