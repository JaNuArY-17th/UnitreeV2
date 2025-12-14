import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface ProductManagementIconProps {
  size?: number;
  color?: string;
}

const ProductManagementIcon: React.FC<ProductManagementIconProps> = ({
  size = 48,
  color = '#E64A19',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Box body - flat 2D style */}
      <Rect
        x="14"
        y="24"
        width="36"
        height="28"
        rx="3"
        fill={color}
      />
      
      {/* Box lid - top flap */}
      <Path
        d="M14 24L32 14L50 24H14Z"
        fill={color}
        opacity="0.8"
      />
      
      {/* Box center line */}
      <Path
        d="M32 14V52"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
      
      {/* Tape strips on box */}
      <Rect
        x="28"
        y="28"
        width="8"
        height="2"
        fill="#FFF"
        opacity="0.4"
      />
      
      {/* Package icon symbol */}
      <Path
        d="M20 34H24M40 34H44M20 40H24M40 40H44"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Decorative circles - flat style */}
      <Circle cx="12" cy="18" r="2" fill={color} opacity="0.4" />
      <Circle cx="52" cy="18" r="2" fill={color} opacity="0.4" />
      <Circle cx="56" cy="30" r="1.5" fill={color} opacity="0.3" />
    </Svg>
  );
};

export default ProductManagementIcon;
