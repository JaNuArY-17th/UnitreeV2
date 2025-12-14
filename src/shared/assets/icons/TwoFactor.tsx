import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/>
  <path d="M7 8H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M7 16H13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="17" cy="16" r="2" stroke="currentColor" stroke-width="1.6"/>
  <path d="M16 15L17 16L18 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function TwoFactor({ width = 22, height = 22, color = '#6B7280' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
