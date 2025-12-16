import React from 'react';
import { SvgXml } from 'react-native-svg';

interface ChevronLeftProps {
  width?: number;
  height?: number;
  color?: string;
}

const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13 19L7 12L8.5 10.25M13 5L11 7.33333" stroke=${color} stroke-width="1.9200000000000004" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M17 5L11 12L12.5 13.75M17 19L15 16.6667" stroke=${color} stroke-width="1.9200000000000004" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;

export function ChevronLeft({ width = 24, height = 24, color = '#111827' }: ChevronLeftProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} color={color} />;
}

export default ChevronLeft;
