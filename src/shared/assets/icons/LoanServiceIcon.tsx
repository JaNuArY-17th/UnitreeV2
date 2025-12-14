import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Loan service: document + currency + approval check mark in outline style.
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
	<!-- Document shape -->
	<path d="M7 3.8A1.8 1.8 0 018.8 2h4.9c.48 0 .94.19 1.28.53l3.49 3.48c.34.34.53.8.53 1.28V20.2A1.8 1.8 0 0117.2 22H8.8A1.8 1.8 0 017 20.2V3.8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
	<!-- Fold hint -->
	<path d="M14.5 2.75v2.1c0 .83.67 1.5 1.5 1.5h2.05" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
	<!-- Currency circle -->
	<circle cx="12" cy="13.5" r="3.25" stroke="currentColor" stroke-width="1.6"/>
	<!-- Currency symbol (stylized) -->
	<path d="M12 11.8v3.4M10.9 12.7h2.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
	<!-- Approval check -->
	<path d="M9.2 18.4l1.4 1.4 3.1-3.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function LoanServiceIcon({ width = 42, height = 42, color = '#246BFD' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
