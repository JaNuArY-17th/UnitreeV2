export const dimensions = {
  // Padding and margins
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    x3l: 34,
  },

  // Border radius
  radius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    round: 999, // For fully rounded elements
  },

  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    xxxxl: 28,
    header: 22,
  },

  // Component specific dimensions
  components: {
    buttonHeight: 46,
    inputHeight: 46,
    chartHeight: 300,
    orderBookMaxHeight: 300,
    sliderTrackHeight: 6,
    sliderHandleSize: 24,
    toggleHeight: 22,
    toggleWidth: 40,
    toggleHandleSize: 18,
    iconButtonSize: 36,
    infoItemWidth: 150,
  },

  // Border widths
  border: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
} as const;
