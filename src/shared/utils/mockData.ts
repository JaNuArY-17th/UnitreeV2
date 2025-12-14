import type { KLineItem } from './technicalIndicators';
import type { ChartTimeframe } from '@/shared/types/timeframe';
import { getTimeframeInterval } from '@/shared/types/timeframe';

/**
 * Generates mock K-line data for testing and development
 * @param count - Number of data points to generate (default: 200)
 * @param basePrice - Starting price (default: 50,000)
 * @param volatility - Price volatility factor (default: 0.02)
 * @param intervalMinutes - Time interval between data points in minutes (default: 15)
 * @returns Array of mock K-line data
 */
export const generateMockKLineData = (
  count = 200,
  basePrice = 50_000,
  volatility = 0.02,
  intervalMinutes = 15
): KLineItem[] => {
  const data: KLineItem[] = [];
  let lastClose = basePrice;
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * intervalMinutes * 60 * 1000;
    const open = lastClose;

    // Generate random price change
    const change = (Math.random() - 0.5) * open * volatility;
    const close = Math.max(open + change, open * 0.95); // Prevent extreme drops

    // Calculate high and low based on open and close
    const maxPrice = Math.max(open, close);
    const minPrice = Math.min(open, close);
    const high = maxPrice + Math.random() * open * 0.01;
    const low = minPrice - Math.random() * open * 0.01;

    // Generate random volume
    const volume = (0.5 + Math.random()) * 1_000_000;

    data.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(2)),
    });

    lastClose = close;
  }

  return data;
};

/**
 * Generates mock stock price data with trend
 * @param count - Number of data points
 * @param basePrice - Starting price
 * @param trend - Trend direction: 'up', 'down', or 'sideways'
 * @param volatility - Price volatility
 * @returns Array of mock K-line data with trend
 */
export const generateMockDataWithTrend = (
  count = 200,
  basePrice = 50_000,
  trend: 'up' | 'down' | 'sideways' = 'sideways',
  volatility = 0.02
): KLineItem[] => {
  const data: KLineItem[] = [];
  let lastClose = basePrice;
  const now = Date.now();

  // Trend factors
  const trendFactors = {
    up: 0.001,
    down: -0.001,
    sideways: 0,
  };

  const trendFactor = trendFactors[trend];

  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * 15 * 60 * 1000;
    const open = lastClose;

    // Apply trend and random change
    const trendChange = open * trendFactor;
    const randomChange = (Math.random() - 0.5) * open * volatility;
    const close = Math.max(open + trendChange + randomChange, open * 0.95);

    const maxPrice = Math.max(open, close);
    const minPrice = Math.min(open, close);
    const high = maxPrice + Math.random() * open * 0.01;
    const low = minPrice - Math.random() * open * 0.01;
    const volume = (0.5 + Math.random()) * 1_000_000;

    data.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(2)),
    });

    lastClose = close;
  }

  return data;
};

/**
 * Generates mock data for a specific timeframe
 * @param timeframe - Chart timeframe
 * @param count - Number of data points
 * @param basePrice - Starting price
 * @param volatility - Price volatility
 * @returns Array of mock K-line data for the timeframe
 */
export const generateMockDataForTimeframe = (
  timeframe: ChartTimeframe,
  count = 200,
  basePrice = 50_000,
  volatility = 0.02
): KLineItem[] => {
  const intervalMinutes = getTimeframeInterval(timeframe);
  return generateMockKLineData(count, basePrice, volatility, intervalMinutes);
};

/**
 * Default mock data generator (maintains backward compatibility)
 */
export const generateMockData = (): KLineItem[] => {
  return generateMockKLineData();
};
