import React from 'react';
import { SvgXml } from 'react-native-svg';
import { colors } from '@/shared/themes/colors';

export type IconProps = { width?: number; height?: number; color?: string; focused?: boolean };

// Default (inactive) trending up icon - outline version
const xml = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill=${color}><g fill=${color}><rect width="5" height="18" x="16" y="3" rx="2"/><rect width="5" height="12" x="9.5" y="9" rx="2"/><rect width="5" height="5" x="3" y="16" rx="2"/></g></svg>`;

// Focused (active) trending up icon - filled version with brand color
const focusedXml = (brand: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill=${brand}><g fill=${brand}><rect width="5" height="18" x="16" y="3" rx="2"/><rect width="5" height="12" x="9.5" y="9" rx="2"/><rect width="5" height="5" x="3" y="16" rx="2"/></g></svg>`;

export default function TrendingUp({ width = 22, height = 22, color = '#6B7280', focused = false }: IconProps) {
  const iconXml = focused ? focusedXml(colors.primary) : xml(color);
  return <SvgXml xml={iconXml} width={width} height={height} color={color} />;
}
