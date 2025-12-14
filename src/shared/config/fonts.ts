import { Text, TextInput } from 'react-native';
import { getFontFamily } from '@/shared/themes/fonts';

/**
 * Global font configuration for React Native
 * This ensures Poppins font is applied app-wide to all Text and TextInput components
 */

// Set default font family for all Text components
const defaultTextRender = Text.render;
Text.render = function render(props: any) {
  const style = Array.isArray(props.style) ? props.style : [props.style];

  // Check if fontFamily is already specified
  const hasFontFamily = style.some((s: any) => s && s.fontFamily);

  if (!hasFontFamily) {
    style.push({ fontFamily: getFontFamily() });
  }

  return defaultTextRender.call(this, { ...props, style });
};

// Set default font family for all TextInput components
const defaultTextInputRender = TextInput.render;
TextInput.render = function render(props: any) {
  const style = Array.isArray(props.style) ? props.style : [props.style];

  // Check if fontFamily is already specified
  const hasFontFamily = style.some((s: any) => s && s.fontFamily);

  if (!hasFontFamily) {
    style.push({ fontFamily: getFontFamily() });
  }

  return defaultTextInputRender.call(this, { ...props, style });
};

export const initializeFonts = () => {
  // This function can be called in App.tsx to ensure fonts are initialized
  console.log('Poppins font initialized globally');
};
