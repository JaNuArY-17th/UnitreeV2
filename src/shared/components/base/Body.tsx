import React from 'react';
import { TextProps } from 'react-native';
import Text from './Text';
import { FONT_WEIGHTS } from '../../themes/fonts';

interface BodyProps extends TextProps {
  small?: boolean;
}

/**
 * Component cho nội dung văn bản thông thường
 */
const Body: React.FC<BodyProps> = ({
  small = false,
  style,
  children,
  ...rest
}) => {
  return (
    <Text
      variant={small ? 'bodySmall' : 'body'}
      weight={FONT_WEIGHTS.REGULAR}
      style={style}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Body;
