import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ArrowBack } from '@/shared/assets/icons';
import { colors, spacing } from '@/shared/themes';

interface QRHeaderOverlayProps {
  onBackPress: () => void;
  onTorchToggle: () => void;
  isTorchOn: boolean;
}

const QRHeaderOverlay: React.FC<QRHeaderOverlayProps> = ({
  onBackPress,
  onTorchToggle,
  isTorchOn,
}) => {
  return (
    <View style={styles.headerOverlay}>
      <TouchableOpacity onPress={onBackPress} style={styles.headerButton}>
        <ArrowBack width={20} height={20} color={colors.light} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onTorchToggle}
        style={[styles.headerButton, isTorchOn && styles.headerButtonActive]}
      >
        <View style={styles.flashIcon}>
          {/* Simple flash icon */}
          <View style={[styles.flashShape, { backgroundColor: isTorchOn ? colors.primary : colors.light }]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: spacing.lg,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  headerButton: {
    padding: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonActive: {
    backgroundColor: colors.light,
  },
  flashIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashShape: {
    width: 16,
    height: 16,
    borderRadius: 2,
  },
});

export default QRHeaderOverlay;