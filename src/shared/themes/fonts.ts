import { Platform, TextStyle } from 'react-native';

export const FONT_FAMILY = {
  POPPINS: Platform.select({
    ios: 'FzPoppins',
    android: 'FZ Poppins',
    default: 'FzPoppins',
  }),
  ARIAL: 'Arial',
} as const;



export const FONT_WEIGHTS = {
  THIN: 'Thin',
  THIN_ITALIC: 'ThinItalic',
  EXTRALIGHT: 'ExtraLight',
  EXTRALIGHT_ITALIC: 'ExtraLightItalic',
  LIGHT: 'Light',
  LIGHT_ITALIC: 'LightItalic',
  REGULAR: 'Regular',
  REGULAR_ITALIC: 'Italic',
  MEDIUM: 'Medium',
  MEDIUM_ITALIC: 'MediumItalic',
  SEMIBOLD: 'SemiBold',
  SEMIBOLD_ITALIC: 'SemiBoldItalic',
  BOLD: 'Bold',
  BOLD_ITALIC: 'BoldItalic',
  EXTRABOLD: 'ExtraBold',
  EXTRABOLD_ITALIC: 'ExtraBoldItalic',
  BLACK: 'Black',
  BLACK_ITALIC: 'BlackItalic',
} as const;

export type FontWeight = typeof FONT_WEIGHTS[keyof typeof FONT_WEIGHTS];

// Weight to numeric mapping for Android fallback
const FONT_WEIGHT_NUMERIC: Record<FontWeight, TextStyle['fontWeight']> = {
  [FONT_WEIGHTS.THIN]: '100',
  [FONT_WEIGHTS.THIN_ITALIC]: '100',
  [FONT_WEIGHTS.EXTRALIGHT]: '200',
  [FONT_WEIGHTS.EXTRALIGHT_ITALIC]: '200',
  [FONT_WEIGHTS.LIGHT]: '300',
  [FONT_WEIGHTS.LIGHT_ITALIC]: '300',
  [FONT_WEIGHTS.REGULAR]: '400',
  [FONT_WEIGHTS.REGULAR_ITALIC]: '400',
  [FONT_WEIGHTS.MEDIUM]: '500',
  [FONT_WEIGHTS.MEDIUM_ITALIC]: '500',
  [FONT_WEIGHTS.SEMIBOLD]: '600',
  [FONT_WEIGHTS.SEMIBOLD_ITALIC]: '600',
  [FONT_WEIGHTS.BOLD]: '700',
  [FONT_WEIGHTS.BOLD_ITALIC]: '700',
  [FONT_WEIGHTS.EXTRABOLD]: '800',
  [FONT_WEIGHTS.EXTRABOLD_ITALIC]: '800',
  [FONT_WEIGHTS.BLACK]: '900',
  [FONT_WEIGHTS.BLACK_ITALIC]: '900',
};

const FONT_STYLE: Record<FontWeight, TextStyle['fontStyle']> = {
  [FONT_WEIGHTS.THIN]: 'normal',
  [FONT_WEIGHTS.THIN_ITALIC]: 'italic',
  [FONT_WEIGHTS.EXTRALIGHT]: 'normal',
  [FONT_WEIGHTS.EXTRALIGHT_ITALIC]: 'italic',
  [FONT_WEIGHTS.LIGHT]: 'normal',
  [FONT_WEIGHTS.LIGHT_ITALIC]: 'italic',
  [FONT_WEIGHTS.REGULAR]: 'normal',
  [FONT_WEIGHTS.REGULAR_ITALIC]: 'italic',
  [FONT_WEIGHTS.MEDIUM]: 'normal',
  [FONT_WEIGHTS.MEDIUM_ITALIC]: 'italic',
  [FONT_WEIGHTS.SEMIBOLD]: 'normal',
  [FONT_WEIGHTS.SEMIBOLD_ITALIC]: 'italic',
  [FONT_WEIGHTS.BOLD]: 'normal',
  [FONT_WEIGHTS.BOLD_ITALIC]: 'italic',
  [FONT_WEIGHTS.EXTRABOLD]: 'normal',
  [FONT_WEIGHTS.EXTRABOLD_ITALIC]: 'italic',
  [FONT_WEIGHTS.BLACK]: 'normal',
  [FONT_WEIGHTS.BLACK_ITALIC]: 'italic',
};

