import React from 'react';
import { SvgXml } from 'react-native-svg';
import { colors } from '@/shared/themes/colors';
import { getUserTypeColor } from '@/shared/themes/colors';

interface EnsogoFlowerLogoProps {
    width?: number;
    height?: number;
    color?: string;
    focused?: boolean;
}

// Default (inactive) logo - outline version
const logoXml = `<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 276.4 321.23">
  <g id="Layer_1-2" data-name="Layer 1">
    <g>
      <g>
        <path fill="currentColor" d="M232.37,228.55c-.6,33.74-48.13,79.7-78.51,5.81-15.73-38.26-6.38-55.36-25.52-106.21,51.5,17.32,68.25,7.37,107.05,21.73,74.92,27.73,30.68,76.86-3.02,78.67Z"/>
        <path fill="currentColor" d="M46.36,228.55c.6,33.74,48.13,79.7,78.51,5.81,15.73-38.26,6.38-55.36,25.52-106.21-51.5,17.32-68.25,7.37-107.05,21.73-74.92,27.73-30.68,76.86,3.02,78.67Z"/>
      </g>
      <g>
        <path fill="currentColor" d="M232.37,46c-.6-33.74-48.13-79.7-78.51-5.81-15.73,38.26-6.38,55.36-25.52,106.21,51.5-17.32,68.25-7.37,107.05-21.73,74.92-27.73,30.68-76.86-3.02-78.67Z"/>
        <path fill="currentColor" d="M44.03,45.41c.6-33.74,48.13-79.7,78.51-5.81,15.73,38.26,6.38,55.36,25.52,106.21-51.5-17.32-68.25-7.37-107.05-21.73-74.92-27.73-30.68-76.86,3.02-78.67Z"/>
      </g>
    </g>
    <path fill="currentColor" d="M138.37,164.16c.56,20.62-1.35,37.6-3.34,49.69-3.83,23.29-7.59,44.54-23.2,63.14-5.43,6.48-10.85,10.9-14.65,13.66.37,3.56,1.34,8.96,4.14,14.86,3.52,7.41,8.25,12.07,11.12,14.51,1.24.61,3.4,1.42,6.04,1.16,6.44-.63,9.74-7.04,10.06-7.68,6.68-14.73,15.01-37.67,17.85-66.97,3.5-36.1-2.95-65.35-8.02-82.36Z"/>
  </g>
</svg>`;

// Focused (active) logo - filled version with brand color
const focusedLogoXml = (brand: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 276.4 321.23">
  <g id="Layer_1-2" data-name="Layer 1">
    <g>
      <g>
        <path fill="${brand}" d="M232.37,228.55c-.6,33.74-48.13,79.7-78.51,5.81-15.73-38.26-6.38-55.36-25.52-106.21,51.5,17.32,68.25,7.37,107.05,21.73,74.92,27.73,30.68,76.86-3.02,78.67Z"/>
        <path fill="${brand}" d="M46.36,228.55c.6,33.74,48.13,79.7,78.51,5.81,15.73-38.26,6.38-55.36,25.52-106.21-51.5,17.32-68.25,7.37-107.05,21.73-74.92,27.73-30.68,76.86,3.02,78.67Z"/>
      </g>
      <g>
        <path fill="${brand}" d="M232.37,46c-.6-33.74-48.13-79.7-78.51-5.81-15.73,38.26-6.38,55.36-25.52,106.21,51.5-17.32,68.25-7.37,107.05-21.73,74.92-27.73,30.68-76.86-3.02-78.67Z"/>
        <path fill="${brand}" d="M44.03,45.41c.6-33.74,48.13-79.7,78.51-5.81,15.73,38.26,6.38,55.36,25.52,106.21-51.5-17.32-68.25-7.37-107.05-21.73-74.92-27.73-30.68-76.86,3.02-78.67Z"/>
      </g>
    </g>
    <path fill="${brand}" d="M138.37,164.16c.56,20.62-1.35,37.6-3.34,49.69-3.83,23.29-7.59,44.54-23.2,63.14-5.43,6.48-10.85,10.9-14.65,13.66.37,3.56,1.34,8.96,4.14,14.86,3.52,7.41,8.25,12.07,11.12,14.51,1.24.61,3.4,1.42,6.04,1.16,6.44-.63,9.74-7.04,10.06-7.68,6.68-14.73,15.01-37.67,17.85-66.97,3.5-36.1-2.95-65.35-8.02-82.36Z"/>
  </g>
</svg>`;

export function EnsogoFlowerLogo({ width = 10, height = 10, color = '#054a2c', focused = false }: EnsogoFlowerLogoProps) {
    const xml = focused ? focusedLogoXml(getUserTypeColor()) : logoXml;
    return <SvgXml xml={xml} width={width} height={height} color={color} />;
}