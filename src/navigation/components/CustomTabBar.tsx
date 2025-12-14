import React from 'react';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path, Defs, Mask, Rect, Circle } from 'react-native-svg';
import { colors } from '@/shared/themes';
import { QRScanButton } from './QRScanButton';
import { CreateButton } from './CreateButton';
import { TabBarItem } from './TabBarItem';

// Custom tab bar with well/cutout design
export const CustomTabBar: React.FC<BottomTabBarProps & { accountType?: 'USER' | 'STORE' }> = ({
  state,
  descriptors,
  navigation,
  accountType
}) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Tab bar height and circle dimensions - responsive for tablets
  const isTablet = SCREEN_WIDTH > 768;
  const TAB_BAR_HEIGHT = isTablet ? 100 : 85;
  const CIRCLE_RADIUS = isTablet ? 40 : 38;
  const CIRCLE_DIAMETER = CIRCLE_RADIUS * 2;

  // Calculate the center position for the circle
  const centerX = SCREEN_WIDTH / 2;

  // Create SVG path for the well/cutout design
  const createTabBarPath = () => {
    const tabBarHeight = TAB_BAR_HEIGHT;
    const circleRadius = CIRCLE_RADIUS;
    const centerX = SCREEN_WIDTH / 2;

    // Just the outer path with curves - mask will handle the cutout
    const path = `
      M 0,0
      L ${centerX - circleRadius - 10},0
      Q ${centerX - circleRadius},0 ${centerX - circleRadius},10
      A ${circleRadius},${circleRadius} 0 0,0 ${centerX + circleRadius},10
      Q ${centerX + circleRadius},0 ${centerX + circleRadius + 10},0
      L ${SCREEN_WIDTH},0
      L ${SCREEN_WIDTH},${tabBarHeight}
      L 0,${tabBarHeight}
      Z
    `.trim();

    return path;
  };

  return (
    <View style={{ position: 'relative' }}>
      {/* SVG Background with cutout using mask */}
      <Svg
        width={SCREEN_WIDTH}
        height={TAB_BAR_HEIGHT}
        style={{ position: 'absolute', bottom: 0 }}
      >
        <Defs>
          <Mask id="cutout-mask">
            <Rect width={SCREEN_WIDTH} height={TAB_BAR_HEIGHT} fill="white" />
            <Circle
              cx={centerX}
              cy={10}
              r={CIRCLE_RADIUS}
              fill="black"
            />
          </Mask>
        </Defs>
        <Path
          d={createTabBarPath()}
          fill={colors.light}
          stroke={colors.border}
          strokeWidth={1}
          mask="url(#cutout-mask)"
        />
      </Svg>

      {/* Tab bar content */}
      <View
        style={{
          flexDirection: 'row',
          height: TAB_BAR_HEIGHT,
          backgroundColor: 'transparent',
          paddingVertical: 10,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isMiddleTab = index === 2; // QR Scan tab

          if (isMiddleTab) {
            // Render empty space for middle tab (QR button will be positioned absolutely)
            return <View key={route.key} style={{ flex: 1 }} />;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
              }}
            >
              <TabBarItem
                routeName={route.name}
                selectedTab={state.routes[state.index].name}
                navigate={navigation.navigate}
                tabAnimation={undefined}
                accountType={accountType}
              />

            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Center Button - QR Scan for USER, Create for STORE */}
      <View
        style={{
          position: 'absolute',
          top: -CIRCLE_RADIUS + 10,
          left: centerX - CIRCLE_RADIUS,
          width: CIRCLE_DIAMETER,
          height: CIRCLE_DIAMETER,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {accountType === 'STORE' ? (
          <CreateButton onPress={() => {
            // Navigate to Cart screen for store
            const parentNavigation = navigation.getParent();
            if (parentNavigation) {
              parentNavigation.navigate('Cart');
            }
          }} />
        ) : (
          <QRScanButton onPress={() => {
            // Navigate to QRPayment screen
            const parentNavigation = navigation.getParent();
            if (parentNavigation) {
              parentNavigation.navigate('QRPayment');
            }
          }} />
        )}
      </View>
    </View>
  );
};
