import React from 'react';
import { TouchableWithoutFeedback, Keyboard, View, ViewStyle } from 'react-native';

export type KeyboardDismissWrapperProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
};

/**
 * A wrapper component that dismisses the keyboard when tapping outside of input fields.
 * Use this to wrap screen content that contains Input components to enable
 * keyboard dismissal when users tap anywhere outside the inputs.
 * 
 * @param children - The content to wrap
 * @param style - Optional style for the wrapper View
 * @param disabled - If true, disables keyboard dismissal (default: false)
 */
const KeyboardDismissWrapper: React.FC<KeyboardDismissWrapperProps> = ({
  children,
  style,
  disabled = false,
}) => {
  if (disabled) {
    return <View style={style}>{children}</View>;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default KeyboardDismissWrapper;
