import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 2.0625C6.06418 2.0625 2.0625 6.06418 2.0625 11C2.0625 15.9358 6.06418 19.9375 11 19.9375C15.9358 19.9375 19.9375 15.9358 19.9375 11C19.9375 6.06418 15.9358 2.0625 11 2.0625Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10"/>
<path d="M11 2.0625C8.50479 2.0625 6.15869 6.06418 6.15869 11C6.15869 15.9358 8.50479 19.9375 11 19.9375C13.4952 19.9375 15.8413 15.9358 15.8413 11C15.8413 6.06418 13.4952 2.0625 11 2.0625Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10"/>
<path d="M5.0415 5.0415C6.68463 6.20811 8.75314 6.90377 11 6.90377C13.2468 6.90377 15.3153 6.20811 16.9585 5.0415M16.9585 16.9585C15.3153 15.7919 13.2468 15.0962 11 15.0962C8.75314 15.0962 6.68463 15.7919 5.0415 16.9585" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11 2.0625V19.9375M19.9375 11H2.0625" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10"/>
</svg>`;

export default function Language({ width = 22, height = 22, color = '#9CA3AF' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
