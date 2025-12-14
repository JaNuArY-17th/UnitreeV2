import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = {
  width?: number;
  height?: number;
  color?: string;
};

// Converted from provided SVG; replaced stroke colors with currentColor
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
  <path d="M12 17V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="1" cy="1" r="1" transform="matrix(1 0 0 -1 11 9)" fill="currentColor"/>
</svg>`;

export default function InfoOutline({ width = 24, height = 24, color = '#9CA3AF' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
