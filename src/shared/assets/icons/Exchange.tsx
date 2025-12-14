import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Simple "exchange" icon with two arrows, using currentColor for stroke
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 7h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M11 4l4 3-4 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 17H9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M13 14l-4 3 4 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function Exchange({ width = 20, height = 20, color = '#FFFFFF' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}

