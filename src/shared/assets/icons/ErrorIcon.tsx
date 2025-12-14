import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
  <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function ErrorIcon({ width = 20, height = 20, color = '#EF4444' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
