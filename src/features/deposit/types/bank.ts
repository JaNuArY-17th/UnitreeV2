export interface BankInfo {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  transferContent: string;
}

/**
 * Bank API types
 */
export type BankType = 'USER' | 'STORE';
// NOTE: TransactionType moved to @/features/transactions/types

export interface CheckBankResponse {
	success: boolean,
	message: string,
	data: {
		hasAccount: boolean
	},
	code: number
}

export interface ChooseBank {
  id: string;
  number: string;
  holderName: string;
  bankId: string;
  userId: string;
}

export interface ChooseBankResponse {
  success: boolean; 
  message: string;
  data: ChooseBank;
  code: number;
}

export interface BankAccount {
  id: string;
  bankNumber: string;
  bankHolder: string;
  bankBalance: number;
  bankCurrency: string;
  bankStatus: string;
  bankType: BankType;
  createAt: string;
  updateAt: string;
  userId: string;
}

export interface BankResponse {
  success: boolean;
  message: string;
  data: BankAccount;
  code: number;
}

export interface BankQueryParams {
  bankType: BankType;
}

/**
 * VietQR API types for bank selection
 */
export interface VietQRBank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
}

export interface VietQRBanksResponse {
  code: string;
  desc: string;
  data: VietQRBank[];
}

/**
 * List bank API types for bank selection
 */
export interface ListBank {
  id: number,
  bnkId: string,
  bnkNm: string,
  citad: string,
  brchNm: string,
  statPrvc: string,
  actvSts: string,
  centBnk: string
}

export interface ListBankResponse {
  success: boolean;
  message: string;
  data: ListBank[];
  code: number;
}

/**
 * QR Code generation types
 */
export interface QRGenerationRequest {
  amount: number;
  bin: string;
}

export interface QRGenerationParams {
  bankType: BankType;
}

export interface QRGenerationResponse {
  success: boolean;
  message: string;
  data: {
    accountName: string;
    accountNumber: string;
    amount: string;
    bankName: string;
    content: string;
    qrData: {
      qrCode: string;
      qrDataURL: string; // base64 encoded QR code with data:image/png;base64, prefix
    };
  };
  code: number;
}

export interface LinkedBank {
  id: string;
  code: string;
  bin: string;
  citad?: string; // optional citad code from linked bank API
  name: string;
  shortname: string;
  number: string;
  holderName: string;
  isActive: boolean;
  /** Indicates this linked bank is the current default (backend field) */
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedBanksResponse {
  success: boolean;
  message: string;
  data: LinkedBank[];
  code: number;
}

export interface LinkBankRequest {
  citad: string;
  name: string;
  number: string;
  holderName: string
}

export interface LinkBankResponse {
  success: boolean;
  message: string;
  data: LinkedBank;
  code: number;
}

// NOTE: Transaction-related types moved to @/features/transactions/types
// Use TransactionHistoryParams, Transaction, TransactionHistoryResponse, TransactionDetailResponse from there

export interface withdrawRequest {
  amount: number,
  linkedAccountId: string
}

export interface withdrawResponse {
  success: boolean,
  message: string,
  data: {
    requestId: string,
    phoneNumber: string,
    expireInSeconds: number
  },
  code: number
}

export interface withdrawVerifyRequest {
  tempTransactionId: string,
  otp: string
}

export interface withdrawVerifyResponse {
  success: boolean,
  message: string,
  data: {
    id: string,
    transactionCode: string,
    amount: number,
    state: string,
    description: string,
    status: string
    createdAt: string
  },
  code: number
}

export interface withdrawResendOTP {
  tempTransactionId: string
}