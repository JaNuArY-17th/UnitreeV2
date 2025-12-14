import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

// Transfer icon - money with arrows showing movement
const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 10L4 10L9.5 4" stroke=${color} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 14L20 14L14.5 20" stroke=${color} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;

export default function TransferIcon({ width = 24, height = 24, color = '#00492B' }: IconProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} color={color} />;
}
