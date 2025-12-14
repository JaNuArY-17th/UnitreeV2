import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = { width?: number; height?: number; color?: string };

const getXml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64px" height="64px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="1.5"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19.88 16.44V19.89C19.88 20.16 19.66 20.38 19.39 20.38H13.97" stroke="#ffffff" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M13.97 4.62H19.39C19.66 4.62 19.88 4.84 19.88 5.11V10.53" stroke="#ffffff" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4.12 10.53V5.11C4.12 4.84 4.33999 4.62 4.60999 4.62H10.03" stroke="#ffffff" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4.12 16.44V19.89C4.12 20.16 4.33999 20.38 4.60999 20.38H10.03" stroke="#ffffff" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M2.48999 14.47H21.51" stroke="#ffffff" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;

export default function QRScanEmpty({ width = 24, height = 24, color = '#ffffff' }: IconProps) {
    const validColor = color || '#ffffff';
    return <SvgXml xml={getXml(validColor)} width={width} height={height} />;
}
