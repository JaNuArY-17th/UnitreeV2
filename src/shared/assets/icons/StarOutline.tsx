import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = {
  width?: number;
  height?: number;
  color?: string;
};

// Converted from StarOutline.svg; replaced stroke colors with currentColor
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function StarOutline({ width = 20, height = 20, color = '#111827' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
