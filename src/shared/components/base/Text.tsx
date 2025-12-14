import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { getFontFamily, FONT_WEIGHTS, getPlatformFontExtras } from '../../themes/fonts';
import { typography, colors } from '../../themes';

interface TextProps extends RNTextProps {
  variant?: keyof typeof typography;
  weight?: typeof FONT_WEIGHTS[keyof typeof FONT_WEIGHTS];
  color?: string;
}

const Text: React.FC<TextProps> = ({
  children,
  style,
  variant = 'body',
  weight,
  color,
  ...rest
}) => {
  const textStyles: TextStyle[] = [
    styles.base,
    typography[variant],
  ];

  if (weight) {
    textStyles.push({ fontFamily: getFontFamily(weight), ...getPlatformFontExtras(weight) });
  }

  if (color) {
    textStyles.push({ color });
  }

  return (
    <RNText style={[...textStyles, style]} {...rest}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    color: colors.text.primary,
    fontFamily: getFontFamily(),
  },
});

export default Text;
