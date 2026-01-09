import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useKeyboardInsets = () => {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = (e: KeyboardEvent) => {
      setKeyboardHeight((e.endCoordinates?.height ?? 0) - insets.bottom);
    };
    const hide = () => setKeyboardHeight(0);

    const subShow = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', show);
    const subHide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', hide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [insets.bottom]);

  return { keyboardHeight };
};

export default useKeyboardInsets;