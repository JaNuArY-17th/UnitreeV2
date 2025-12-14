import React from 'react';
import { theme } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  Time01Icon,
  ChartHistogramIcon,
  UserIcon,
  Ticket01Icon
} from '@hugeicons/core-free-icons';
import { getUserTypeColor } from '@/shared/themes/colors';

// Define routes locally for now
const ROUTES = {
  HOME: 'Home',
  HISTORY: 'History',
  REPORT: 'Report',
  PROFILE: 'Profile'
} as const;

type TabBarIconProps = {
  routeName: string;
  isSelected: boolean;
  accountType?: 'USER' | 'STORE';
};

export const TabBarIcon: React.FC<TabBarIconProps> = ({ routeName, isSelected, accountType }) => {
  const color = isSelected ? getUserTypeColor() : theme.colors.tab.inactive;
  const size = 24;
  const variant = isSelected ? 'solid' : 'stroke';

  switch (routeName) {
    case ROUTES.HOME:
      return <HugeiconsIcon icon={Home01Icon} size={size} color={color} variant={variant} />;
    case ROUTES.HISTORY:
      return <HugeiconsIcon icon={Time01Icon} size={size} color={color} variant={variant} />;
    case ROUTES.REPORT:
      // For USER accounts, show Ticket icon instead of Report icon
      return accountType === 'USER'
        ? <HugeiconsIcon icon={Ticket01Icon} size={size} color={color} variant={variant} />
        : <HugeiconsIcon icon={ChartHistogramIcon} size={size} color={color} variant={variant} />;
    case ROUTES.PROFILE:
      return <HugeiconsIcon icon={UserIcon} size={size} color={color} variant={variant} />;
    default:
      return null;
  }
};
