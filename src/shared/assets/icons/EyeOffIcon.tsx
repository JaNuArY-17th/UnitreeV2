import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Eye off icon for hiding balance
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Eye shape (partially visible) -->
  <path d="M9.9 4.24C10.5 4.07 11.2 4 12 4C19 4 22 12 22 12C22 12 21.3 13.8 19.8 15.5M14.1 14.1C13.5 14.7 12.8 15 12 15C10.3 15 9 13.7 9 12C9 11.2 9.3 10.5 9.9 9.9M9.9 9.9L14.1 14.1M9.9 9.9L2 2M14.1 14.1L22 22M2 12C2 12 2.7 10.2 4.2 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Strike through line -->
  <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

export default function EyeOffIcon({ width = 24, height = 24, color = '#9CA3AF' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
