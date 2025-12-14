import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface BankIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

const Bank: React.FC<BankIconProps> = ({
  width = 24,
  height = 24,
  color = '#000000',
  strokeWidth = 1.5,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      {/* Bank building base */}
      <Rect
        x="2"
        y="20"
        width="20"
        height="2"
        fill={color}
      />
      
      {/* Bank roof/triangle */}
      <Path
        d="M3 10L12 3L21 10V12H3V10Z"
        fill={color}
        opacity="0.2"
      />
      <Path
        d="M3 10L12 3L21 10V12H3V10Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Bank columns */}
      <Rect
        x="6"
        y="12"
        width="1.5"
        height="8"
        fill={color}
      />
      <Rect
        x="9.25"
        y="12"
        width="1.5"
        height="8"
        fill={color}
      />
      <Rect
        x="12.5"
        y="12"
        width="1.5"
        height="8"
        fill={color}
      />
      <Rect
        x="15.75"
        y="12"
        width="1.5"
        height="8"
        fill={color}
      />
      
      {/* Bank entrance/door */}
      <Rect
        x="10"
        y="16"
        width="4"
        height="4"
        fill={color}
        opacity="0.3"
      />
      <Rect
        x="10"
        y="16"
        width="4"
        height="4"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      
      {/* Door handle */}
      <circle
        cx="13"
        cy="18"
        r="0.5"
        fill={color}
      />
    </Svg>
  );
};

export default Bank;
