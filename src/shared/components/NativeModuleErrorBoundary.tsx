import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/shared/themes';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary specifically designed to handle native module errors
 * including Hermes getConstants null errors and react-native-pdf issues
 */
export class NativeModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a native module related error
    const isNativeModuleError = 
      error.message?.includes('getConstants') ||
      error.message?.includes('null is not an object') ||
      error.message?.includes('undefined is not an object') ||
      error.message?.includes('react-native-pdf') ||
      error.stack?.includes('NativeModule');

    if (isNativeModuleError) {
      return { hasError: true, error };
    }

    // For non-native module errors, let them bubble up
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('NativeModuleErrorBoundary caught error:', error);
    console.warn('Error info:', errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Tính năng tạm thời không khả dụng</Text>
            <Text style={styles.message}>
              Một số tính năng đang gặp sự cố kỹ thuật. Chúng tôi đang khắc phục vấn đề này.
            </Text>
            {this.state.error?.message && (
              <Text style={styles.errorDetails}>
                Chi tiết: {this.state.error.message}
              </Text>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 12,
    color: theme.colors.text.muted,
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
});