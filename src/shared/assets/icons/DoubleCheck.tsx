import React from 'react';
import { SvgXml } from 'react-native-svg';
import type { IconProps } from './Check';

const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Interface / Check_All_Big"> <path id="Vector" d="M7 12L11.9497 16.9497L22.5572 6.34326M2.0498 12.0503L6.99955 17M17.606 6.39355L12.3027 11.6969" stroke=${color} stroke-width="1.6799999999999997" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>`;

export default function DoubleCheck({ width = 24, height = 24, color = '#00492B' }: IconProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} color={color} />;
}
