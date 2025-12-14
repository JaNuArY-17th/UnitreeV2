import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
// @ts-ignore - Bỏ qua lỗi typecheck cho react-native-signature-capture
import SignatureCapture from 'react-native-signature-capture';
import { styles } from '../styles';
import { SignatureResult } from '../types';

interface SignatureModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (result: SignatureResult) => void;
  onReset: () => void;
  signatureRef: React.RefObject<any>;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isVisible,
  onClose,
  onSave,
  onReset,
  signatureRef,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {t('econtract.signature', 'Chữ ký của bạn')}
          </Text>

          <View style={styles.signatureContainer}>
            <SignatureCapture
              ref={signatureRef}
              style={styles.signature}
              showNativeButtons={false}
              showTitleLabel={false}
              viewMode={'portrait'}
              onSaveEvent={onSave}
            />
          </View>

          <View style={styles.signatureActions}>
            <TouchableOpacity style={styles.resetButton} onPress={onReset}>
              <Text style={styles.resetButtonText}>
                {t('common.reset', 'Xóa')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                if (signatureRef.current) {
                  signatureRef.current.saveImage();
                }
              }}
            >
              <Text style={styles.saveButtonText}>
                {t('common.confirm', 'Xác nhận')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>
              {t('common.cancel', 'Hủy')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};