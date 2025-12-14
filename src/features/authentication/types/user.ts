// User related types

// Permission interface
export interface Permission {
  id: string;
  action: string;
  resource: string;
  created_at: string;
  updated_at: string;
}

// Role interface
export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

// Main User interface matching the API response
export interface User {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string;
  referral_code: string;
  is_block: boolean;
  is_shop: boolean;
  is_verified: boolean;
  verify_status: 'VERIFIED' | 'NOT_VERIFIED' | 'CARD_VERIFIED';
  app_id: number[];
  created_at: string;
  updated_at: string;
  role: Role;
  avatar: string | null;
  date_of_birth: string;
  gender: boolean; // true for male, false for female
  nationality: string;
  permanent_address: string;
  contact_address: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: UserAddress;
  preferences?: UserPreferences;
}

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface UserPreferences {
  language: 'vi' | 'en';
  currency: 'VND' | 'USD';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

// Current user API response type
export interface CurrentUserResponse {
  success: true;
  message: string;
  data: User;
  code: number;
}

// User update types
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  profile?: Partial<UserProfile>;
}

export interface UpdateUserResponse {
  user: User;
}

export interface Avatar {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface UserFromAPI {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string;
  referral_code: string;
  is_block: boolean;
  is_shop: boolean; // Shop status flag - same as in main User interface
  is_verified: boolean;
  verify_status: 'VERIFIED' | 'NOT_VERIFIED' | 'CARD_VERIFIED';
  app_id: number;
  created_at: string;
  updated_at: string;
  role: Role;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  permanent_address: string | null;
  contact_address: string | null;
  avatar: Avatar | null;
  identification_number: string | null; // CCCD/CMND number
  account_type?: 'USER' | 'STORE'; // Account type for banking services
}

export interface MyDataResponse {
  success: boolean;
  message: string;
  data: {
    items: UserFromAPI[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  code: number;
}

// ✅ NEW: Actual API response format for /iam/v1/users/my-data
export interface MyDataActualResponse {
  success: boolean;
  message: string;
  data: UserFromAPI; // Direct user object, not array
  code: number;
}