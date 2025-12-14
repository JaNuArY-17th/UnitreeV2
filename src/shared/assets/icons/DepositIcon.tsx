import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Deposit icon - money going into a slot/container
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Container/Slot -->
  <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
  
  <!-- Money/Bill going in -->
  <rect x="8" y="4" width="8" height="6" rx="1" fill="currentColor" fill-opacity="0.2"/>
  <rect x="8" y="4" width="8" height="6" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/>
  
  <!-- Dollar sign on the bill -->
  <path d="M12 6.5V7.5M12 7.5C11.5 7.5 11 7.8 11 8.2C11 8.6 11.5 8.9 12 8.9C12.5 8.9 13 9.2 13 9.6C13 10 12.5 10.3 12 10.3M12 7.5V8.9M12 8.9V10.3M12 10.3V11.3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
  
  <!-- Arrow pointing down -->
  <path d="M12 10L12 14M12 14L10 12M12 14L14 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Slot opening -->
  <rect x="10" y="7.5" width="4" height="1" fill="currentColor"/>
</svg>`;

export default function DepositIcon({ width = 24, height = 24, color = '#9CA3AF' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
