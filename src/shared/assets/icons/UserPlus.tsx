import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = (color : string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="10" cy="6" r="4" stroke=${color} stroke-width="2.4"></circle> <path d="M21 10H19M19 10H17M19 10L19 8M19 10L19 12" stroke=${color} stroke-width="2.4" stroke-linecap="round"></path> <path d="M17.9975 18C18 17.8358 18 17.669 18 17.5C18 15.0147 14.4183 13 10 13C5.58172 13 2 15.0147 2 17.5C2 19.9853 2 22 10 22C12.231 22 13.8398 21.8433 15 21.5634" stroke=${color} stroke-width="2.4" stroke-linecap="round"></path> </g></svg>`;

export default function UserPlus({ width = 22, height = 22, color = '#6B7280' }: IconProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} color={color} />;
}
