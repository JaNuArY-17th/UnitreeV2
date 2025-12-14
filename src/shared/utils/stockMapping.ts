// Stock symbol to name mapping utility
export const STOCK_NAMES: Record<string, string> = {
  // Listed stocks
  'VIC': 'Vingroup',
  'VNM': 'Vinamilk',
  'FPT': 'FPT Corp',
  'HPG': 'Hoa Phat',
  'VHM': 'Vinhomes',
  'SSI': 'Saigon Securities',
  'VCB': 'Vietcombank',
  'BID': 'BIDV',
  'CTG': 'VietinBank',
  'TCB': 'Techcombank',
  'MBB': 'MB Bank',
  'VRE': 'Vincom Retail',
  'GAS': 'PV Gas',
  'POW': 'PV Power',
  'STB': 'Sacombank',
  'VPB': 'VPBank',
  'SHB': 'SHB',
  'NVL': 'Novaland',
  'PDR': 'Phat Dat',
  'HCM': 'HSC',
  'VND': 'VNDirect',
  'MWG': 'Mobile World',
  'PNJ': 'Phu Nhuan Jewelry',
  'REE': 'REE Corp',
  'MSN': 'Masan Group',
  // Add more as needed
};

/**
 * Get stock name from symbol
 * @param symbol Stock symbol (e.g., 'VIC')
 * @returns Stock name (e.g., 'Vingroup') or the symbol if not found
 */
export const getStockName = (symbol: string): string => {
  return STOCK_NAMES[symbol] || symbol;
};

/**
 * Get formatted stock display (symbol - name)
 * @param symbol Stock symbol (e.g., 'VIC')
 * @returns Formatted string (e.g., 'VIC - Vingroup') or just symbol if name not found
 */
export const getStockDisplay = (symbol: string): string => {
  const name = STOCK_NAMES[symbol];
  return name ? `${symbol} - ${name}` : symbol;
};
