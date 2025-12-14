import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors } from '@/shared/themes';
import { TabShape } from './TabShape';

const { width } = Dimensions.get('window');

export type TabType = 'account' | 'loan';

interface Tab {
  id: TabType;
  title: string;
  icon?: string;
}

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabs?: Tab[];
}

export const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
  tabs
}) => {
  const { t } = useTranslation('account');
  
  // Use translations for default tabs if not provided
  const defaultTabs = [
    { id: 'account' as TabType, title: t('tabs.account') },
    { id: 'loan' as TabType, title: t('tabs.loan') }
  ];
  
  const tabsToRender = tabs || defaultTabs;
  const tabWidth = width / 1.49; 
  
  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {/* First Tab */}
        <Pressable
          style={[
            styles.tab,
            activeTab === tabsToRender[0].id && styles.activeTab
          ]}
          onPress={() => onTabChange(tabsToRender[0].id)}
        >
          <TabShape
            width={tabWidth}
            height={activeTab === tabsToRender[0].id ? 80 : 70}
            isActive={activeTab === tabsToRender[0].id}
            flipHorizontal={false}
            text={tabsToRender[0].title}
          />
        </Pressable>

        {/* Second Tab */}
        <Pressable
          style={[
            styles.tab,
            styles.rightTab,
            activeTab === tabsToRender[1].id && styles.activeTab
          ]}
          onPress={() => onTabChange(tabsToRender[1].id)}
        >
          <TabShape
            width={tabWidth}
            height={activeTab === tabsToRender[1].id ? 80 : 70}
            isActive={activeTab === tabsToRender[1].id}
            flipHorizontal={true}
            text={tabsToRender[1].title}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    bottom: -30,
  },
  tabContainer: {
    flexDirection: 'row',
    height: 70,
  },
  tab: {
    width: width / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  activeTab: {
    zIndex: 10, // Active tab appears on top
  },
  rightTab: {
    right: width / 6
  },
});

export default TabSelector;
