import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '@/shared/themes';
import type { EkycCaptureProps } from '../../types/ekyc';

/**
 * DocumentCapture Component
 * Handles the UI for document capture process
 * Extracted from EkycScreen for reusability
 */
export const DocumentCapture: React.FC<EkycCaptureProps> = ({
  onCapture,
  isProcessing,
  error,
  canRetry = false,
  onRetry,
}) => {
  const handleCapturePress = () => {
    if (isProcessing) return;
    
    Alert.alert(
      'Xác minh danh tính',
      'Bạn sẽ được hướng dẫn chụp ảnh giấy tờ tùy thân và khuôn mặt để xác minh danh tính.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Bắt đầu',
          onPress: () => onCapture('full'),
        },
      ]
    );
  };

  const handleRetryPress = () => {
    if (!canRetry || !onRetry) return;
    
    Alert.alert(
      'Thử lại xác minh',
      'Bạn có muốn thử lại quá trình xác minh danh tính không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Thử lại',
          onPress: onRetry,
        },
      ]
    );
  };

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.title}>Đang khởi động eKYC...</Text>
          <Text style={styles.subtitle}>
            SDK sẽ hướng dẫn bạn thực hiện các bước xác minh
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Xác minh danh tính</Text>
          <Text style={styles.subtitle}>
            Chụp ảnh giấy tờ tùy thân và khuôn mặt để xác minh danh tính
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Chuẩn bị CCCD/CMND hoặc Passport
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Chụp ảnh mặt trước và mặt sau của giấy tờ
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Chụp ảnh khuôn mặt để xác minh
            </Text>
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {canRetry && onRetry ? (
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={handleRetryPress}
              disabled={isProcessing}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleCapturePress}
              disabled={isProcessing}
            >
              <Text style={styles.startButtonText}>Bắt đầu xác minh</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Lưu ý:</Text>
          <Text style={styles.tipsText}>
            • Đảm bảo ánh sáng đủ sáng{'\n'}
            • Giữ giấy tờ phẳng và rõ nét{'\n'}
            • Không che khuất khuôn mặt
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
  },
  instructionsContainer: {
    marginBottom: 30,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#FF9500',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 15,
  },
  tipsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
});
