import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from '@/shared/assets/icons';
import { theme } from '@/shared/themes';
import { styles } from '../styles';

interface HeaderComponentProps {
  isSignedPdfVisible: boolean;
  onGoBack: () => void;
}

export const HeaderComponent: React.FC<HeaderComponentProps> = ({
  isSignedPdfVisible,
  onGoBack,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor='transparent'
      />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={onGoBack} 
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack', 'Quay lại')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft width={20} height={20} color={theme.colors.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text 
            style={styles.headerTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {isSignedPdfVisible
              ? t('econtract.signedContract', 'Hợp đồng đã ký')
              : t('econtract.title', 'Ký hợp đồng')
            }
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>
    </>
  );
};
