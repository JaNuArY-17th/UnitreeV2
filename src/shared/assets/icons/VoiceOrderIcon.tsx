import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface VoiceOrderIconProps {
  size?: number;
  color?: string;
}

const VoiceOrderIcon: React.FC<VoiceOrderIconProps> = ({
  size = 48,
  color = '#F57C00',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Microphone capsule */}
      <Rect
        x="13"
        y="5"
        width="6"
        height="10"
        rx="3"
        fill={color}
      />

      {/* Microphone grille lines */}
      <Path
        d="M14 8H18M14 10H18M14 12H18"
        stroke="#FFF"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Microphone stand */}
      <Path
        d="M16 15V21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Microphone arc holder */}
      <Path
        d="M11 12C11 12 11 15 11 16C11 18.2091 13.2909 20 16 20C18.7091 20 21 18.2091 21 16C21 15 21 12 21 12"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        fill="none"
      />

      {/* Base line */}
      <Path
        d="M12 21H20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Sound wave circles - simple flat design */}
      <Circle cx="7" cy="13" r="1" fill={color} opacity="0.3" />
      <Circle cx="9" cy="10" r="0.75" fill={color} opacity="0.5" />
      <Circle cx="25" cy="13" r="1" fill={color} opacity="0.3" />
      <Circle cx="23" cy="10" r="0.75" fill={color} opacity="0.5" />
    </Svg>
  );
};

export default VoiceOrderIcon;
