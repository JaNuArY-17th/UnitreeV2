import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Eye icon for showing balance
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Eye shape -->
  <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  
  <!-- Pupil -->
  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
  
  <!-- Inner pupil -->
  <circle cx="12" cy="12" r="1" fill="currentColor"/>
</svg>`;

export default function EyeIcon({ width = 24, height = 24, color = '#9CA3AF' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
