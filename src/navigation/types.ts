import type { OTPType, OTPContextData } from '@/features/otp';
import type { StoreMyDataResponse } from '@/features/authentication/types/store';
import type { TaxCodeInfo } from '@/features/invoice';

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
  CreateStore: { taxCode: string; companyInfo?: TaxCodeInfo; storeType?: 'business' | 'personal' } | undefined;
  UploadBusinessLicense: { storeId: string };
  CreateStoreSuccess: { storeData: StoreMyDataResponse['data'] };

  // Main app
  MainTabs: { screen?: keyof TabParamList } | undefined;
  Main: { screen?: keyof TabParamList } | undefined; // Alternative alias for MainTabs
  QRPayment: undefined;
  ScanQRScreen: undefined;
  TransactionDetail: { transaction: any };

  // eKYC flow
  Ekyc: undefined;
  EkycCapture: { isRetake?: boolean } | undefined;
  UserInfo: {
    idNumber?: string;
    fullName?: string;
    gender?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    ekycResult?: {
      ocrData?: any;
      ocrErrors?: any[];
      compareResult?: any;
      [key: string]: any;
    };
  };

  OTPVerification: {
    phone?: string;
    otpType?: OTPType;
    accountId?: string;
    amount?: number;
    // Additional context data
    context?: OTPContextData;
    // Trading specific params
    orderData?: {
      symbol: string;
      name: string;
      orderType: 'buy' | 'sell';
      quantity: string;
      price: string;
      orderMode: 'limit' | 'market';
    };
    // Term deposit purchase specific params
    transactionData?: {
      selectedStock?: string;
      amount: number;
      termKey: string;
      accountNumber: string;
      accountName: string;
      accountBalance: number;
    };

  } | undefined;

  // Banks
  BankAccount: undefined;

  // Econtract
  EcontractSigning: undefined;
  EcontractOtp: {
    phone: string;
    otpType?: 'econtract-signing';
    context?: {
      signatureBase64: string;
      onSuccess?: (result: any) => void;
      onError?: (error: any) => void;
    };
  };

  // Payment screens
  TransferMoney: {
    recipient?: {
      name: string;
      accountNumber: string;
      bankName: string;
      bankCode: string;
      logoUrl?: string;
      isEzyWallet?: boolean;
      bankType?: 'USER' | 'STORE';
    };
    amount?: string;
    note?: string;
    transferMode?: 'bank' | 'wallet';
    autoSelectedRecipient?: boolean;
    orderIdValid?: boolean;
    orderId?: string;
  } | undefined;
  TransferConfirm: {
    amount: string;
    note: string;
    recipient: {
      name: string;
      accountNumber: string;
      bankName: string;
      bankCode?: string;
      logoUrl?: string;
      isEzyWallet?: boolean;
      bankType?: 'USER' | 'STORE';
    };
    paymentSource: {
      id: string;
      type: 'main_account' | 'espay_later';
      balance: number;
      accountNumber?: string;
    };
    orderId?: string;
  };
  TransferOtp: {
    transferData: {
      amount: string;
      recipient: {
        name: string;
        accountNumber: string;
        bankName: string;
        bankCode?: string;
        logoUrl?: string;
        isEzyWallet?: boolean;
        bankType?: 'USER' | 'STORE';
      };
      paymentSource: {
        id: string;
        type: 'main_account' | 'espay_later';
        balance: number;
        accountNumber?: string;
      };
      tempTransactionId: string;
      phoneNumber: string;
      expireInSeconds: number;
    };
  };
  TransferSuccess: {
    transferResult: {
      amount: string;
      recipient: {
        name: string;
        accountNumber: string;
        bankName: string;
        bankCode?: string;
        logoUrl?: string;
        isEzyWallet?: boolean;
        bankType?: 'USER' | 'STORE';
      };
      paymentSource: {
        id: string;
        type: 'main_account' | 'espay_later';
        balance: number;
        accountNumber?: string;
      };
      tempTransactionId: string;
      phoneNumber: string;
      expireInSeconds: number;
      transactionId: string;
      transferTime: string;
      status: 'completed' | 'pending' | 'failed';
    };
    targetScreen?: keyof TabParamList; // Optional screen to navigate to
  };
  SavedRecipients: undefined;
  QRReceiveMoney: undefined;
  Cart: { openVoiceModal?: boolean; draftOrder?: any } | undefined;
  DraftOrders: undefined;
  ProductMenu: undefined;
  ProductManagement: undefined;
  ProductDetail: { productId: string };
  EditProduct: { productId?: string };
  EditVariation: {
    productId: string;
    variationId?: string;
    variation?: any;
  };
  SupplierManagement: undefined;
  LocationManagement: undefined;
  CategoryManagement: {
    /** If set, navigating from a selector that needs the created category back */
    selectMode?: boolean;
    /** The screen to return to after creating/selecting a category */
    returnScreen?: keyof RootStackParamList;
  } | undefined;
  OrderManagement: undefined;
  OrderDetail: { orderId: string };
  CartPaymentConfirm: {
    cartItems: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      unit?: string;
      abbreviation?: string;
    }>;
    totalAmount: number;
    discount: number;
    paymentMethod: 'cash' | 'transfer';
    orderData?: any; // Order response with payment info
  };

  // Deposit/Withdraw screens
  DepositWithdraw: undefined;
  QRCodeDeposit: {
    amount: number;
    accountNumber: string;
    transferContent: string;
    selectedBank: any;
  };
  WithdrawConfirmation: {
    amount: number;
    accountNumber: string;
    transferContent: string;
    availableBalance: number;
    linkedBank?: {
      name: string;
      number: string;
      holderName: string;
      code: string;
      shortname: string;
    };
  };
  WithdrawOtp: {
    withdrawData: {
      amount: number;
      accountNumber: string;
      transferContent: string;
      availableBalance: number;
      linkedBank?: {
        name: string;
        number: string;
        holderName: string;
        code: string;
        shortname: string;
      };
    };
  };
  WithdrawSuccess: {
    withdrawResult: {
      amount: number;
      accountNumber: string;
      transferContent: string;
      fee: number;
      netAmount: number;
      transactionId: string;
      processedAt: string;
      linkedBank?: {
        name: string;
        number: string;
        holderName: string;
        code: string;
        shortname: string;
      };
    };
    targetScreen?: keyof TabParamList; // Optional screen to navigate to
  };
  WithdrawTransactionDetail: {
    transactionId: string;
  };
  WithdrawHistory: undefined;
  LinkBank: undefined;


  // Profile screens
  UserDetail: undefined;
  Notification: undefined;
  NotificationSettings: undefined;
  SpeakerNotificationSettings: undefined;
  LinkSpeaker: undefined;
  SecuritySettings: undefined;
  ChangePassword: undefined;

  // Edit contact (email/phone) flow
  EditContact: { mode: 'phone' | 'email' };
  EditContactOtp: { mode: 'phone' | 'email'; value: string };
  EditContactSuccess: { mode: 'phone' | 'email' };

  // Profile Reset Password Flow
  ProfileResetPassword: undefined;
  ProfileResetPasswordOtp: { phone: string };
  ProfileResetPasswordNewPassword: { phone: string; token: string };

  // Account screens
  AccountManagement: { activeTab?: 'account' | 'loan' } | undefined;
  PostpaidWallet: undefined;
  PostpaidInstallment: undefined;
  PostpaidSettings: undefined;
  PostpaidTransactionHistory: undefined;
  PostpaidBilling: undefined;
  PostpaidPaymentOptions: {
    billingPeriod: {
      id: string;
      periodName: string;
      billingDate: string;
      dueDate: string;
      amount: number;
      status: 'paid' | 'current' | 'overdue' | 'upcoming';
      paidDate?: string;
      lateFee?: number;
    };
    postpaidData: {
      userId: string;
      creditLimit: number;
      spentCredit: number;
      commissionPercent: number;
      status: string;
      dueDate: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  VoucherManagement: undefined;
  CreateVoucher: { voucherId?: string } | undefined;
  PostpaidPaymentConfirm: {
    amount: number;
    postpaidData: {
      userId: string;
      creditLimit: number;
      spentCredit: number;
      commissionPercent: number;
      status: string;
      dueDate: string;
      createdAt: string;
      updatedAt: string;
    };
    paymentSource: {
      id: string;
      type: 'main_account' | 'espay_later';
      balance: number;
      accountNumber?: string;
      status?: string;
      bankName?: string;
      isDefault?: boolean;
    };
  };
  PostpaidPaymentOtp: {
    paymentData: {
      amount: number;
      postpaidData: {
        userId: string;
        creditLimit: number;
        spentCredit: number;
        commissionPercent: number;
        status: string;
        dueDate: string;
        createdAt: string;
        updatedAt: string;
      };
      paymentSource: {
        id: string;
        type: 'main_account' | 'espay_later';
        balance: number;
        accountNumber?: string;
        status?: string;
        bankName?: string;
        isDefault?: boolean;
      };
      tempRequestId: string;
      phoneNumber: string;
      expireInSeconds: number;
    };
  };
  PostpaidPaymentSuccess: {
    paymentResult: {
      amount: number;
      postpaidData: {
        userId: string;
        creditLimit: number;
        spentCredit: number;
        commissionPercent: number;
        status: string;
        dueDate: string;
        createdAt: string;
        updatedAt: string;
      };
      paymentSource: {
        id: string;
        type: 'main_account' | 'espay_later';
        balance: number;
        accountNumber?: string;
        status?: string;
        bankName?: string;
        isDefault?: boolean;
      };
      tempRequestId: string;
      phoneNumber: string;
      expireInSeconds: number;
      paidAmount: number;
      status: string;
      spentCredit: number;
      paymentTime: string;
      paymentStatus: 'completed' | 'pending' | 'failed';
    };
    targetScreen?: keyof TabParamList; // Optional screen to navigate to
  };
  Policy: undefined;
  AppInformation: undefined;
  SupportCenter: undefined;
  StoreDetail: undefined;
  Contact: undefined;
  CommissionHistory: undefined;
  CommissionPayment: undefined;
  CommissionOtp: {
    tempRequestId: string;
  };
  CommissionPaymentSuccess: {
    tempRequestId: string;
  };

  // Inventory screens
  InventoryManagement: undefined;
  InventoryHistory: undefined;
  StockCheck: undefined;
  StockCheckDetail: { paperId: string };
  CreateImport: undefined;
  CreateExport: undefined;
  CreateStockCheck: undefined;
};

// Tab navigation types
export type TabParamList = {
  Home: undefined;
  History: undefined;
  QRScan: undefined;
  Report: undefined;
  Profile: undefined;
};
