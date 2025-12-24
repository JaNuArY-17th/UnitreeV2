import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = {
  width?: number;
  height?: number;
  color?: string;
};

// Hàm tạo XML với độ mờ riêng cho từng đường line
const xml = (color: string) => `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="miter">
  <g id="SVGRepo_iconCarrier">
    <line x1="0" y1="12" x2="0" y2="21" stroke-opacity="0.3"></line>
    
    <line x1="7" y1="7" x2="7" y2="21" stroke-opacity="0.65"></line>
    
    <line x1="14" y1="3" x2="14" y2="21" stroke-opacity="1"></line>
    
    <line x1="21" y1="10" x2="21" y2="21" stroke-opacity="0.65"></line>
    
    <line x1="28" y1="16" x2="28" y2="21" stroke-opacity="0.3"></line>
  </g>
</svg>`;

export default function ChartMini({ width = 18, height = 18, color = '#111827' }: IconProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} />;
}