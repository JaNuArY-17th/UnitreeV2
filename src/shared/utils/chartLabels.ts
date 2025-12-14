/**
 * Chart labels and translations for K-line chart components
 */

export const CHART_LABELS = {
  // Basic OHLC data labels
  TIME: 'Time',
  OPEN: 'Open',
  HIGH: 'High',
  LOW: 'Low',
  CLOSE: 'Close',
  VOLUME: 'Volume',

  // Price change labels
  CHANGE: 'Change',
  CHANGE_PERCENT: 'Change %',

  // Technical indicator labels
  MA: 'MA',
  MACD: 'MACD',
  DIF: 'DIF',
  DEA: 'DEA',

  // Chart titles
  K_LINE_TITLE: 'K Line',
  LOADING_CHART: 'Loading chart...',

  // Time periods
  PERIOD_5: '5',
  PERIOD_10: '10',
  PERIOD_20: '20',

  // MACD parameters
  MACD_SHORT: '12',
  MACD_LONG: '26',
  MACD_SIGNAL: '9',

  // Timeframe labels
  TIMEFRAME_1M: '1m',
  TIMEFRAME_5M: '5m',
  TIMEFRAME_15M: '15m',
  TIMEFRAME_30M: '30m',
  TIMEFRAME_1H: '1h',
  TIMEFRAME_4H: '4h',
  TIMEFRAME_1D: '1d',
  TIMEFRAME_1W: '1w',
} as const;

/**
 * Creates standardized chart labels for selected item list
 */
export const createChartLabels = () => ({
  time: CHART_LABELS.TIME,
  open: CHART_LABELS.OPEN,
  high: CHART_LABELS.HIGH,
  low: CHART_LABELS.LOW,
  close: CHART_LABELS.CLOSE,
  change: CHART_LABELS.CHANGE,
  changePercent: CHART_LABELS.CHANGE_PERCENT,
  volume: CHART_LABELS.VOLUME,
  ma: CHART_LABELS.MA,
  dif: CHART_LABELS.DIF,
  dea: CHART_LABELS.DEA,
  macd: CHART_LABELS.MACD,
});

/**
 * Type for chart labels
 */
export type ChartLabels = ReturnType<typeof createChartLabels>;
