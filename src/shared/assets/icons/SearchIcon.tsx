import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
  <circle cx="24" cy="24" r="22" fill="{color}" opacity="0.1"/>
  <circle cx="22" cy="22" r="8" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M28 28L34 34" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function SearchIcon({ width = 40, height = 40, color = '#5DBAFF' }: IconProps) {
  return <SvgXml xml={xml.replace(/\{color\}/g, color)} width={width} height={height} />;
}
