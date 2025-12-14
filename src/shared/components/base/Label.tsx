import React from 'react';
import { TextProps } from 'react-native';
import Text from './Text';
import { FONT_WEIGHTS } from '../../themes/fonts';

interface LabelProps extends TextProps {
  // Add any label-specific props here
}

const Label: React.FC<LabelProps> = ({
  style,
  children,
  ...rest
}) => {
  return (
    <Text
      variant="label"
      weight={FONT_WEIGHTS.REGULAR}
      style={style}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Label;
