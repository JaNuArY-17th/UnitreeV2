import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/shared/themes';
import { styles } from '../styles';
import { JobStatus } from '../types';

interface LoadingStateProps {
  currentStatus: JobStatus;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ currentStatus }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>
        {currentStatus === 'pending'
          ? t('econtract.processingContract', 'Đang xử lý hợp đồng...')
          : t('econtract.loading', 'Đang tải...')}
      </Text>
    </View>
  );
};
