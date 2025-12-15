module.exports = {
  project: {
    ios: {},
    android: {
      sourceDir: './android',  // Changed from '../android' to './android'
      packageName: 'com.unitree',  // Add this line with your actual package name
    },
  },
  assets: ['./assets/fonts/'],
};