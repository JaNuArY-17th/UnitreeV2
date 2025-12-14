import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Market insight: magnifying glass + candlestick chart bars
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
	<!-- Magnifying glass -->
	<circle cx="11" cy="11" r="5.5" stroke="currentColor" stroke-width="1.6"/>
	<path d="M14.9 14.9L18.5 18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
	<!-- Candlestick bars inside lens -->
	<path d="M9 8.8v4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
	<path d="M11 9.8v2.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
	<path d="M13 8.3v5.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
</svg>`;

export default function MarketInsightIcon({ width = 42, height = 42, color = '#246BFD' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
