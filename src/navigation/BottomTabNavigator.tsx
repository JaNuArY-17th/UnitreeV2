import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from './types';

// Screens
import { ProfileScreen } from '@/features/profile/screens';
import { HomeScreen } from '@/features/home/screens';
import HistoryScreen from '@/features/transactions/screens/HistoryScreen';
import { ReportScreen } from '@/features/report';
import VoucherManagementScreen from '@/features/voucher/screens/VoucherManagementScreen';

// Hooks
import { useTranslation } from '@/shared/hooks/useTranslation';

// Import the custom tab bar
import { CustomTabBar } from './components/CustomTabBar';

// Import account type hook
import { useAccountType } from '@/features/authentication/hooks';

// Constants - Updated to match the new navigation structure
const ROUTES = {
  HOME: 'Home',
  HISTORY: 'History',
  QR_SCAN: 'QRScan',
  REPORT: 'Report',
  PROFILE: 'Profile'
} as const;

export function BottomTabNavigator() {
  // Call all hooks at the top in consistent order
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Main'>>();
  const { accountType } = useAccountType();

  // Get initial tab from route params, default to HOME
  const initialTab = route.params?.screen || ROUTES.HOME;
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Update active tab when route params change
  useEffect(() => {
    if (route.params?.screen) {
      console.log('📍 [BottomTabNavigator] Navigating to tab:', route.params.screen);
      setActiveTab(route.params.screen);
    }
  }, [route.params?.screen]);

  // Create mock props for CustomTabBar
  const mockTabBarProps = {
    state: {
      index: Object.values(ROUTES).indexOf(activeTab as any),
      routeNames: Object.values(ROUTES),
      routes: Object.values(ROUTES).map((routeName) => ({
        key: routeName,
        name: routeName,
        params: undefined,
      })),
      type: 'tab' as const,
      stale: false,
    },
    descriptors: Object.values(ROUTES).reduce((acc, routeName) => {
      acc[routeName] = {
        options: {
          tabBarLabel: t(`common:navigation.${routeName.toLowerCase()}`, routeName),
        },
      };
      return acc;
    }, {} as any),
    navigation: {
      navigate: (routeName: string, params?: any) => {
        // If navigating to QRScan tab, navigate to QRPayment screen instead
        if (routeName === 'QRScan') {
          const parentNavigation = navigation.getParent();
          if (parentNavigation) {
            parentNavigation.navigate('QRPayment');
          }
          return;
        }
        // If navigating to other tab routes, switch tabs
        if (Object.values(ROUTES).includes(routeName as any)) {
          setActiveTab(routeName as any);
        }
        // For non-tab routes, ignore since they should use parent navigation
      },
      emit: () => ({ defaultPrevented: false }),
      getParent: () => navigation, // Return the actual parent navigation
      goBack: () => navigation.goBack(),
      dispatch: navigation.dispatch,
      setOptions: () => { },
      isFocused: () => true,
    } as any,
  };

  // Function to render the active screen
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      case 'History':
        return <HistoryScreen />;
      case 'Report':
        // For USER accounts, show VoucherManagementScreen instead of ReportScreen
        return accountType === 'USER' ? <VoucherManagementScreen /> : <ReportScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {/* Active Screen Content */}
      <View style={{ flex: 1 }}>
        {renderActiveScreen()}
      </View>

      {/* Custom Tab Bar Overlay - Always visible */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
      }}>
        <CustomTabBar {...(mockTabBarProps as any)} insets={{ bottom: 0, top: 0, left: 0, right: 0 }} accountType={accountType} />
      </View>
    </View>
  );
}

export default BottomTabNavigator;
