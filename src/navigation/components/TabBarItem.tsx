import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Text from '@/shared/components/base/Text';

// Define routes locally for now
const ROUTES = {
  HOME: 'Home',
  HISTORY: 'History',
  REPORT: 'Report',
  PROFILE: 'Profile'
} as const;

import { bottomTabStyles, hapticOptions } from '../styles/bottomTabStyles';
import { TabBarIcon } from './TabBarIcon';
import { getUserTypeColor } from '@/shared/themes/colors';

type TabBarItemProps = {
  routeName: string;
  selectedTab: string;
  tabAnimation?: Animated.Value;
  navigate: (routeName: string) => void;
  accountType?: 'USER' | 'STORE';
};

export const TabBarItem: React.FC<TabBarItemProps> = ({
  routeName,
  selectedTab,
  tabAnimation,
  navigate,
  accountType
}) => {
  const { t } = useTranslation();
  const isSelected = routeName === selectedTab;

  const handlePress = () => {
    // Add haptic feedback on tab press
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);

    // Animate the tab selection if animation value is provided
    if (tabAnimation) {
      Animated.sequence([
        Animated.timing(tabAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(tabAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }

    navigate(routeName);
  };

  // Get tab name based on route
  const getTabName = () => {
    switch (routeName) {
      case ROUTES.HOME:
        return t('common:navigation.home', 'Home');
      case ROUTES.HISTORY:
        return t('common:navigation.history', 'History');
      case ROUTES.REPORT:
        // For USER accounts, show "Recipients" instead of "Report"
        return accountType === 'USER'
          ? t('common:navigation.promo', 'Promo')
          : t('common:navigation.report', 'Report');
      case ROUTES.PROFILE:
        return t('common:navigation.profile', 'Profile');
      default:
        return "";
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        bottomTabStyles.tabbarItem,
        isSelected && bottomTabStyles.selectedTabItem
      ]}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityLabel={getTabName()}
      accessibilityState={{ selected: isSelected }}
    >
      <TabBarIcon routeName={routeName} isSelected={isSelected} accountType={accountType} />
      <View style={bottomTabStyles.tabTextContainer}>
        <Text
          variant="caption"
          style={[
            bottomTabStyles.tabText,
            isSelected && [bottomTabStyles.activeTabText, { color: getUserTypeColor() }]
          ]}
          numberOfLines={1}
        >
          {getTabName()}
        </Text>
      </View>
      {/* {isSelected && <View style={[bottomTabStyles.activeIndicator, { backgroundColor: getUserTypeColor() }]} />} */}
    </TouchableOpacity>
  );
};
