import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/shared/components';
import { colors, dimensions, spacing, typography } from '@/shared/themes';
import { Gift, Clock, Globe } from '@shared/assets/icons';

export interface ActionButtonConfig {
  id: string;
  label: string;
  icon: 'gift' | 'clock' | 'globe';
  onPress: () => void;
}

interface ActionButtonsProps {
  buttons: ActionButtonConfig[];
  activeButtonId?: string;
}

const iconMap = {
  gift: Gift,
  clock: Clock,
  globe: Globe,
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  buttons,
  activeButtonId,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {buttons.map((button, index) => {
        const isActive = activeButtonId === button.id;
        const IconComponent = iconMap[button.icon];

        return (
          <TouchableOpacity
            key={button.id}
            style={[
              styles.button,
              isActive ? styles.buttonActive : styles.buttonInactive,
              index === 0 && styles.buttonFirst,
              index === buttons.length - 1 && styles.buttonLast,
            ]}
            onPress={button.onPress}
            activeOpacity={0.8}
          >
            <IconComponent
              width={18}
              height={18}
              color={colors.light}
            />
            <Text
              style={[
                styles.buttonText,
              ]}
            >
              {button.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  contentContainer: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: dimensions.radius.round,
    height: 40,
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.primaryDark,
  },
  buttonInactive: {
    backgroundColor: colors.primary,
    // borderWidth: 1,
    // borderColor: '#f0f0f0',
  },
  buttonFirst: {
    marginLeft: 0,
  },
  buttonLast: {
    marginRight: spacing.md,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.light
  }
});
