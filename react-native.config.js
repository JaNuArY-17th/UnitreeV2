module.exports = {
  project: {
    ios: {},
    android: {
      sourceDir: './android',  // Changed from '../android' to './android'
      packageName: 'com.ensogo_espay_app',  // Add this line with your actual package name
    },
  },
  assets: ['./assets/fonts/'],
};