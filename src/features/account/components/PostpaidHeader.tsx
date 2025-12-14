import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';

interface PostpaidHeaderProps {
  onBackPress: () => void;
}

const PostpaidHeader: React.FC<PostpaidHeaderProps> = ({ onBackPress }) => {
  const { t } = useTranslation('account');
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top, height: 180 + insets.top }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScreenHeader
        title={t('postpaid.title')}
        titleStyle={{ color: colors.light }}
        backIconColor={colors.light}
        showBack={true}
        onBackPress={onBackPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
});

export default PostpaidHeader;
