import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { dimensions } from './dimensions';
import { FONT_WEIGHTS, getFontFamily, getPlatformFontExtras } from './fonts';

export const typography = {
  fontSizes: dimensions.fontSize,
  fontWeights: FONT_WEIGHTS,
  lineHeights: {
    xs: 16,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 36,
    xxxxl: 40,
  },
};

export default StyleSheet.create({
  h1: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.xxxl,

    ...getPlatformFontExtras(FONT_WEIGHTS.SEMIBOLD),
    lineHeight: typography.lineHeights.xxxl,
  },

  h2: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.xxl,
    ...getPlatformFontExtras(FONT_WEIGHTS.SEMIBOLD),
    lineHeight: typography.lineHeights.xl,
  },

  h3: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.xl,

    ...getPlatformFontExtras(FONT_WEIGHTS.SEMIBOLD),
    lineHeight: typography.lineHeights.lg,
  },

  title: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.xl,
    ...getPlatformFontExtras(FONT_WEIGHTS.SEMIBOLD),
    lineHeight: typography.lineHeights.lg,
  },

  subtitle: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.lg,
    ...getPlatformFontExtras(FONT_WEIGHTS.MEDIUM),
    lineHeight: typography.lineHeights.lg,
  },

  body: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.md,
    ...getPlatformFontExtras(FONT_WEIGHTS.REGULAR),
    lineHeight: typography.lineHeights.md,
  },

  bodySmall: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.sm,
    ...getPlatformFontExtras(FONT_WEIGHTS.REGULAR),
    lineHeight: typography.lineHeights.sm,
  },

  caption: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.sm,
    ...getPlatformFontExtras(FONT_WEIGHTS.REGULAR),
    lineHeight: typography.lineHeights.lg,
  },

  label: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.sm,
    maxWidth: '45%',
    ...getPlatformFontExtras(FONT_WEIGHTS.MEDIUM),
    lineHeight: typography.lineHeights.sm,
  },

  longLabel: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.sm,
    maxWidth: '75%',
    ...getPlatformFontExtras(FONT_WEIGHTS.MEDIUM),
    lineHeight: typography.lineHeights.sm,
  },

  price: {
    fontSize: typography.fontSizes.lg,
    ...getPlatformFontExtras(FONT_WEIGHTS.MEDIUM),
    lineHeight: typography.lineHeights.md,
  },

  priceAsk: {
    color: colors.danger,
    fontSize: typography.fontSizes.md,
    ...getPlatformFontExtras(FONT_WEIGHTS.MEDIUM),
    lineHeight: typography.lineHeights.md,
  },

  priceBid: {
    color: colors.success,
    fontSize: typography.fontSizes.md,
    ...getPlatformFontExtras(FONT_WEIGHTS.MEDIUM),
    lineHeight: typography.lineHeights.md,
  },

  amount: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.md,
    textAlign: 'right',
    ...getPlatformFontExtras(FONT_WEIGHTS.REGULAR),
    lineHeight: typography.lineHeights.md,
  },

  buttonText: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.lg,

    ...getPlatformFontExtras(FONT_WEIGHTS.SEMIBOLD),
    textAlign: 'center',
    lineHeight: typography.lineHeights.md,
  },

  tabActive: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.md,

    ...getPlatformFontExtras(FONT_WEIGHTS.BOLD),
    lineHeight: typography.lineHeights.md,
  },

  tabInactive: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.md,
    ...getPlatformFontExtras(FONT_WEIGHTS.REGULAR),
    lineHeight: typography.lineHeights.md,
  },

  currentPrice: {
    color: colors.danger,
    fontSize: typography.fontSizes.lg,

    ...getPlatformFontExtras(FONT_WEIGHTS.BOLD),
    lineHeight: typography.lineHeights.md,
  },

  timestamp: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xs,
    ...getPlatformFontExtras(FONT_WEIGHTS.REGULAR),
    lineHeight: typography.lineHeights.xs,
  },
});
