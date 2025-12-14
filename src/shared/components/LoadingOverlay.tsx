import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Animated } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
  const fade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fade]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, { opacity: fade }]}
      pointerEvents="box-none"
      accessibilityRole="alert"
      accessibilityLabel="Loading"
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 24,
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 16,
    opacity: 0.9,
  },
});

export default LoadingOverlay;
