import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { useTranslation } from 'react-i18next';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon, Notification02Icon } from '@hugeicons/core-free-icons';
import { FONT_WEIGHTS } from '@/shared/themes/fonts';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { ID } from '../assets';

export type UserStatus = 'NOT_VERIFIED' | 'CARD_VERIFIED' | 'VERIFIED';

type Props = {
  status: UserStatus;
  onPrimaryAction?: () => void;
  onDismiss?: () => void;
  style?: any;
};

const VerificationBanner: React.FC<Props> = ({ status, onPrimaryAction, onDismiss, style }) => {
  const { t } = useTranslation('common');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (status === 'VERIFIED') return null;

  const isNotVerified = status === 'NOT_VERIFIED';

  const title = isNotVerified
    ? t('verification.notVerified.title')
    : t('verification.cardVerified.title');

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

  const handlePress = useCallback(() => {
    if (onPrimaryAction) return onPrimaryAction();
    if (status === 'NOT_VERIFIED') {
      navigation.navigate('Ekyc');
    } else if (status === 'CARD_VERIFIED') {
      navigation.navigate('EcontractSigning');
    }
  }, [status, onPrimaryAction, navigation]);

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
            <ID width={28} height={28} color={colors.light} />
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
    // backgroundColor: 'rgba(255, 193, 7, 0.12)',
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
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
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  pulseDot: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor: 'rgba(255, 193, 7, 0.6)',
    backgroundColor: colors.light,
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.warning,
  },
});

export default VerificationBanner;
