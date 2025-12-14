import { Platform, PixelRatio, processColor } from 'react-native';

/**
 * Formats a timestamp to a readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @param format - Format string (default: 'MM-DD HH:mm')
 * @returns Formatted date string
 */
export const formatTime = (timestamp: number, format = 'MM-DD HH:mm'): string => {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return format
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

/**
 * Safely rounds a number to specified precision, handling null/undefined values
 * @param value - Number to round
 * @param precision - Number of decimal places
 * @returns Formatted number string or '--' for invalid values
 */
export const fixRound = (value: number | null | undefined, precision: number): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  return Number(value).toFixed(precision);
};

/**
 * Creates chart configuration with theme colors and platform-specific settings
 * @param theme - Theme object with color definitions
 * @returns Chart configuration object
 */
export const createChartConfig = (theme: {
  backgroundColor: string;
  textColor: string;
  titleColor: string;
  gridColor: string;
  increaseColor: string;
  decreaseColor: string;
  minuteLineColor: string;
  buttonColor: string;
}) => {
  const pixelRatio = Platform.select({ android: PixelRatio.get(), ios: 1 }) ?? 1;
  
  return {
    colorList: {
      increaseColor: processColor(theme.increaseColor),
      decreaseColor: processColor(theme.decreaseColor),
    },
    targetColorList: [
      processColor('#F6DB95'),
      processColor('#61D1BF'),
      processColor('#CC91FF'),
      processColor('#FF3B3D'),
      processColor('#70D105'),
      processColor('#7121FF'),
    ],
    minuteLineColor: processColor(theme.minuteLineColor),
    minuteGradientColorList: [
      processColor('rgba(38, 111, 255, 0.15)'),
      processColor('rgba(12, 32, 48, 0)'),
      processColor('rgba(12, 32, 48, 0)'),
      processColor('rgba(12, 32, 48, 0)'),
    ],
    minuteGradientLocationList: [0, 0.3, 0.6, 1],
    backgroundColor: processColor(theme.backgroundColor),
    textColor: processColor(theme.textColor),
    gridColor: processColor(theme.gridColor),
    candleTextColor: processColor(theme.titleColor),
    panelBackgroundColor: processColor('rgba(255,255,255,0.95)'),
    panelBorderColor: processColor(theme.textColor),
    panelTextColor: processColor(theme.titleColor),
    selectedPointContainerColor: processColor('transparent'),
    selectedPointContentColor: processColor('#FFFFFF'),
    closePriceCenterBackgroundColor: processColor(theme.backgroundColor),
    closePriceCenterBorderColor: processColor(theme.textColor),
    closePriceCenterTriangleColor: processColor(theme.textColor),
    closePriceCenterSeparatorColor: processColor(theme.textColor),
    closePriceRightBackgroundColor: processColor(theme.backgroundColor),
    closePriceRightSeparatorColor: processColor(theme.buttonColor),
    closePriceRightLightLottieFloder: 'images',
    closePriceRightLightLottieScale: 0.4,
    panelGradientColorList: [
      processColor('rgba(255,255,255,0)'),
      processColor('rgba(140,159,173,0.1)'),
      processColor('rgba(140,159,173,0.25)'),
      processColor('rgba(140,159,173,0.1)'),
      processColor('rgba(255,255,255,0)'),
    ],
    panelGradientLocationList: [0, 0.25, 0.5, 0.75, 1],
    mainFlex: 0.6,
    volumeFlex: 0.15,
    minuteVolumeCandleColor: processColor('rgba(24, 130, 212, 0.5)'),
    minuteVolumeCandleWidth: 2 * pixelRatio,
    paddingTop: 20 * pixelRatio,
    paddingBottom: 20 * pixelRatio,
    paddingRight: 50 * pixelRatio,
    itemWidth: 8 * pixelRatio,
    candleWidth: 6 * pixelRatio,
    macdCandleWidth: 1 * pixelRatio,
    headerTextFontSize: 10 * pixelRatio,
    rightTextFontSize: 10 * pixelRatio,
    candleTextFontSize: 10 * pixelRatio,
    panelTextFontSize: 10 * pixelRatio,
    panelMinWidth: 130 * pixelRatio,
    fontFamily: Platform.select({
      ios: 'DINPro-Medium',
      android: '',
    }),
    closePriceRightLightLottieSource: '',
  };
};

/**
 * Creates chart option list configuration
 * @param processedData - Processed K-line data
 * @param theme - Theme object
 * @returns Complete option list for chart
 */
export const createChartOptionList = (
  processedData: any[],
  theme: {
    backgroundColor: string;
    textColor: string;
    titleColor: string;
    gridColor: string;
    increaseColor: string;
    decreaseColor: string;
    minuteLineColor: string;
    buttonColor: string;
  }
) => {
  const configList = createChartConfig(theme);

  return {
    modelArray: processedData,
    shouldScrollToEnd: true,
    targetList: {
      maList: [
        { title: '5', selected: true, index: 0 },
        { title: '10', selected: true, index: 1 },
        { title: '20', selected: true, index: 2 },
      ],
      maVolumeList: [
        { title: '5', selected: true, index: 0 },
        { title: '10', selected: true, index: 1 },
      ],
      macdS: '12', macdL: '26', macdM: '9',
    },
    price: 2,
    volume: 0,
    primary: 1, // MA
    second: 3, // MACD
    time: 1, // 1 minute
    configList,
    drawList: {
      shotBackgroundColor: processColor(theme.backgroundColor),
      drawType: 0,
      shouldReloadDrawItemIndex: -3,
      drawShouldContinue: true,
      drawColor: processColor('#FF760D'),
      drawLineHeight: 2,
      drawDashWidth: 4,
      drawDashSpace: 4,
      drawIsLock: false,
      shouldFixDraw: false,
      shouldClearDraw: false,
    },
  };
};
