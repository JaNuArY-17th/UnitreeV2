import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import { theme } from '@shared/themes';

interface ExpiredModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGoHome: () => void;
}

export const ExpiredModal: React.FC<ExpiredModalProps> = ({
  isVisible,
  onClose,
  onGoHome,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={[styles.expiredIcon, { fontSize: 50, color: theme.colors.danger }]}>
            ⏰
          </Text>

          <Text style={styles.expiredTitle}>
            {t('econtract.timeExpired', 'Hết thời gian ký hợp đồng')}
          </Text>

          <Text style={styles.expiredDescription}>
            {t('econtract.timeExpiredDesc', 'Thời gian ký hợp đồng đã hết. Vui lòng liên hệ bộ phận hỗ trợ hoặc thử lại sau.')}
          </Text>

          <View style={styles.expiredActions}>
            <TouchableOpacity
              style={styles.goHomeButton}
              onPress={onGoHome}
            >
              {/* <Icon name="" size={18} color={theme.colors.light} style={styles.goHomeIcon} /> */}
              <Text style={styles.goHomeText}>
                {t('common.goHome', 'Về trang chủ')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
