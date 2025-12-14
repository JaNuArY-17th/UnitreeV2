import { StyleSheet, Dimensions } from 'react-native';
import { colors, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const bottomTabStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNavigator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor: colors.light,
    // borderTopWidth: 1,
    // borderTopColor: colors.border,
  },
  shadow: {
  },
  circleBtnContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'transparent',
  },
  circleBtnText: {
    fontSize: 12,

    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -15,
  },
  selectedTabItem: {
    // backgroundColor: 'rgba(5, 74, 44, 0.05)',
  },
  tabTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  tabText: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    width: '40%',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    alignSelf: 'center',
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 4,
    // borderColor: colors.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  scanButtonTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
});

// Export thêm screen width để các component khác có thể sử dụng
export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH
};

// Export haptic feedback options
export const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
