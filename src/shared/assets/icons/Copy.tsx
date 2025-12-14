import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.6"/>
  <rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.6" opacity="0.6"/>
</svg>`;

export default function Copy({ width = 20, height = 20, color = '#111827' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
