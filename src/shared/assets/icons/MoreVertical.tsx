import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="1" fill="currentColor"/>
  <circle cx="12" cy="5" r="1" fill="currentColor"/>
  <circle cx="12" cy="19" r="1" fill="currentColor"/>
</svg>`;

export default function MoreVertical({ width = 20, height = 20, color = '#6B7280' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
