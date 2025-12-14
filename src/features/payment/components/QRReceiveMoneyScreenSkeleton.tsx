import React from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import { BackgroundPatternSolid } from '@/shared/components/base';
import { QRCardSkeleton } from './QRCardSkeleton';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';

export const QRReceiveMoneyScreenSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();

  useStatusBarEffect('transparent', 'light-content', true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor='transparent' />
      
      {/* Background Pattern */}
      <BackgroundPatternSolid
        backgroundColor={colors.primary}
        patternColor={colors.light}
      />
      
      {/* Header */}
      <ScreenHeader
        title="Nhận tiền"
        centerTitle
        backIconColor={colors.light}
        titleStyle={{ color: colors.light }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* QR Card Skeleton */}
        <QRCardSkeleton />
        
        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
