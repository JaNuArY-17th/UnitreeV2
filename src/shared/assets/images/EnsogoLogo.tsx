import React from 'react';
import { SvgXml } from 'react-native-svg';

interface EnsogoLogoProps {
  width?: number;
  height?: number;
  color?: string;
}

const logoXml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 882.77 197.64">
  <g id="Layer_1-2" data-name="Layer 1">
    <g>
      <g>
        <path fill=${color} d="M132.23,108.99c-.34,18.7-27.39,44.16-44.67,3.22-8.95-21.2-3.63-30.67-14.52-58.85,29.3,9.6,38.84,4.08,60.91,12.04,42.63,15.37,17.46,42.59-1.72,43.59Z"/>
        <path fill=${color} d="M26.38,108.99c.34,18.7,27.39,44.16,44.67,3.22,8.95-21.2,3.63-30.67,14.52-58.85-29.3,9.6-38.84,4.08-60.91,12.04-42.63,15.37-17.46,42.59,1.72,43.59Z"/>
      </g>
      <g>
        <path fill=${color} d="M132.23,7.85c-.34-18.7-27.39-44.16-44.67-3.22-8.95,21.2-3.63,30.67-14.52,58.85,29.3-9.6,38.84-4.08,60.91-12.04,42.63-15.37,17.46-42.59-1.72-43.59Z"/>
        <path fill=${color} d="M25.05,7.52c.34-18.7,27.39-44.16,44.67-3.22,8.95,21.2,3.63,30.67,14.52,58.85-29.3-9.6-38.84-4.08-60.91-12.04-42.63-15.37-17.46-42.59,1.72-43.59Z"/>
      </g>
      <path fill=${color} d="M78.73,73.32c.32,11.43-.77,20.83-1.9,27.53-2.18,12.91-4.32,24.68-13.2,34.98-3.09,3.59-6.18,6.04-8.34,7.57.21,1.97.76,4.96,2.36,8.23,2,4.1,4.69,6.69,6.33,8.04.7.34,1.93.79,3.44.64,3.67-.35,5.54-3.9,5.72-4.26,3.8-8.16,8.54-20.87,10.16-37.11,1.99-20-1.68-36.21-4.57-45.64Z"/>
    </g>
  <text style="cursor: move;" transform="matrix(1.68091 0 0 1.56024 -112.419 -20)" stroke=${color} font-weight="normal" xml:space="preserve" text-anchor="start" font-family="'Roboto Mono'" font-size="100" id="svg_18" y="91.90703" x="188.22633" stroke-width="10" fill=${color}>E</text>
  <text transform="matrix(1.68091 0 0 1.56024 -112.419 -20)" stroke=${color} font-weight="normal" xml:space="preserve" text-anchor="start" font-family="'Roboto Mono'" font-size="100" id="svg_19" y="92.54796" x="316.13324" stroke-width="10" fill=${color}>P</text>
  <text transform="matrix(1.68091 0 0 1.56024 -112.419 -20)" stroke=${color} font-weight="normal" xml:space="preserve" text-anchor="start" font-family="'Roboto Mono'" font-size="100" id="svg_20" y="92.54796" x="250.6925" stroke-width="10" fill=${color}>S</text>
  <text style="cursor: move;" transform="matrix(1.68091 0 0 1.56024 -112.419 -20)" stroke=${color} font-weight="normal" xml:space="preserve" text-anchor="start" font-family="'Roboto Mono'" font-size="100" id="svg_21" y="92.54796" x="382.1689" stroke-width="10" fill=${color}>A</text>
  <text transform="matrix(1.68091 0 0 1.56024 -112.419 -20)" stroke=${color} font-weight="normal" xml:space="preserve" text-anchor="start" font-family="'Roboto Mono'" font-size="100" id="svg_22" y="93.18889" x="451.17914" stroke-width="10" fill=${color}>Y</text>
  </g>
</svg>`;

export function EnsogoLogo({ width = 200, height = 60, color = '#033d24' }: EnsogoLogoProps) {
  return <SvgXml xml={logoXml(color)} width={width} height={height} color={color} />;
}
