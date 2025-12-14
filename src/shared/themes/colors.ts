import { blue } from "react-native-reanimated/lib/typescript/Colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for account type
const ACCOUNT_TYPE_STORAGE_KEY = '@account_type';

// Base color definitions
const baseColors = {
  // STORE colors (current primary colors)
  storePrimary: '#00492B',
  storePrimaryDark: '#033d24',
  storePrimaryLight: '#e5f5ef',
  storePrimarySoft: '#14945eff',

  // USER colors (current blue colors)
  userPrimary: '#003e7cff',
  userPrimaryDark: '#00294fff',
  userPrimaryLight: '#e6f0faff',
  userPrimarySoft: '#1d79b6ff',
  // userPrimary: '#00492B',
  // userPrimaryDark: '#033d24',
  // userPrimaryLight: '#e5f5ef',
  // userPrimarySoft: '#14945eff',

  // Common colors that don't change
  secondary: '#F8F9FA',
  secondaryDark: '#e6e7e8',
  accent: '#7BB661',
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
  high: '#E93CFF',
  low: '#00BBF3',
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

// Function to get colors based on account type
export const getColors = (accountType?: 'USER' | 'STORE') => {
  const isUser = accountType === 'USER';

  return {
    // Dynamic primary colors based on account type
    primary: isUser ? baseColors.userPrimary : baseColors.storePrimary,
    primaryDark: isUser ? baseColors.userPrimaryDark : baseColors.storePrimaryDark,
    primaryLight: isUser ? baseColors.userPrimaryLight : baseColors.storePrimaryLight,
    primarySoft: isUser ? baseColors.userPrimarySoft : baseColors.storePrimarySoft,

    // Dynamic blue colors (swapped with primary for USER accounts)
    blue: isUser ? baseColors.storePrimary : baseColors.userPrimary,
    blueDark: isUser ? baseColors.storePrimaryDark : baseColors.userPrimaryDark,
    blueLight: isUser ? baseColors.storePrimaryLight : baseColors.userPrimaryLight,
    blueSoft: isUser ? baseColors.storePrimarySoft : baseColors.userPrimarySoft,

    // Common colors remain unchanged
    secondary: baseColors.secondary,
    secondaryDark: baseColors.secondaryDark,
    accent: baseColors.accent,
    success: baseColors.success,
    successSoft: baseColors.successSoft,
    danger: baseColors.danger,
    dangerSoft: baseColors.dangerSoft,
    warning: baseColors.warning,
    warningDark: baseColors.warningDark,
    warningSoft: baseColors.warningSoft,
    info: baseColors.info,
    infoSoft: baseColors.infoSoft,
    light: baseColors.light,
    dark: baseColors.dark,
    gray: baseColors.gray,
    high: baseColors.high,
    low: baseColors.low,
    lightGray: baseColors.lightGray,
    background: baseColors.background,
    border: baseColors.border,
    brand: baseColors.brand,
    mutedLine: baseColors.mutedLine,
    textOnPrimaryMuted: baseColors.textOnPrimaryMuted,
    text: baseColors.text,
    chart: baseColors.chart,
    tab: baseColors.tab,
  };
};

// Colors manager to handle dynamic color updates
class ColorsManager {
  private currentAccountType: 'USER' | 'STORE' = 'STORE';
  private currentColors = getColors(this.currentAccountType);
  private subscribers: ((colors: ReturnType<typeof getColors>) => void)[] = [];
  private initialized = false;

  constructor() {
    this.loadStoredAccountType();
  }

  private async loadStoredAccountType() {
    try {
      const storedAccountType = await AsyncStorage.getItem(ACCOUNT_TYPE_STORAGE_KEY);
      if (storedAccountType === 'USER' || storedAccountType === 'STORE') {
        this.currentAccountType = storedAccountType;
        this.currentColors = getColors(this.currentAccountType);
        // Notify subscribers of the loaded colors
        this.subscribers.forEach(callback => callback(this.currentColors));
      }
      // Always mark as initialized, even if no stored account type
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to load stored account type:', error);
      // Still mark as initialized even on error
      this.initialized = true;
    }
  }

  private async persistAccountType(accountType: 'USER' | 'STORE') {
    try {
      await AsyncStorage.setItem(ACCOUNT_TYPE_STORAGE_KEY, accountType);
    } catch (error) {
      console.warn('Failed to persist account type:', error);
    }
  }

  updateAccountType(accountType: 'USER' | 'STORE' | undefined) {
    const newAccountType = accountType || 'STORE';
    if (newAccountType !== this.currentAccountType) {
      this.currentAccountType = newAccountType;
      this.currentColors = getColors(this.currentAccountType);
      // Persist the account type
      this.persistAccountType(newAccountType);
      // Notify all subscribers of the color change
      this.subscribers.forEach(callback => callback(this.currentColors));
    }
  }

  getCurrentAccountType() {
    return this.currentAccountType;
  }

  getColors() {
    return this.currentColors;
  }

  isInitialized() {
    return this.initialized;
  }

  subscribe(callback: (colors: ReturnType<typeof getColors>) => void) {
    this.subscribers.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
}

const colorsManager = new ColorsManager();

// Create a proxy object that dynamically returns colors
export const colors = new Proxy({} as ReturnType<typeof getColors>, {
  get(target, prop) {
    const currentColors = colorsManager.getColors();
    return currentColors[prop as keyof typeof currentColors];
  },
});

// Function to update colors when account type changes
export const updateColorsForAccountType = (accountType: 'USER' | 'STORE' | undefined) => {
  colorsManager.updateAccountType(accountType);
};

// Function to subscribe to color changes
export const subscribeToColorChanges = (callback: (colors: ReturnType<typeof getColors>) => void) => {
  return colorsManager.subscribe(callback);
};

// Function to initialize colors from stored account type (call this on app startup)
export const initializeColorsFromStorage = async () => {
  // Wait for colors to be initialized from AsyncStorage (with timeout)
  const startTime = Date.now();
  const timeout = 2000; // 2 seconds timeout

  while (!colorsManager.isInitialized() && (Date.now() - startTime) < timeout) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 10));
  }

  if (!colorsManager.isInitialized()) {
    console.log('⚠️ Color initialization timeout - proceeding with defaults');
  }
};

// Dedicated method to get user type color for components (like LoginScreen approach)
export const getUserTypeColor = (): string => {
  try {
    // Try to get stored account type synchronously
    const storedAccountType = colorsManager.getCurrentAccountType();
    return getColors(storedAccountType).primary;
  } catch (error) {
    // Fallback to current colors if storage access fails
    console.warn('Failed to get stored user type color, using fallback:', error);
    return colors.primary;
  }
};
