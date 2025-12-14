module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@shared': './src/shared',
          '@features': './src/features',
          '@assets': './src/assets',
          '@navigation': './src/navigation',
          '@locales': './src/locales',
          // Legacy paths for backward compatibility
          '@components': './src/components',
          '@config': './src/config',
          '@constants': './src/constants',
          '@contexts': './src/contexts',
          '@hooks': './src/hooks',
          '@screens': './src/screens',
          '@services': './src/services',
          '@store': './src/store',
          '@theme': './src/theme',
          '@themes': './src/themes',
          '@utils': './src/utils',
          '@types': './src/types',
        },
      },
    ],
    // Must be the last plugin
    'react-native-worklets/plugin',
  ],
};
