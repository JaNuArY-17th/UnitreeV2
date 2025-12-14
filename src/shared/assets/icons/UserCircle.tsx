import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.6"/>
  <path d="M6.5 18.2c1.8-2.2 4-3.2 5.5-3.2s3.7 1 5.5 3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
</svg>`;

export default function UserCircle({ width = 22, height = 22, color = '#6B7280' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
