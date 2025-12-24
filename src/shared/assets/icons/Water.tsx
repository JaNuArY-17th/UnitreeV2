import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 4L12 20M12 4L5 11M12 4L19 11" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function ArrowUp({ width = 24, height = 24, color = '#000000' }: IconProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} />;
}
