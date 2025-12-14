import React from 'react';
import { TextProps } from 'react-native';
import Text from './Text';
import { FONT_WEIGHTS } from '../../themes/fonts';

interface CaptionProps extends TextProps {
  // Add any caption-specific props here
}

const Caption: React.FC<CaptionProps> = ({
  style,
  children,
  ...rest
}) => {
  return (
    <Text
      variant="caption"
      weight={FONT_WEIGHTS.REGULAR}
      style={style}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Caption;
