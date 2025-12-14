import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11.5245 3.46353C11.6741 3.00287 12.3259 3.00287 12.4755 3.46353L14.1329 8.56434C14.1998 8.78636 14.3918 8.9472 14.6238 8.9472H20.0207C20.5086 8.9472 20.7135 9.56967 20.3278 9.81434L15.9736 12.9668C15.7864 13.1077 15.7057 13.3508 15.7726 13.573L17.43 18.6738C17.5796 19.1345 17.0487 19.5137 16.663 19.269L12.3088 16.1166C12.1216 15.9757 11.8784 15.9757 11.6912 16.1166L7.33701 19.269C6.9513 19.5137 6.42037 19.1345 6.56999 18.6738L8.22743 13.573C8.29432 13.3508 8.21362 13.1077 8.02641 12.9668L3.67223 9.81434C3.28651 9.56967 3.49142 8.9472 3.97929 8.9472H9.37622C9.60819 8.9472 9.80019 8.78636 9.86708 8.56434L11.5245 3.46353Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function Star({ width = 24, height = 24, color = '#111827' }: IconProps) {
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
