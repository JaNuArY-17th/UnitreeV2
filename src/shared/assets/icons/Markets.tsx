import { SvgXml } from 'react-native-svg';
import type { IconProps } from './Home';
import { colors } from '@/shared/themes/colors';

// Default (inactive) state SVG - matches the provided paths and fixed stroke color
const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.5 22H15.5C20.5 22 22.5 20 22.5 15V9C22.5 4 20.5 2 15.5 2H9.5C4.5 2 2.5 4 2.5 9V15C2.5 20 4.5 22 9.5 22Z" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 18.5C17.1 18.5 18 17.6 18 16.5V7.5C18 6.4 17.1 5.5 16 5.5C14.9 5.5 14 6.4 14 7.5V16.5C14 17.6 14.89 18.5 16 18.5Z" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 18.5C10.1 18.5 11 17.6 11 16.5V13C11 11.9 10.1 11 9 11C7.9 11 7 11.9 7 13V16.5C7 17.6 7.89 18.5 9 18.5Z" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Focused (active) state SVG - single filled path using brand color
const focusedXml = (primary: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.69 2H8.31C4.67 2 2.5 4.17 2.5 7.81V16.18C2.5 19.83 4.67 22 8.31 22H16.68C20.32 22 22.49 19.83 22.49 16.19V7.81C22.5 4.17 20.33 2 16.69 2ZM10.41 16.19C10.41 16.83 9.89 17.35 9.24 17.35C8.6 17.35 8.08 16.83 8.08 16.19V12.93C8.08 12.29 8.6 11.77 9.24 11.77C9.89 11.77 10.41 12.29 10.41 12.93V16.19ZM16.92 16.19C16.92 16.83 16.4 17.35 15.76 17.35C15.11 17.35 14.59 16.83 14.59 16.19V7.81C14.59 7.17 15.11 6.65 15.76 6.65C16.4 6.65 16.92 7.17 16.92 7.81V16.19Z" fill="${primary}"/>
</svg>`;

type MarketsIconProps = IconProps & { focused?: boolean };

export default function MarketsIcon({ width = 24, height = 24, color = '#111827', focused = false }: MarketsIconProps) {
  const xml = focused ? focusedXml(colors.brand) : defaultXml;
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
