import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Share conversion: two layered certificates + bi-directional arrows
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
	<!-- Back certificate -->
	<rect x="5.5" y="5" width="12" height="15" rx="2" stroke="currentColor" stroke-width="1.6"/>
	<!-- Front offset certificate -->
	<rect x="7.5" y="3" width="12" height="15" rx="2" stroke="currentColor" stroke-width="1.6"/>
	<!-- Arrows indicating conversion -->
	<path d="M10 9.5h6M14.5 8l1.5 1.5-1.5 1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
	<path d="M17 14.5h-6M12.5 13l-1.5 1.5 1.5 1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function ShareConversionIcon({ width = 42, height = 42, color = '#246BFD' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
