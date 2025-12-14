import { useState } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors } from '@/shared/themes';

export const useHomeScroll = () => {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const threshold = headerHeight > 0 ? headerHeight - insets.top : Number.MAX_VALUE;

    if (scrollY > threshold && !isScrolled) {
      setIsScrolled(true);
    } else if (scrollY <= threshold && isScrolled) {
      setIsScrolled(false);
    }
  };

  useStatusBarEffect(isScrolled ? colors.light : 'transparent', isScrolled ? 'dark-content' : 'light-content', true);

  const onHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  return {
    isScrolled,
    handleScroll,
    onHeaderLayout,
    insets,
  };
};
