// Types for K-line data
export type KLineItem = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // enriched properties
  id?: number;
  vol?: number;
  increment?: boolean;
  dateString?: string;
  selectedItemList?: Array<{ title: string; detail: string; color?: any }>;
  maList?: Array<{ value: number; title: string }>;
  maVolumeList?: Array<{ value: number; title: string }>;
  macdValue?: number;
  macdDea?: number;
  macdDif?: number;
};

export type PeriodConfig = {
  period: number;
  index: number;
};

/**
 * Calculates Moving Average (MA) for given periods
 * @param data - Array of K-line data
 * @param periodConfigs - Array of period configurations
 * @returns Data with MA values added
 */
export const calculateMAWithConfig = (
  data: KLineItem[],
  periodConfigs: PeriodConfig[]
): KLineItem[] => {
  return data.map((item, index) => {
    // Initialize with default values to ensure array has correct size
    const maList: Array<{ value: number; title: string }> = [
      { value: item.close, title: '5' },
      { value: item.close, title: '10' },
      { value: item.close, title: '20' },
    ];

    periodConfigs.forEach((config) => {
      if (index < config.period - 1) {
        maList[config.index] = { value: item.close, title: `${config.period}` };
      } else {
        let sum = 0;
        for (let i = index - config.period + 1; i <= index; i++) {
          sum += data[i].close;
        }
        maList[config.index] = { value: sum / config.period, title: `${config.period}` };
      }
    });
    return { ...item, maList };
  });
};

/**
 * Calculates Volume Moving Average for given periods
 * @param data - Array of K-line data
 * @param periodConfigs - Array of period configurations
 * @returns Data with volume MA values added
 */
export const calculateVolumeMAWithConfig = (
  data: KLineItem[],
  periodConfigs: PeriodConfig[]
): KLineItem[] => {
  return data.map((item, index) => {
    // Initialize with default values to ensure array has correct size
    const maVolumeList: Array<{ value: number; title: string }> = [
      { value: item.volume, title: '5' },
      { value: item.volume, title: '10' },
    ];

    periodConfigs.forEach((config) => {
      if (index < config.period - 1) {
        maVolumeList[config.index] = { value: item.volume, title: `${config.period}` };
      } else {
        let sum = 0;
        for (let i = index - config.period + 1; i <= index; i++) {
          sum += data[i].volume;
        }
        maVolumeList[config.index] = { value: sum / config.period, title: `${config.period}` };
      }
    });
    return { ...item, maVolumeList };
  });
};

/**
 * Calculates MACD (Moving Average Convergence Divergence) indicator
 * @param data - Array of K-line data
 * @param s - Short period (default: 12)
 * @param l - Long period (default: 26)
 * @param m - Signal period (default: 9)
 * @returns Data with MACD values added
 */
export const calculateMACD = (data: KLineItem[], s = 12, l = 26, m = 9): KLineItem[] => {
  let ema12 = data[0]?.close ?? 0;
  let ema26 = data[0]?.close ?? 0;
  let dea = 0;
  
  return data.map((item, index) => {
    if (index === 0) return { ...item, macdValue: 0, macdDea: 0, macdDif: 0 };
    
    ema12 = (2 * item.close + (s - 1) * ema12) / (s + 1);
    ema26 = (2 * item.close + (l - 1) * ema26) / (l + 1);
    const dif = ema12 - ema26;
    dea = (2 * dif + (m - 1) * dea) / (m + 1);
    const macd = 2 * (dif - dea);
    
    return { ...item, macdValue: macd, macdDea: dea, macdDif: dif };
  });
};

/**
 * Default MA period configurations
 */
export const DEFAULT_MA_PERIODS: PeriodConfig[] = [
  { period: 5, index: 0 },
  { period: 10, index: 1 },
  { period: 20, index: 2 },
];

/**
 * Default Volume MA period configurations
 */
export const DEFAULT_VOLUME_MA_PERIODS: PeriodConfig[] = [
  { period: 5, index: 0 },
  { period: 10, index: 1 },
];

/**
 * Default MACD parameters
 */
export const DEFAULT_MACD_PARAMS = {
  short: 12,
  long: 26,
  signal: 9,
};
