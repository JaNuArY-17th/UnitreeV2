import React from 'react';
import { SvgXml } from 'react-native-svg';

interface ChevronRightProps {
  width?: number;
  height?: number;
  color?: string;
}

// Chevron right shape (16x16) as requested
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5.75 3.5L10.25 8L5.75 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export function ChevronRight({ width = 16, height = 16, color = '#9CA3AF' }: ChevronRightProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}

export default ChevronRight;
