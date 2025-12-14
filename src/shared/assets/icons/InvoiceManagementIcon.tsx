import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface InvoiceManagementIconProps {
  size?: number;
  color?: string;
}

const InvoiceManagementIcon: React.FC<InvoiceManagementIconProps> = ({
  size = 48,
  color = '#8E24AA',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Invoice paper - flat 2D style */}
      <Rect
        x="16"
        y="10"
        width="32"
        height="44"
        rx="2"
        fill={color}
      />
      
      {/* Paper fold corner */}
      <Path
        d="M42 10L48 16V10H42Z"
        fill={color}
        opacity="0.6"
      />
      
      {/* Invoice header lines */}
      <Rect x="20" y="16" width="18" height="2" rx="1" fill="#FFF" opacity="0.8" />
      <Rect x="20" y="20" width="14" height="1.5" rx="0.75" fill="#FFF" opacity="0.6" />
      
      {/* Invoice content lines */}
      <Rect x="20" y="26" width="24" height="1.5" rx="0.75" fill="#FFF" opacity="0.5" />
      <Rect x="20" y="30" width="20" height="1.5" rx="0.75" fill="#FFF" opacity="0.5" />
      <Rect x="20" y="34" width="22" height="1.5" rx="0.75" fill="#FFF" opacity="0.5" />
      <Rect x="20" y="38" width="18" height="1.5" rx="0.75" fill="#FFF" opacity="0.5" />
      
      {/* Total amount box */}
      <Rect
        x="20"
        y="44"
        width="24"
        height="6"
        rx="2"
        fill="#FFF"
        opacity="0.3"
      />
      
      {/* List checkmarks - flat style */}
      <Circle cx="20" cy="27" r="1" fill="#FFF" opacity="0.7" />
      <Circle cx="20" cy="31" r="1" fill="#FFF" opacity="0.7" />
      <Circle cx="20" cy="35" r="1" fill="#FFF" opacity="0.7" />
      
      {/* Decorative corner dots */}
      <Circle cx="12" cy="14" r="1.5" fill={color} opacity="0.4" />
      <Circle cx="52" cy="14" r="1.5" fill={color} opacity="0.4" />
      <Circle cx="52" cy="48" r="2" fill={color} opacity="0.3" />
    </Svg>
  );
};

export default InvoiceManagementIcon;
