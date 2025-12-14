// This file maps the Poppins font variants to their numeric weights
// This helps React Native properly load the correct font file for each weight

module.exports = {
  // Map font weights to their corresponding Poppins font files
  fontMap: {
    Poppins: {
      100: 'Poppins-Thin',
      '100italic': 'Poppins-ThinItalic',
      200: 'Poppins-ExtraLight',
      '200italic': 'Poppins-ExtraLightItalic',
      300: 'Poppins-Light',
      '300italic': 'Poppins-LightItalic',
      400: 'Poppins-Regular',
      normal: 'Poppins-Regular',
      '400italic': 'Poppins-Italic',
      italic: 'Poppins-Italic',
      500: 'Poppins-Medium',
      '500italic': 'Poppins-MediumItalic',
      600: 'Poppins-SemiBold',
      '600italic': 'Poppins-SemiBoldItalic',
      700: 'Poppins-Bold',
      bold: 'Poppins-Bold',
      '700italic': 'Poppins-BoldItalic',
      800: 'Poppins-ExtraBold',
      '800italic': 'Poppins-ExtraBoldItalic',
      900: 'Poppins-Black',
      '900italic': 'Poppins-BlackItalic',
    },
  },
};
