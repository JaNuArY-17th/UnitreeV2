import AsyncStorage from '@react-native-async-storage/async-storage';

// Color definitions for the application
export const colors = {
  // Primary colors
  primary: '#98D56D',
  primaryDark: '#087045ff',
  primaryLight: '#B8E49D',
  primarySoft: '#D4F0A8',

  // Secondary colors
  secondary: '#B7DDE6',
  secondaryDark: '#8FCCD9',
  secondaryLight: '#D5E8F0',
  secondarySoft: '#E8F4F7',

  //thirdary colors
  thirdary: '#FFCED2',
  brown: '#654419',

  // Additional colors
  success: '#4CAF50',
  successSoft: '#9df4c1ff',
  danger: '#E94235',
  dangerSoft: '#FFE9E7',
  warning: '#FFC107',
  warningDark: '#9C6F00',
  warningSoft: '#FFF4CC',
  info: '#2196F3',
  infoSoft: '#4bacfcff',
  light: '#FFFFFF',
  dark: '#333333',
  gray: '#757575',
  lightGray: '#EEEEEE',
  background: '#F9FCFB',
  border: '#E0E0E0',
  brand: '#164951',
  mutedLine: '#EBECEF',
  textOnPrimaryMuted: '#D1E0E4',
  text: {
    primary: '#333333',
    secondary: '#757575',
    light: '#FFFFFF',
  },
  chart: {
    green: '#4CAF50',
    red: '#E94235',
  },
  tab: {
    active: '#2376CB',
    inactive: '#757575',
  },
};

// Simple getter for colors - returns the color object directly
export const getColors = () => {
  return colors;
};

// Legacy function for backward compatibility - no longer changes colors by account type
export const updateColorsForAccountType = () => {
  // No-op function for backward compatibility
  // Colors are now unified and do not change by account type
};

// Legacy function for backward compatibility
export const subscribeToColorChanges = () => {
  // No-op function - colors are now static
  return () => {};
};

// Legacy function for backward compatibility
export const initializeColorsFromStorage = async () => {
  // No-op function - colors are now loaded statically
};
