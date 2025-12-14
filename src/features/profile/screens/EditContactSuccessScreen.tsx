import React from 'react';
import { View, StyleSheet, StatusBar, Modal } from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing } from '@/shared/themes';
import ScreenHeader from '@/shared/components/ScreenHeader';
import Button from '@/shared/components/base/Button';
import Text from '@/shared/components/base/Text';
import type { RootStackParamList } from '@/navigation/types';

// Route params: { mode: 'phone' | 'email' }
type EditContactSuccessRouteProp = RouteProp<RootStackParamList, 'EditContactSuccess'>;

const EditContactSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditContactSuccessRouteProp>();
  const { t } = useTranslation('profile');
  const insets = useSafeAreaInsets();
  const { mode } = route.params;

  const handleOk = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'UserDetail' }],
      })
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <ScreenHeader title={t('success.title')} showBack={false} />
      <View style={styles.content}>
        <Modal visible transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.title}>{t('success.title')}</Text>
              <Text style={styles.description}>
                {mode === 'phone' ? t('success.phone') : t('success.email')}
              </Text>
              <Button label={t('ok')} onPress={handleOk} style={styles.button} />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    width: 320,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  description: {
    color: colors.text.primary,
    fontSize: 16,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
    minWidth: 120,
  },
});

export default EditContactSuccessScreen;
