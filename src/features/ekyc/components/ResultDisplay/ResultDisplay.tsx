import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/shared/themes';
import type { ResultDisplayProps, ParsedEkycResult } from '../../types/ekyc';

/**
 * ResultDisplay Component
 * Displays eKYC results with extracted information
 * Allows user to confirm or retake
 */
export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  results,
  onConfirm,
  onRetake,
  isLoading = false,
}) => {
  const ocrData = results.ocrData;

  if (!ocrData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Không thể đọc thông tin</Text>
          <Text style={styles.errorMessage}>
            Không thể đọc thông tin từ giấy tờ. Vui lòng thử lại.
          </Text>
          <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
            <Text style={styles.retakeButtonText}>Chụp lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.title}>Xác minh thành công</Text>
          <Text style={styles.subtitle}>
            Thông tin đã được trích xuất từ giấy tờ của bạn
          </Text>
        </View>

        {/* Information Display */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          
          <InfoRow label="Số CCCD/CMND" value={ocrData.id} />
          <InfoRow label="Họ và tên" value={ocrData.name} />
          <InfoRow label="Ngày sinh" value={ocrData.dob} />
          <InfoRow label="Giới tính" value={ocrData.sex} />
          <InfoRow label="Quốc tịch" value={ocrData.nationality} />
          <InfoRow label="Quê quán" value={ocrData.home} />
          <InfoRow label="Nơi thường trú" value={ocrData.address} />
          <InfoRow label="Có giá trị đến" value={ocrData.doe} />
        </View>

        {/* Verification Status */}
        <VerificationStatus results={results} />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.retakeButton]}
            onPress={onRetake}
            disabled={isLoading}
          >
            <Text style={styles.retakeButtonText}>Chụp lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

/**
 * InfoRow Component
 * Displays a label-value pair
 */
interface InfoRowProps {
  label: string;
  value?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Không có thông tin'}</Text>
    </View>
  );
};

/**
 * VerificationStatus Component
 * Shows verification status and confidence scores
 */
interface VerificationStatusProps {
  results: ParsedEkycResult;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ results }) => {
  const faceMatch = results.compareResult?.object;
  const liveness = results.faceLiveness?.object;

  return (
    <View style={styles.statusContainer}>
      <Text style={styles.sectionTitle}>Trạng thái xác minh</Text>
      
      {/* Face Match Status */}
      {faceMatch && (
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>So sánh khuôn mặt</Text>
          <View style={[
            styles.statusBadge,
            faceMatch.similarity && faceMatch.similarity >= 90 
              ? styles.successBadge 
              : styles.warningBadge
          ]}>
            <Text style={styles.statusBadgeText}>
              {faceMatch.similarity ? `${faceMatch.similarity.toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
        </View>
      )}

      {/* Liveness Status */}
      {liveness && (
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Phát hiện sống</Text>
          <View style={[
            styles.statusBadge,
            liveness.liveness === 'live' || liveness.liveness === '1'
              ? styles.successBadge 
              : styles.errorBadge
          ]}>
            <Text style={styles.statusBadgeText}>
              {liveness.liveness === 'live' || liveness.liveness === '1' ? 'Hợp lệ' : 'Không hợp lệ'}
            </Text>
          </View>
        </View>
      )}

      {/* OCR Errors */}
      {results.ocrErrors && results.ocrErrors.length > 0 && (
        <View style={styles.errorsContainer}>
          <Text style={styles.errorsTitle}>Cảnh báo:</Text>
          {results.ocrErrors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  successIconText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  successBadge: {
    backgroundColor: '#34C759',
  },
  warningBadge: {
    backgroundColor: '#FF9500',
  },
  errorBadge: {
    backgroundColor: '#FF3B30',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  errorsContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorsTitle: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retakeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  retakeButtonText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
});
