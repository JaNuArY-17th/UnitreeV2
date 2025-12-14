import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width=20 height=20 viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" fill="${color}" />
  <path d="m9 12 2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function CheckCircle({ width = 20, height = 20, color = '#22c55e' }: IconProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} />;
}
