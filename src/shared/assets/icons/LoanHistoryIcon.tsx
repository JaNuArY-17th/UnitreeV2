import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// List/history icon for loan history
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 7L4 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M15 12L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M9 17H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

export default function LoanHistoryIcon({ width = 24, height = 24, color = '#111827' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
