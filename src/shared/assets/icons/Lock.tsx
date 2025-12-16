import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 14V18" stroke=${color} stroke-width="2.4" stroke-linecap="round"></path> <path d="M6 10V8C6 7.65929 6.0284 7.32521 6.08296 7M18 10V8C18 4.68629 15.3137 2 12 2C10.208 2 8.59942 2.78563 7.5 4.03126" stroke=${color} stroke-width="2.4" stroke-linecap="round"></path> <path d="M11 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15" stroke=${color} stroke-width="2.4" stroke-linecap="round"></path> </g></svg>`;

export default function Lock({ width = 22, height = 22, color = '#6B7280' }: IconProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} color={color} />;
}
