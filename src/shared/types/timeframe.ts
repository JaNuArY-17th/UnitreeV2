/**
 * Timeframe types and constants for chart components
 */

export type ChartTimeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';

export interface TimeframeConfig {
  value: ChartTimeframe;
  label: string;
  intervalMinutes: number;
  dataPoints: number; // Number of data points to show
}

/**
 * Available timeframes for charts
 */
export const CHART_TIMEFRAMES: TimeframeConfig[] = [
  {
    value: '1m',
    label: '1m',
    intervalMinutes: 1,
    dataPoints: 200,
  },
  {
    value: '5m',
    label: '5m',
    intervalMinutes: 5,
    dataPoints: 200,
  },
  {
    value: '15m',
    label: '15m',
    intervalMinutes: 15,
    dataPoints: 200,
  },
  {
    value: '30m',
    label: '30m',
    intervalMinutes: 30,
    dataPoints: 200,
  },
  {
    value: '1h',
    label: '1h',
    intervalMinutes: 60,
    dataPoints: 200,
  },
  {
    value: '4h',
    label: '4h',
    intervalMinutes: 240,
    dataPoints: 200,
  },
  {
    value: '1d',
    label: '1d',
    intervalMinutes: 1440,
    dataPoints: 200,
  },
  {
    value: '1w',
    label: '1w',
    intervalMinutes: 10080,
    dataPoints: 200,
  },
];

/**
 * Default timeframe
 */
export const DEFAULT_TIMEFRAME: ChartTimeframe = '15m';

/**
 * Get timeframe configuration by value
 */
export const getTimeframeConfig = (timeframe: ChartTimeframe): TimeframeConfig => {
  const config = CHART_TIMEFRAMES.find(tf => tf.value === timeframe);
  if (!config) {
    throw new Error(`Invalid timeframe: ${timeframe}`);
  }
  return config;
};

/**
 * Get interval in minutes for a timeframe
 */
export const getTimeframeInterval = (timeframe: ChartTimeframe): number => {
  return getTimeframeConfig(timeframe).intervalMinutes;
};
