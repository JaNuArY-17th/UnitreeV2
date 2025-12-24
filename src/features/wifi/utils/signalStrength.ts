import { colors } from '@/shared/themes';

/**
 * Get signal strength label based on level (0-4 for Android)
 * @param level Signal level (0=poor, 4=excellent)
 * @returns Signal strength label
 */
export const getSignalStrengthLabel = (level?: number): string => {
  if (level === undefined) return 'Good';
  
  // Android level: 0-4 (0=poor, 4=excellent)
  switch (level) {
    case 4:
      return 'Excellent';
    case 3:
      return 'Good';
    case 2:
      return 'Fair';
    case 1:
      return 'Poor';
    case 0:
      return 'Poor';
    default:
      return 'Good';
  }
};

/**
 * Get color for signal strength
 * @param strength Signal strength label
 * @returns Color hex code
 */
export const getSignalColor = (strength: string): string => {
  switch (strength.toLowerCase()) {
    case 'excellent':
      return colors.primary;
    case 'good':
      return colors.success;
    case 'fair':
      return colors.warning;
    case 'poor':
      return colors.danger;
    default:
      return colors.gray;
  }
};
