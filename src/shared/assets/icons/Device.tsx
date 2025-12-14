import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/>
  <path d="M8 7H16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M8 11H16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M8 15H12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="12" cy="18" r="1" fill="currentColor"/>
</svg>`;

export default function Device({ width = 22, height = 22, color = '#6B7280' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
