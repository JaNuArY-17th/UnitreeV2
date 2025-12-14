import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconProps = {
  width?: number;
  height?: number;
  color?: string;
};

// Converted from arrow-up.svg; replaced fill with currentColor for opacity support
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg fill="currentColor" width="256px" height="256px" viewBox="-3.2 -3.2 38.40 38.40" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="3.2"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width="6.4"> <path d="M0.256 23.481c0 0.269 0.106 0.544 0.313 0.75 0.412 0.413 1.087 0.413 1.5 0l14.119-14.119 13.913 13.912c0.413 0.413 1.087 0.413 1.5 0s0.413-1.087 0-1.5l-14.663-14.669c-0.413-0.412-1.088-0.412-1.5 0l-14.869 14.869c-0.213 0.212-0.313 0.481-0.313 0.756z"></path> </g><g id="SVGRepo_iconCarrier"> <path d="M0.256 23.481c0 0.269 0.106 0.544 0.313 0.75 0.412 0.413 1.087 0.413 1.5 0l14.119-14.119 13.913 13.912c0.413 0.413 1.087 0.413 1.5 0s0.413-1.087 0-1.5l-14.663-14.669c-0.413-0.412-1.088-0.412-1.5 0l-14.869 14.869c-0.213 0.212-0.313 0.481-0.313 0.756z"></path> </g></svg>`;

export default function ArrowUp({ width = 12, height = 12, color = '#111827' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
