import { colors, getColors, subscribeToColorChanges, updateColorsForAccountType, initializeColorsFromStorage } from './colors';
import { dimensions } from './dimensions';
import { FONT_WEIGHTS, getFontFamily, getPlatformFontExtras, textStyle } from './fonts';
import { spacing } from './spacing';
import typography from './typography';
import { shadows } from './shadows';

// Re-export hooks
export * from './hooks';

export const theme = {
  colors,
  typography,
  spacing,
  dimensions,
  shadows,
  fonts: {
    weights: FONT_WEIGHTS,
    getFamily: getFontFamily,
    getPlatformExtras: getPlatformFontExtras,
  },
} as const;

// Type exports
export type { FontWeight } from './fonts';
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Dimensions = typeof dimensions;

// Direct exports for convenience
export { colors, dimensions, FONT_WEIGHTS, getFontFamily, getPlatformFontExtras, textStyle, spacing, typography, shadows, subscribeToColorChanges, updateColorsForAccountType, initializeColorsFromStorage };
