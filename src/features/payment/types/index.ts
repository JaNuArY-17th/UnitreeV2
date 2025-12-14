export interface Account {
  id: string;
  name: string;
  bankCode: string;
  accountNumber: string;
  balance: number;
  currency: string;
  type: 'bank' | 'wallet';
  icon?: string;
  isDefault?: boolean;
}

export interface QRPaymentData {
  qrCode: string;
  qrDataURL?: string; // Base64 image data
  amount?: number;
  merchantName?: string;
  description?: string;
  expiresAt?: string;
  autoUpdateInterval?: number;
}

export interface QRCodeDisplayProps {
  qrData: QRPaymentData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onPromotionPress?: () => void;
}

export interface AccountSelectorProps {
  accounts: Account[];
  selectedAccount: Account;
  onAccountSelect: (account: Account) => void;
  onViewAll?: () => void;
}

export interface QRReceiveActionProps {
  onPress: () => void;
}

export interface QRPaymentScreenProps {
  qrData?: QRPaymentData;
  accounts?: Account[];
  onAccountChange?: (account: Account) => void;
  onQRRefresh?: () => void;
  onPromotionPress?: () => void;
}
