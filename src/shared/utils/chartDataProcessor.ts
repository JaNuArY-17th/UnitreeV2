import { processColor } from 'react-native';
import { formatTime, fixRound } from './chart';
import {
  KLineItem,
  calculateMAWithConfig,
  calculateVolumeMAWithConfig,
  calculateMACD,
  DEFAULT_MA_PERIODS,
  DEFAULT_VOLUME_MA_PERIODS,
  DEFAULT_MACD_PARAMS,
} from './technicalIndicators';
import { CHART_LABELS } from './chartLabels';

/**
 * Processes raw K-line data for chart display
 * @param data - Raw K-line data
 * @param theme - Theme configuration
 * @param symbol - Symbol configuration with price and volume precision
 * @returns Processed data ready for chart display
 */
export const processKLineDataForChart = (
  data: KLineItem[],
  theme: {
    increaseColor: string;
    decreaseColor: string;
  },
  symbol = { price: 2, volume: 0 }
): KLineItem[] => {
  const priceCount = symbol.price;
  const volumeCount = symbol.volume;

  // Base shape transformation
  let processedData: KLineItem[] = data.map((item) => ({
    ...item,
    id: item.time,
    vol: item.volume,
  }));

  // Apply technical indicators
  processedData = calculateMAWithConfig(processedData, DEFAULT_MA_PERIODS);
  processedData = calculateVolumeMAWithConfig(processedData, DEFAULT_VOLUME_MA_PERIODS);
  processedData = calculateMACD(
    processedData,
    DEFAULT_MACD_PARAMS.short,
    DEFAULT_MACD_PARAMS.long,
    DEFAULT_MACD_PARAMS.signal
  );

  // Format selected items for display
  processedData = processedData.map((item) => {
    const time = formatTime(item.id!, 'MM-DD HH:mm');
    const appendValue = item.close - item.open;
    const appendPercent = (appendValue / item.open) * 100;
    const isAppend = appendValue >= 0;
    const color = processColor(isAppend ? theme.increaseColor : theme.decreaseColor);

    // Add increment property for native code
    item.increment = isAppend;

    const selectedItemList: Array<{ title: string; detail: string; color?: any }> = [
      { title: CHART_LABELS.TIME, detail: `${time}` },
      { title: CHART_LABELS.OPEN, detail: fixRound(item.open, priceCount) },
      { title: CHART_LABELS.HIGH, detail: fixRound(item.high, priceCount) },
      { title: CHART_LABELS.LOW, detail: fixRound(item.low, priceCount) },
      { title: CHART_LABELS.CLOSE, detail: fixRound(item.close, priceCount) },
      { title: CHART_LABELS.CHANGE, detail: `${appendValue.toFixed(priceCount)}`, color },
      { title: CHART_LABELS.CHANGE_PERCENT, detail: `${appendPercent.toFixed(2)}%`, color },
      { title: CHART_LABELS.VOLUME, detail: fixRound(item.vol!, volumeCount) },
    ];

    // Add MA values
    item.maList?.forEach((ma) => {
      selectedItemList.push({ title: `${CHART_LABELS.MA}${ma.title}`, detail: fixRound(ma.value, priceCount) });
    });

    // Add MACD values
    if (item.macdDif !== undefined) {
      selectedItemList.push(
        { title: CHART_LABELS.DIF, detail: (item.macdDif ?? 0).toFixed(4) },
        { title: CHART_LABELS.DEA, detail: (item.macdDea ?? 0).toFixed(4) },
        { title: CHART_LABELS.MACD, detail: (item.macdValue ?? 0).toFixed(4) }
      );
    }

    return { ...item, dateString: `${time}`, selectedItemList };
  });

  return processedData;
};

/**
 * Creates a complete chart data package with processed data and configuration
 * @param rawData - Raw K-line data
 * @param theme - Theme configuration
 * @param symbol - Symbol configuration
 * @returns Complete chart data package
 */
export const createChartDataPackage = (
  rawData: KLineItem[],
  theme: {
    backgroundColor: string;
    textColor: string;
    titleColor: string;
    gridColor: string;
    increaseColor: string;
    decreaseColor: string;
    minuteLineColor: string;
    buttonColor: string;
  },
  symbol = { price: 2, volume: 0 }
) => {
  const processedData = processKLineDataForChart(rawData, theme, symbol);

  return {
    processedData,
    symbol,
    theme,
  };
};
