import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2" fill="none"/>
  <path d="M12 6V12L16 14" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function Clock({ width = 22, height = 22, color = '#6B7280' }: IconProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} />;
}
