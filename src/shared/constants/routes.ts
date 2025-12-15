export const ROUTES = {
  // Auth screens
  LOGIN: 'Login',
  SIGNUP: 'SignUp',
  FORGOT_PASSWORD: 'ForgotPassword',
  RESET_PASSWORD: 'ResetPassword',
  VERIFY_EMAIL: 'VerifyEmail',

  // Main app navigation
  MAIN_TABS: 'MainTabs',
  HOME: 'Home',
  PROFILE: 'Profile',

  // Common screens
  NOTIFICATIONS: 'Notifications',
  NOTIFICATION_DETAIL: 'NotificationDetail',
  SETTINGS: 'Settings',
  EDIT_PROFILE: 'EditProfile',
  SECURITY: 'Security',
  LANGUAGE: 'Language',
  SEARCH_SCREEN: 'SearchScreen',
} as const;

export type RouteNames = typeof ROUTES[keyof typeof ROUTES];
