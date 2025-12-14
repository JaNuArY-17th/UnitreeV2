import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = {
  width?: number;
  height?: number;
  color?: string;
};

// Converted from import.svg; replaced stroke colors with currentColor
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.32007 11.68L11.8801 14.24L14.4401 11.68" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.8799 4V14.17" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 12.18C20 16.6 17 20.18 12 20.18C7 20.18 4 16.6 4 12.18" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function ImportIcon({ width = 20, height = 20, color = '#111827' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
