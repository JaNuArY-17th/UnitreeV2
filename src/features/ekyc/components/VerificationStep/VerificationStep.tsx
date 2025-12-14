import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/shared/themes';
import type { VerificationStepProps } from '../../types/ekyc';
import { EkycStep } from '../../types/ekyc';

/**
 * VerificationStep Component
 * Displays the current step in the eKYC verification process
 * Shows progress, status, and step information
 */
export const VerificationStep: React.FC<VerificationStepProps> = ({
  step,
  isActive,
  isCompleted,
  hasError,
  title,
  description,
}) => {
  const getStepIcon = () => {
    if (hasError) {
      return (
        <View style={[styles.stepIcon, styles.errorIcon]}>
          <Text style={styles.errorIconText}>✕</Text>
        </View>
      );
    }

    if (isCompleted) {
      return (
        <View style={[styles.stepIcon, styles.completedIcon]}>
          <Text style={styles.completedIconText}>✓</Text>
        </View>
      );
    }

    if (isActive) {
      return (
        <View style={[styles.stepIcon, styles.activeIcon]}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      );
    }

    return (
      <View style={[styles.stepIcon, styles.pendingIcon]}>
        <View style={styles.pendingDot} />
      </View>
    );
  };

  const getStepStatus = () => {
    if (hasError) return 'Lỗi';
    if (isCompleted) return 'Hoàn thành';
    if (isActive) return 'Đang xử lý...';
    return 'Chờ xử lý';
  };

  const getStepColor = () => {
    if (hasError) return '#FF3B30';
    if (isCompleted) return '#34C759';
    if (isActive) return colors.primary;
    return '#8E8E93';
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        {getStepIcon()}
        <View style={styles.stepInfo}>
          <Text style={[styles.stepTitle, { color: getStepColor() }]}>
            {title}
          </Text>
          <Text style={styles.stepStatus}>
            {getStepStatus()}
          </Text>
        </View>
      </View>
      
      {description && (
        <Text style={styles.stepDescription}>
          {description}
        </Text>
      )}
    </View>
  );
};

/**
 * VerificationSteps Component
 * Displays a list of verification steps with current progress
 */
interface VerificationStepsProps {
  currentStep: EkycStep;
  error?: string | null;
}

export const VerificationSteps: React.FC<VerificationStepsProps> = ({
  currentStep,
  error,
}) => {
  const steps = [
    {
      step: EkycStep.INITIALIZING,
      title: 'Khởi tạo',
      description: 'Đang khởi tạo SDK eKYC',
    },
    {
      step: EkycStep.CAPTURING,
      title: 'Chụp ảnh',
      description: 'Chụp ảnh giấy tờ và khuôn mặt',
    },
    {
      step: EkycStep.PROCESSING,
      title: 'Xử lý',
      description: 'Đang xử lý và xác thực thông tin',
    },
    {
      step: EkycStep.COMPLETED,
      title: 'Hoàn thành',
      description: 'Xác minh thành công',
    },
  ];

  const getStepIndex = (step: EkycStep) => {
    const stepOrder = [
      EkycStep.IDLE,
      EkycStep.INITIALIZING,
      EkycStep.CAPTURING,
      EkycStep.PROCESSING,
      EkycStep.COMPLETED,
    ];
    return stepOrder.indexOf(step);
  };

  const currentStepIndex = getStepIndex(currentStep);
  const hasError = currentStep === EkycStep.ERROR || !!error;

  return (
    <View style={styles.stepsContainer}>
      <Text style={styles.stepsTitle}>Tiến trình xác minh</Text>
      
      {steps.map((stepInfo, index) => {
        const stepIndex = getStepIndex(stepInfo.step);
        const isActive = stepIndex === currentStepIndex && !hasError;
        const isCompleted = stepIndex < currentStepIndex && !hasError;
        const stepHasError = hasError && stepIndex === currentStepIndex;

        return (
          <VerificationStep
            key={stepInfo.step}
            step={stepInfo.step}
            isActive={isActive}
            isCompleted={isCompleted}
            hasError={stepHasError}
            title={stepInfo.title}
            description={stepInfo.description}
          />
        );
      })}

      {hasError && error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeIcon: {
    backgroundColor: colors.primary,
  },
  completedIcon: {
    backgroundColor: '#34C759',
  },
  errorIcon: {
    backgroundColor: '#FF3B30',
  },
  pendingIcon: {
    backgroundColor: '#8E8E93',
  },
  completedIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepStatus: {
    fontSize: 14,
    color: '#8E8E93',
  },
  stepDescription: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 44,
    lineHeight: 20,
  },
  stepsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  errorTitle: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  errorMessage: {
    color: '#FF3B30',
    fontSize: 14,
    lineHeight: 20,
  },
});
