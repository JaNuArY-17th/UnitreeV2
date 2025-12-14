import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 256 256" fill=${color}><g fill=${color}><rect width="112" height="192" x="72" y="32" rx="24"/><path d="M208 80a8 8 0 0 0-8 8v80a8 8 0 0 0 16 0V88a8 8 0 0 0-8-8Zm32 16a8 8 0 0 0-8 8v48a8 8 0 0 0 16 0v-48a8 8 0 0 0-8-8ZM48 80a8 8 0 0 0-8 8v80a8 8 0 0 0 16 0V88a8 8 0 0 0-8-8ZM16 96a8 8 0 0 0-8 8v48a8 8 0 0 0 16 0v-48a8 8 0 0 0-8-8Z"/></g></svg>`;

export default function Vibration({ width = 22, height = 22, color = '#FFFFFF' }: IconProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} color={color} />;
}
