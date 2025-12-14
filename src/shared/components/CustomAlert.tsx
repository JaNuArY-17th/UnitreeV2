import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { colors, spacing, shadows, typography } from '@/shared/themes';
import { Heading, Body, Button } from '@/shared/components/base';

const { width: screenWidth } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  buttonColor?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
  buttonColor,
}) => {
  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleBackdropPress = () => {
    // Only dismiss if there's a cancel button or single OK button
    const hasCancelButton = buttons.some(btn => btn.style === 'cancel');
    const isSingleButton = buttons.length === 1;

    if (hasCancelButton || isSingleButton) {
      if (onDismiss) {
        onDismiss();
      }
    }
  };

  const getButtonVariant = (style?: string) => {
    switch (style) {
      case 'destructive':
        return 'danger';
      case 'cancel':
        return 'outline';
      default:
        return 'primary';
    }
  };

  const renderButtons = () => {
    if (buttons.length === 1) {
      const button = buttons[0];
      return (
        <Button
          label={button.text}
          onPress={() => handleButtonPress(button)}
          variant={getButtonVariant(button.style)}
          style={[styles.singleButton, buttonColor && { backgroundColor: buttonColor }]}
        />
      );
    }

    if (buttons.length === 2) {
      return (
        <View style={styles.buttonRow}>
          {buttons.map((button, index) => (
            <Button
              key={index}
              label={button.text}
              onPress={() => handleButtonPress(button)}
              variant={getButtonVariant(button.style)}
              style={[
                styles.dualButton,
                index === 0 && styles.leftButton,
                index === 1 && styles.rightButton,
                buttonColor && { backgroundColor: buttonColor },
              ]}
            />
          ))}
        </View>
      );
    }

    // Multiple buttons (vertical layout)
    return (
      <View style={styles.buttonColumn}>
        {buttons.map((button, index) => (
          <Button
            key={index}
            label={button.text}
            onPress={() => handleButtonPress(button)}
            variant={getButtonVariant(button.style)}
            style={[
              styles.multiButton,
              index < buttons.length - 1 && styles.buttonSpacing,
              buttonColor && { backgroundColor: buttonColor },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <View style={styles.container}>
          <Pressable style={styles.alertBox} onPress={() => { }}>
            {title && (
              <Heading level={3} style={styles.title}>
                {title}
              </Heading>
            )}

            {message && (
              <Body style={styles.message}>
                {message}
              </Body>
            )}

            <View style={styles.buttonContainer}>
              {renderButtons()}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: screenWidth - spacing.xl * 2,
    maxWidth: 320,
  },
  alertBox: {
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: spacing.xl,
    ...shadows.lg,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
  singleButton: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dualButton: {
    flex: 1,
  },
  leftButton: {
    marginRight: spacing.sm / 2,
  },
  rightButton: {
    marginLeft: spacing.sm / 2,
  },
  buttonColumn: {
    gap: spacing.sm,
  },
  multiButton: {
    width: '100%',
  },
  buttonSpacing: {
    marginBottom: spacing.sm,
  },
});

export default CustomAlert;
