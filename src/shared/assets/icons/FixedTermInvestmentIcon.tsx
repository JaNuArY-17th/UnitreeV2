import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Outline style: clock + upward bar chart representing time-locked growth
// Uses only strokes with currentColor to match the rest of the outline icon set.
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Outer time circle -->
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Clock hands -->
  <path d="M12 8v4l2.5 1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Growth bars (fixed term investment) placed at bottom inside circle -->
  <path d="M7.5 16.5v-1.8M10.5 16.5v-2.8M13.5 16.5v-3.8M16.5 16.5v-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <!-- Subtle lock indicator (small arc at top) -->
  <path d="M9.5 6.9a2.5 2.5 0 015 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function FixedTermInvestmentIcon({ width = 42, height = 42, color = '#246BFD' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
