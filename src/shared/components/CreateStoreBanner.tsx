import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { useTranslation } from 'react-i18next';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { FONT_WEIGHTS } from '@/shared/themes/fonts';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { ID, Lock, Shop } from '../assets';

type Props = {
  onPrimaryAction?: () => void;
  onDismiss?: () => void;
  style?: any;
};

const CreateStoreBanner: React.FC<Props> = ({ onPrimaryAction, onDismiss, style }) => {
  const { t } = useTranslation('home');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const title = t('store.createStoreBanner.title');

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const fade = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });

  const handlePress = () => {
    if (onPrimaryAction) return onPrimaryAction();
    // Navigate to create store screen
    navigation.navigate('CreateStoreStart');
  };

  return (
    <Pressable
      style={[styles.container, style]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={t('actions.show')}
      onPress={handlePress}
    >
      <View style={styles.row}>
        <View style={styles.leading}>
          <View style={styles.iconWrap}>
            <Shop width={30} height={30} color={colors.light} />
            <Animated.View style={[styles.pulseDot, { opacity: fade, transform: [{ scale }] }]} />
          </View>
        </View>

        <Text variant="body" weight={FONT_WEIGHTS.REGULAR} style={styles.title}>
          {title}
        </Text>

        <View style={styles.trailing}>
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.light} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    // Use a light warning tone to signal urgency while staying readable
    // backgroundColor: 'rgba(34, 197, 94, 0.12)',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: {
    color: colors.light,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  trailing: { marginLeft: spacing.md },
  closeBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    padding: spacing.xs,
  },
  leading: {
    marginRight: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'rgba(11, 49, 25, 0.2)',
    backgroundColor: colors.primary,
  },
  pulseDot: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 197, 94, 0.6)',
  },
  // leftAccent: {
  //   position: 'absolute',
  //   left: 0,
  //   top: 0,
  //   bottom: 0,
  //   width: 4,
  //   backgroundColor: colors.warning,
  // },
});

export default CreateStoreBanner;
