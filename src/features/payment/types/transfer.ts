import type { BankType } from '@/features/deposit/types/bank';

export interface TransferRecipient {
  id?: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  logoUrl?: string;
  isEzyWallet?: boolean;
  bankType?: BankType;
}

export interface TransferParams {
  amount: string;
  note: string;
  recipient: TransferRecipient;
}

export interface QuickNote {
  id: string;
  text: string;
}

export interface TransferMethod {
  id: 'bank' | 'wallet';
  icon: React.ReactNode;
  text: string;
  onPress: () => void;
}

export interface RecentRecipient {
  id: string;
  bankHolder: string;
  bankNumber: string;
  bankType: 'USER' | 'STORE';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetRecentRecipientsParams {
  bankType?: 'USER' | 'STORE';
  page?: number;
  limit?: number;
}

export interface GetRecentRecipientsResponse {
	success: boolean,
	message: string,
	data: {
		totalItems: number,
		recentRecipients: RecentRecipient[],
		totalPages: number,
		currentPage: number
	},
	code: number
}

export interface AddRecentRecipientRequest {
  bankNumber: string;
  notes?: string;
}

export interface DeleteRecentRecipientRequest {
  ids: string[];
}

export interface DeleteRecentRecipientResponse {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
    message: string;
  };
  code: number;
}

// Re-export VietQRBank from deposit feature
export type { VietQRBank as Bank } from '@/features/deposit/types/bank';
export type { BankType } from '@/features/deposit/types/bank';

// Legacy Bank interface for backward compatibility
export interface LegacyBank {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logo?: string;
}

export interface GenerateQRRequest {
  amount?: number;
  description?: string;
}

export interface QRApiResponse {
  success: boolean;
  message: string;
  data: {
    qrCode: string;
    qrDataURL: string;
  };
  code: number;
}

// New Transfer API request/response types
export type TransactionType = 'REAL' | 'CREDIT';

export type TransferInitiateRequest = {
  destinationAccountNumber: string,
  amount: number,
  description: string,
  transactionType: TransactionType,
  orderId?: string
}

export interface TransferInitiateResponse {
  success: boolean,
  message: string,
  data: {
    requestId: string,
    phoneNumber: string,
    expireInSeconds: number
  },
  code: 200
}

export interface TransferVerifyRequest {
  tempTransactionId: string,
  otp: string
}

export interface TransferVerifyResponse {
  success: boolean,
  message: string,
  data: {
    transactionId: string,
    transactionCode: string,
    sourceAccountNumber: string,
    destinationAccountNumber: string,
    amount: string,
    description: string,
    status: string
  },
  code: number
}

export interface TransferResend {
  tempTransactionId: string,
}

export interface SearchAccountResponse {
  success: boolean,
  message: string,
  data: {
    accountNumber: string,
    accountName: string,
    bankId: string
  },
  code: number
}

export interface QRInformationRequest {
  qrContent: string
}

export interface QRInformationResponse {
  success: boolean,
  message: string,
  data: {
    bankNumber: string,
    bankHolder: string,
    bankBin: string,
    amount?: string,
    description?: string,
    orderId?: string,
    orderIdValid?: boolean
  },
  code: number
}