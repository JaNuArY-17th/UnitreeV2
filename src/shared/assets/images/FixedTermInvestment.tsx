import React from 'react';
import { SvgXml } from 'react-native-svg';

interface FixedTermInvestmentProps {
  width?: number;
  height?: number;
  color?: string;
}

// Root cause of earlier error: missing separator between transform functions (e.g. rotate(0)matrix(...)).
// This version removes the unnecessary rotate(0) and the root-level transform (some parsers choke on it),
// keeping only a properly spaced matrix on the path element.
const fixedTermInvestmentXml = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <g fill="none" fill-rule="evenodd">
    <rect width="10" height="23" x="42.921" y="33" fill="#4796E7" rx="3" />
    <rect width="10" height="30" x="29" y="26" fill="#22BA8E" rx="3" />
    <rect width="10" height="37" x="15" y="19" fill="#FFAF40" rx="3" />
    <path stroke="#36ba64" stroke-linecap="round" stroke-width="2" d="M26.4868562,28.2544738 C26.4868562,28.2544738 45.9645832,22.8690471 56.558199,9.75941372" transform="matrix(-1 0 0 1 83.045 0)" />
    <polygon fill="#36ba64" points="24.132 1.632 30.132 12.632 18.132 12.632" transform="rotate(-45 24.132 7.132)" />
    <rect width="57" height="3" x="4" y="58" fill="#D8D8D8" />
  </g>
</svg>`;

export function FixedTermInvestment({ width = 64, height = 64, color = '#000000' }: FixedTermInvestmentProps) {
  // Replace currentColor in XML with provided color (SvgXml color prop doesn't override embedded fills)
  const xml = fixedTermInvestmentXml.replace('currentColor', color);
  return <SvgXml xml={xml} width={width} height={height} />;
}
