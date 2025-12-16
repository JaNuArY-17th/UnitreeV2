
// Navigation types for the app

// Tab navigator parameter list
export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};

// Root stack parameter list
export type RootStackParamList = {
  // Authentication screens
  Login: undefined;
  Register: { userType?: 'user' } | undefined;
  ForgotPassword: undefined;
  Policy: undefined;

  // Main app
  MainTabs: { screen?: keyof TabParamList } | undefined;
  Main: { screen?: keyof TabParamList } | undefined;
};
