import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 8h-2.5a4 4 0 0 0 0 8H10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M14 8h2.5a4 4 0 1 1 0 8H14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M8 12h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
</svg>`;

export default function LinkIcon({ width = 22, height = 22, color = '#6B7280' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
