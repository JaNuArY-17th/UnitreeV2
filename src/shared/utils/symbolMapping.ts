/**
 * Symbol mapping utilities for TradingView demo datafeed
 * The demo datafeed only supports a limited set of symbols
 */

// Known working symbols in TradingView demo datafeed
export const SUPPORTED_DEMO_SYMBOLS = [
  'AAPL',   // Apple Inc.
  'GOOGL',  // Alphabet Inc.
  'MSFT',   // Microsoft Corporation
  'AMZN',   // Amazon.com Inc.
  'TSLA',   // Tesla Inc.
  'META',   // Meta Platforms Inc.
  'NVDA',   // NVIDIA Corporation
  'NFLX',   // Netflix Inc.
  'AMD',    // Advanced Micro Devices
  'INTC',   // Intel Corporation
  'CRM',    // Salesforce Inc.
  'ADBE',   // Adobe Inc.
  'PYPL',   // PayPal Holdings Inc.
  'SPOT',   // Spotify Technology S.A.
  'SQ',     // Block Inc.
  'UBER',   // Uber Technologies Inc.
  'LYFT',   // Lyft Inc.
  'SNAP',   // Snap Inc.
  'TWTR',   // Twitter Inc. (if still available)
  'ZM',     // Zoom Video Communications
  'SHOP',   // Shopify Inc.
  'ROKU',   // Roku Inc.
  'PINS',   // Pinterest Inc.
  'DOCU',   // DocuSign Inc.
  'WORK',   // Slack Technologies (if still available)
];

// Default fallback symbol
export const DEFAULT_SYMBOL = 'AAPL';

/**
 * Maps custom/OTC symbols to TradingView demo datafeed compatible symbols
 * @param symbol - Original symbol from the app
 * @returns Compatible symbol for demo datafeed
 */
export const mapSymbolForDemo = (symbol: string): string => {
  if (!symbol) {
    console.warn('No symbol provided, using default:', DEFAULT_SYMBOL);
    return DEFAULT_SYMBOL;
  }

  const upperSymbol = symbol.toUpperCase().trim();

  // If it's already a supported symbol, return as-is
  if (SUPPORTED_DEMO_SYMBOLS.includes(upperSymbol)) {
    console.log('Symbol is supported by demo datafeed:', upperSymbol);
    return upperSymbol;
  }

  // Custom mapping for common OTC or other symbols
  const symbolMappings: Record<string, string> = {
    // Add your custom mappings here
    'BTC': 'TSLA',    // Map Bitcoin to Tesla for demo
    'ETH': 'NVDA',    // Map Ethereum to NVIDIA for demo
    'GOLD': 'AAPL',   // Map Gold to Apple for demo
    'OIL': 'AMZN',    // Map Oil to Amazon for demo

    // Add more mappings as needed for your OTC symbols
    // 'YOUR_OTC_SYMBOL': 'MAPPED_DEMO_SYMBOL',
  };

  // Check if we have a custom mapping
  if (symbolMappings[upperSymbol]) {
    console.log(`Mapping symbol ${upperSymbol} to ${symbolMappings[upperSymbol]} for demo datafeed`);
    return symbolMappings[upperSymbol];
  }

  // If no mapping found, use default and log warning
  console.log(`Symbol ${upperSymbol} not supported by demo datafeed, using default:`, DEFAULT_SYMBOL);
  return DEFAULT_SYMBOL;
};

/**
 * Validates if a symbol is supported by the demo datafeed
 * @param symbol - Symbol to validate
 * @returns True if supported, false otherwise
 */
export const isSymbolSupported = (symbol: string): boolean => {
  if (!symbol) return false;
  return SUPPORTED_DEMO_SYMBOLS.includes(symbol.toUpperCase().trim());
};

/**
 * Gets a random supported symbol for testing
 * @returns Random supported symbol
 */
export const getRandomSupportedSymbol = (): string => {
  const randomIndex = Math.floor(Math.random() * SUPPORTED_DEMO_SYMBOLS.length);
  return SUPPORTED_DEMO_SYMBOLS[randomIndex];
};

/**
 * Gets display information for a mapped symbol
 * @param originalSymbol - Original symbol from the app
 * @param mappedSymbol - Symbol mapped for demo datafeed
 * @returns Display information object
 */
export const getSymbolDisplayInfo = (originalSymbol: string, mappedSymbol: string) => {
  const isOriginal = originalSymbol.toUpperCase() === mappedSymbol.toUpperCase();

  return {
    displaySymbol: originalSymbol, // Show original symbol in UI
    chartSymbol: mappedSymbol,     // Use mapped symbol for chart
    isMapped: !isOriginal,
    mappingNote: isOriginal
      ? null
      : `Showing ${mappedSymbol} data for demo purposes`
  };
};
