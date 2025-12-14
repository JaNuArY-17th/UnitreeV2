import React from 'react';
import { SvgXml } from 'react-native-svg';
import type { IconProps } from './Home';
import { colors } from '@/shared/themes/colors';


// Default (inactive) icon - keep existing
const defaultXml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.32 12C20.92 12 22 11 21.04 7.72C20.39 5.51 18.49 3.61 16.28 2.96C13 2 12 3.08 12 5.68V8.56C12 11 13 12 15 12H18.32Z" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19.9999 14.7C19.0699 19.33 14.6299 22.69 9.57993 21.87C5.78993 21.26 2.73993 18.21 2.11993 14.42C1.30993 9.39 4.64993 4.95 9.25993 4.01" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Focused (active) icon - matches provided SVG, using brand color
const focusedXml = (brand: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.2694 2.88037C14.8625 2.43754 15.7983 2.3403 17.41 2.80908C19.4167 3.40138 21.0984 5.08455 21.6903 7.09131V7.09229C22.1682 8.7016 22.0604 9.63045 21.6063 10.2114L21.5995 10.2202C21.3305 10.5801 20.9415 10.7974 20.4872 10.9243C20.0291 11.0522 19.535 11.0796 19.1005 11.0796H16.2303C15.2251 11.0796 14.5505 10.7969 14.118 10.314C13.6764 9.82062 13.41 9.03338 13.41 7.86963V5.38037C13.41 4.45885 13.5376 3.42728 14.2694 2.88037Z" fill="${brand}" stroke="${brand}"/>
<path d="M19.41 13.3601C19.15 13.0601 18.77 12.8902 18.38 12.8902H14.8C13.04 12.8902 11.61 11.4601 11.61 9.70015V6.12015C11.61 5.73015 11.44 5.35015 11.14 5.09015C10.85 4.83015 10.45 4.71015 10.07 4.76015C7.72002 5.06015 5.56002 6.35015 4.15002 8.29015C2.73002 10.2401 2.21002 12.6201 2.66002 15.0001C3.31002 18.4401 6.06002 21.1902 9.51002 21.8402C10.06 21.9502 10.61 22.0002 11.16 22.0002C12.97 22.0002 14.72 21.4401 16.21 20.3502C18.15 18.9402 19.44 16.7801 19.74 14.4302C19.79 14.0401 19.67 13.6501 19.41 13.3601Z" fill="${brand}"/>
</svg>`;

type PortfolioIconProps = IconProps & { focused?: boolean };

export default function PortfolioIcon({ width = 24, height = 24, color = '#111827', focused = false }: PortfolioIconProps) {
  const safeColor = color || '#111827';
  const xml = focused ? focusedXml(colors.brand) : defaultXml(safeColor);
  return <SvgXml xml={xml} width={width} height={height} />;
}
