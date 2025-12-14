import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" stroke="currentColor" stroke-width="2" fill="none"/>
  <polyline points="17 18 23 18 23 12" stroke="currentColor" stroke-width="2" fill="none"/>
</svg>`;

export default function TrendingDown({ width = 16, height = 16, color = '#EF4444' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
