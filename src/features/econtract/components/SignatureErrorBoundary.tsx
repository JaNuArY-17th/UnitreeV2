import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../styles';

interface Props {
  children: ReactNode;
  onFallback?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SignatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('SignatureErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SignatureErrorBoundary componentDidCatch:', error, errorInfo);
    
    // Notify parent about fallback if provided
    if (this.props.onFallback) {
      this.props.onFallback();
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.signature, { backgroundColor: '#FFF3CD', alignItems: 'center', justifyContent: 'center', padding: 20 }]}>
          <Text style={{ color: '#856404', fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>
            Chữ ký tạm thời không khả dụng
          </Text>
          <Text style={{ color: '#856404', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
            Vui lòng thử lại hoặc tiếp tục với chữ ký mặc định
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#007BFF',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
            }}
            onPress={this.handleRetry}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}