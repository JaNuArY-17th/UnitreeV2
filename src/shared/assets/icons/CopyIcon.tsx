import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Copy icon for copying account number
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Original document -->
  <rect x="8" y="2" width="11" height="15" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
  
  <!-- Copy document -->
  <rect x="5" y="5" width="11" height="15" rx="2" fill="currentColor" fill-opacity="0.1"/>
  <rect x="5" y="5" width="11" height="15" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
  
  <!-- Document lines -->
  <line x1="8" y1="9" x2="13" y2="9" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
  <line x1="8" y1="12" x2="13" y2="12" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
  <line x1="8" y1="15" x2="11" y2="15" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
</svg>`;

export default function CopyIcon({ width = 24, height = 24, color = '#9CA3AF' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
