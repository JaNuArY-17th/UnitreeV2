import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1157" height="658" viewBox="0 0 1157 658" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M960.563 -474.007C960.563 -474.007 991.255 -222.199 914.486 -93.8701C827.187 52.0592 661.115 11.3371 543.564 134.212C444.47 237.794 481.96 386.313 352.344 447.537C288.014 477.923 172.643 477.487 172.643 477.487" stroke=${color} stroke-width="4.69333"/>
<path d="M783.941 -580.002C783.941 -580.002 855.67 -336.684 801.075 -197.467C738.992 -39.1566 568.481 -51.9827 472.763 88.5679C392.074 207.05 453.503 347.371 335.734 429.098C277.285 469.66 163.416 488.224 163.416 488.224" stroke=${color} stroke-width="4.69333"/>
<path d="M1151.51 -156.727C1151.51 -156.727 1045.8 73.8672 913.193 142.993C762.404 221.6 642.247 99.9424 477.757 143.066C339.095 179.419 293.26 325.578 150.776 309.862C80.0591 302.062 -18.0001 241.275 -18.0001 241.275" stroke=${color} stroke-width="4.69333"/>
</svg>

`;

export default function Curve1({ width = 200, height = 200, color = '#111827' }: IconProps) {
  return <SvgXml xml={xml(color)} width={width} height={height} />;
}
