
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
  Register: undefined;
  RegisterEmail: undefined;
  RegisterCode: { email: string };
  RegisterComplete: { email: string };
  RegisterSuccess: { nickname: string };
  ForgotPassword: undefined;
  ForgotPasswordEmail: undefined;
  ForgotPasswordCode: { email: string };
  ForgotPasswordReset: { email: string };
  Policy: undefined;

  // Main app
  MainTabs: { screen?: keyof TabParamList } | undefined;
  Main: { screen?: keyof TabParamList } | undefined;
};
