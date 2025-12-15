import type { StoreMyDataResponse } from '@/features/authentication/types/store';

// Navigation types for the app
export type RootStackParamList = {
  // Authentication screens
  AuthLoading: undefined;
  Login: undefined;
  RememberLogin: undefined;
  Register: { userType?: 'store' | 'user' } | undefined;
  RegisterOtp: { phone: string };
  LoginOtp: { phone: string; userType: 'store' | 'user' };
  ForgotPassword: undefined;
  ForgotPasswordOtp: { phone: string };
  ResetPassword: { token: string; phone: string };
  CreateStoreStart: undefined;
  CreateStore: { taxCode: string; storeType?: 'business' | 'personal' } | undefined;
  UploadBusinessLicense: { storeId: string };
  Policy: undefined;

  // Main app
  MainTabs: { screen?: keyof TabParamList } | undefined;
  Main: { screen?: keyof TabParamList } | undefined;

  // Profile screens
  UserDetail: undefined;
  Notification: undefined;
  NotificationSettings: undefined;
  SpeakerNotificationSettings: undefined;
  LinkSpeaker: undefined;
  SecuritySettings: undefined;
  ChangePassword: undefined;
  ProfileResetPassword: undefined;
  ProfileResetPasswordOtp: { phone: string };
  ProfileResetPasswordNewPassword: undefined;
  StoreDetail: undefined;
  EditContact: undefined;
  EditContactOtp: undefined;
  AppInformation: undefined;
  SupportCenter: undefined;
};

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};
