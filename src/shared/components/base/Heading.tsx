import React from 'react';
import { TextProps } from 'react-native';
import Text from './Text';
import { FONT_WEIGHTS } from '../../themes/fonts';

type HeadingLevel = 1 | 2 | 3;

interface HeadingProps extends TextProps {
  level?: HeadingLevel;
}

const Heading: React.FC<HeadingProps> = ({
  level = 1,
  style,
  children,
  ...rest
}) => {
  const variant = `h${level}` as const;

  return (
    <Text
      variant={variant}
      weight={FONT_WEIGHTS.BOLD}
      style={style}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Heading;
