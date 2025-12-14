import { StatusBar, StatusBarStyle, Platform } from 'react-native';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * A utility hook to manage StatusBar configuration with useFocusEffect
 *
 * This hook helps maintain consistent status bar appearance across the app.
 * It automatically handles the status bar configuration when a screen comes into focus
 * and does not interfere with other screens when this one is unfocused.
 *
 * Usage examples:
 *
 * 1. Basic usage with primary color:
 *    ```
 *    useStatusBarEffect(theme.colors.primary.main, 'light-content', false);
 *    ```
 *
 * 2. Transparent status bar (e.g. for screens with background images):
 *    ```
 *    useStatusBarEffect('transparent', 'light-content', true);
 *    ```
 *
 * 3. Dynamic status bar based on state:
 *    ```
 *    const [isDarkMode, setIsDarkMode] = useState(false);
 *    useStatusBarEffect(
 *      isDarkMode ? theme.colors.dark : theme.colors.light,
 *      isDarkMode ? 'light-content' : 'dark-content',
 *      false
 *    );
 *    ```
 *
 * @param backgroundColor - The background color for the StatusBar
 * @param barStyle - The style of the StatusBar content ('light-content' | 'dark-content')
 * @param translucent - Whether the StatusBar is translucent
 */
export const useStatusBarEffect = (
  backgroundColor: string,
  barStyle: StatusBarStyle = 'light-content',
  translucent: boolean = true
) => {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(barStyle);
      if (Platform.OS === 'android') {
        // StatusBar.setBackgroundColor(backgroundColor);
        StatusBar.setTranslucent(translucent);
      }

      return () => {
        // This will run when the screen is unfocused
        // We don't reset here as the next screen will set its own status bar
      };
    }, [backgroundColor, barStyle, translucent])
  );
};
