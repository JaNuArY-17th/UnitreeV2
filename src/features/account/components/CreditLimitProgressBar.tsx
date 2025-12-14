import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/shared/themes';

interface CreditLimitProgressBarProps {
  spentCredit: number;
  creditLimit: number;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
}

export const CreditLimitProgressBar: React.FC<CreditLimitProgressBarProps> = ({
  spentCredit,
  creditLimit,
  height = 8,
  backgroundColor = colors.lightGray,
  progressColor = colors.warning,
  borderRadius = 4,
}) => {
  // Calculate progress percentage (0-100)
  const progressPercentage = creditLimit > 0 ? Math.min((spentCredit / creditLimit) * 100, 100) : 0;
  
  // Determine color based on usage
  const getProgressColor = () => {
    if (progressPercentage >= 90) return colors.danger;
    if (progressPercentage >= 70) return colors.warning;
    return colors.success;
  };

  const dynamicProgressColor = progressColor === colors.warning ? getProgressColor() : progressColor;

  return (
    <View style={[
      styles.container,
      {
        height,
        backgroundColor,
        borderRadius,
      }
    ]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${progressPercentage}%`,
            backgroundColor: dynamicProgressColor,
            borderRadius,
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});