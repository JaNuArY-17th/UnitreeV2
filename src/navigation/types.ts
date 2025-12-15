// Navigation types for the app

// Tab navigator parameter list
export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};

// Root stack parameter list
export type RootStackParamList = {
  // Authentication screens
  AuthLoading: undefined;
  Login: undefined;
  RememberLogin: undefined;
  Register: { userType?: 'user' } | undefined;
  RegisterOtp: { phone: string };
  LoginOtp: { phone: string; userType: 'user' };
  ForgotPassword: undefined;
  ForgotPasswordOtp: { phone: string };
  ResetPassword: { token: string; phone: string };
  Policy: undefined;

  // Main app
  MainTabs: { screen?: keyof TabParamList } | undefined;
  Main: { screen?: keyof TabParamList } | undefined;
};
