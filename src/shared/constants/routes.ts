export const ROUTES = {
  // Auth
  LOGIN: 'Login',
  SIGNUP: 'SignUp',
  OTP_VERIFICATION: 'OTPVerification',
  RESET_PASSWORD: 'ResetPassword',
  FORGET_PASSWORD: 'ForgetPassword',

  // Main Tabs
  HOME: 'Home',
  WATCHLIST: 'Watchlist',
  MARKETS: 'Markets',
  PORTFOLIO: 'Portfolio',
  PROFILE: 'Profile',

  // Other screens
  MAIN_TABS: 'MainTabs',
  NOTIFICATIONS: 'Notifications',
  NOTIFICATION_DETAIL: 'NotificationDetail',
  DEPOSIT: 'Deposit',
  QR_CODE_DEPOSIT: 'QRCodeDeposit',
  WITHDRAW: 'Withdraw',
  SETTINGS: 'Settings',
  EDIT_PROFILE: 'EditProfile',
  SECURITY: 'Security',
  TRANSACTION_HISTORY: 'TransactionHistory',
  LANGUAGE: 'Language',
  STOCK_DETAIL: 'StockDetail',
  TRADING: 'Trading',
  ECONTRACT_SIGNING: 'EcontractSigning',

  // eKYC
  EKYC: 'Ekyc',
  EKYC_CAPTURE: 'EkycCapture',
  USER_INFO: 'UserInfo',

  // Savings
  FIXED_TERM_SAVINGS: 'FixedTermSavings',
  CREATE_FIXED_TERM_SAVINGS: 'CreateFixedTermSavings',

  // Loans
  LOAN_LISTING: 'LoanListing',
  LOAN_DETAIL: 'LoanDetail',
  LOAN_HISTORY: 'LoanHistory',

  // Banks
  BANK_ACCOUNT: 'BankAccount',
  LINK_BANK: 'LinkBank',

  // Search
  SEARCH_SCREEN: 'SearchScreen',
  STOCK_SEARCH_SCREEN: 'StockSearchScreen',
} as const;

export type RouteNames = typeof ROUTES[keyof typeof ROUTES];
