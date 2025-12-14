import * as React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Magnifying glass outline: 16x16 default, stroke #9CA3AF, strokeWidth ~1.5
export default function Search({ width = 16, height = 16, color = '#9CA3AF' }: IconProps) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="11" cy="11" r="6" stroke="${color}" stroke-width="1.5" />
  <path d="M20 20l-3.5-3.5" stroke="${color}" stroke-width="1.5" stroke-linecap="round" />
</svg>`;

  return <SvgXml xml={xml} width={width} height={height} />;
}
