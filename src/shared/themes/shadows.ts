import { Platform } from 'react-native';

// Cross platform shadow presets.
// iOS uses shadow props, Android relies on elevation mapping.
export const shadows = {
  none: Platform.select({ ios: { shadowOpacity: 0 }, android: { elevation: 0 } }),
  xs: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    android: { elevation: 1 },
  }),
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 2 },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 4 },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 6 },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation: 10 },
  }),
} as const;

export type ShadowKey = keyof typeof shadows;

export function getShadow(key: ShadowKey = 'none') {
  return shadows[key];
}
