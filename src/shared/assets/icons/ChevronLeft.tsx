import React from 'react';
import { SvgXml } from 'react-native-svg';

interface ChevronLeftProps {
  width?: number;
  height?: number;
  color?: string;
}

const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64px" height="64px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 6L9 12L15 18" stroke=${color} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;

export function ChevronLeft({ width = 24, height = 24, color = '#111827' }: ChevronLeftProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} color={color} />;
}

export default ChevronLeft;
