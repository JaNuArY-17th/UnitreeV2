// Định nghĩa các interface cho bank
export interface BankAccount {
  id: string;
  bankNumber: string;
  bankHolder: string;
  bankBalance: number;
  bankType: string;
  bankStatus: string | null;
  bankCurrency: string;
  createAt: string;
  updateAt: string;
  userId: string;
}

export interface BankState {
  accountNumbers: string[];
  bankAccount: BankAccount | null;
  isLoading: boolean;
  error: string | null;
}

export interface GetAccountNumbersResponse {
  success: boolean;
  message: string;
  data: string[];
  code: number;
}

export interface ChooseAccountNumberResponse {
  success: boolean;
  message: string;
  data: {
    bankBalance: number;
    bankCurrency: string;
    bankHolder: string;
    bankNumber: string;
    bankStatus: string;
    bankType: string;
    createAt: string;
    id: string;
    updateAt: string;
    userId: string;
  };
  code: number;
}

export interface MyBankAccountResponse {
  success: boolean;
  message: string;
  data: BankAccount;
  code: number;
}
