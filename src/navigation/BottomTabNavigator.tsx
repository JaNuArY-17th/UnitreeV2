import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { HomeScreen } from '@/features/home/screens';
import { ProfileScreen } from '@/features/profile/screens';
import { PlantScreen } from '@/features/plant/screens';
import { PointScreen } from '@/features/point/screens';
import { WifiScreen } from '@/features/wifi/screens';
import { colors, spacing, dimensions } from '@/shared/themes';
import { Home, Wifi, Leaf, StarDouble, Profile, Connect } from '@/shared/assets/icons';

const Tab = createBottomTabNavigator();

// Enhanced Animated Tab Item Component
const AnimatedTabItem = ({
  route,
  isFocused,
  onPress,
  IconComponent,
}: {
  route: any;
  isFocused: boolean;
  onPress: () => void;
  IconComponent: React.ComponentType<{ color: string; width?: number; height?: number }>;
}) => {
  const backgroundOpacity = useSharedValue(0);
  const backgroundScale = useSharedValue(0.8);

  React.useEffect(() => {
    if (isFocused) {
      backgroundOpacity.value = withTiming(1, { duration: 300 });
      backgroundScale.value = withTiming(1, { duration: 300 });
    } else {
      backgroundOpacity.value = withTiming(0, { duration: 300 });
      backgroundScale.value = withTiming(0.8, { duration: 300 });
    }
  }, [isFocused]);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
    transform: [{ scale: backgroundScale.value }],
  }));

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={1}
    >
      {/* Animated Background Circle */}
      <Animated.View
        style={[
          styles.tabItemBackground,
          backgroundStyle,
        ]}
      />

      {/* Icon */}
      <Animated.View style={{ zIndex: 1 }}>
        <IconComponent
          color={isFocused ? colors.primaryDark : colors.light}
          width={24}
          height={24}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  const tabConfig = [
    { name: 'Home', icon: Home },
    { name: 'Plant', icon: Leaf },
    { name: 'Point', icon: StarDouble },
    { name: 'Wifi', icon: Connect },
    { name: 'Profile', icon: Profile },
  ];

  return (
    <View
      style={[
        styles.floatingContainer,
        {
          paddingBottom: insets.bottom,
          paddingHorizontal: spacing.xl*2,
        },
      ]}
    >
      <Animated.View style={styles.floatingTabBar}>
        {state.routes.map((route: any, index: number) => {
          if (index >= tabConfig.length) return null;

          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

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

          return (
            <AnimatedTabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              IconComponent={tabConfig[index].icon}
            />
          );
        })}
      </Animated.View>
    </View>
  );
};

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="Plant"
        component={PlantScreen}
        options={{
          title: 'Plant',
        }}
      />
      <Tab.Screen
        name="Point"
        component={PointScreen}
        options={{
          title: 'Point',
        }}
      />
      <Tab.Screen
        name="Wifi"
        component={WifiScreen}
        options={{
          title: 'Wifi',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  floatingTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.success,
    borderRadius: dimensions.radius.round,
    position: 'relative',
  },
  tabBarContainer: {
    backgroundColor: colors.light,
    borderTopWidth: 1,
    borderTopColor: colors.text.light,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tabItemContainer: {
    flex: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    position: 'relative',
    zIndex: 1,
  },
  tabItemBackground: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.light,
  },
});
