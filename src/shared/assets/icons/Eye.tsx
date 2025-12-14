import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
</svg>`;

export default function Eye({ width = 16, height = 16, color = '#6B7280' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