/**
 * Get the full font family name for the specified weight
 * iOS requires full font name (e.g., "Poppins-Bold")
 * Android can work with both full name or base + fontWeight
 */
export function getFontFamily(weight: FontWeight = FONT_WEIGHTS.REGULAR): string {
  if (Platform.OS === 'ios') {
    // iOS needs full font name
    return `${FONT_FAMILY.POPPINS}-${weight}`;
  }
  // Android can use base name with fontWeight
  return `${FONT_FAMILY.POPPINS}-${weight}`;
}

/**
 * Get platform-specific font styling
 * Returns fontFamily only for iOS (since it uses full font names)
 * Returns fontFamily + fontWeight + fontStyle for Android as fallback
 */
export function getPlatformFontExtras(
  weight: FontWeight = FONT_WEIGHTS.REGULAR
): Pick<TextStyle, 'fontFamily' | 'fontWeight' | 'fontStyle'> {
  if (Platform.OS === 'ios') {
    // iOS with full font name doesn't need fontWeight/fontStyle
    return {
      fontFamily: getFontFamily(weight),
      fontWeight: undefined,
      fontStyle: undefined,
    };
  }
  
  // Android fallback with numeric weight
  return {
    fontFamily: getFontFamily(weight),
    fontWeight: FONT_WEIGHT_NUMERIC[weight],
    fontStyle: FONT_STYLE[weight],
  };
}

/**
 * Helper function to create text style with specific Poppins weight
 * Usage: textStyle('Bold') returns { fontFamily: 'Poppins-Bold' }
 */
export function textStyle(
  weight: FontWeight = FONT_WEIGHTS.REGULAR
): Pick<TextStyle, 'fontFamily'> {
  return {
    fontFamily: getFontFamily(weight),
  };
}

/**
 * Pre-defined text styles for common font weights
 */
export const TEXT_STYLES = {
  thin: textStyle(FONT_WEIGHTS.THIN),
  thinItalic: textStyle(FONT_WEIGHTS.THIN_ITALIC),
  extraLight: textStyle(FONT_WEIGHTS.EXTRALIGHT),
  extraLightItalic: textStyle(FONT_WEIGHTS.EXTRALIGHT_ITALIC),
  light: textStyle(FONT_WEIGHTS.LIGHT),
  lightItalic: textStyle(FONT_WEIGHTS.LIGHT_ITALIC),
  regular: textStyle(FONT_WEIGHTS.REGULAR),
  italic: textStyle(FONT_WEIGHTS.REGULAR_ITALIC),
  medium: textStyle(FONT_WEIGHTS.MEDIUM),
  mediumItalic: textStyle(FONT_WEIGHTS.MEDIUM_ITALIC),
  semiBold: textStyle(FONT_WEIGHTS.SEMIBOLD),
  semiBoldItalic: textStyle(FONT_WEIGHTS.SEMIBOLD_ITALIC),
  bold: textStyle(FONT_WEIGHTS.BOLD),
  boldItalic: textStyle(FONT_WEIGHTS.BOLD_ITALIC),
  extraBold: textStyle(FONT_WEIGHTS.EXTRABOLD),
  extraBoldItalic: textStyle(FONT_WEIGHTS.EXTRABOLD_ITALIC),
  black: textStyle(FONT_WEIGHTS.BLACK),
  blackItalic: textStyle(FONT_WEIGHTS.BLACK_ITALIC),
} as const;