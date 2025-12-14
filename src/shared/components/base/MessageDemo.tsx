import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import Heading from './Heading';

const MessageDemo: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAutoHideError, setShowAutoHideError] = useState(false);
  const [showAutoHideSuccess, setShowAutoHideSuccess] = useState(false);

  return (
    <View style={styles.container}>
      <Heading style={styles.title}>Message Components Demo</Heading>

      <View style={styles.section}>
        <Button
          label={showError ? "Hide Error" : "Show Error"}
          variant="secondary"
          onPress={() => setShowError(!showError)}
          style={styles.button}
        />

        <ErrorMessage
          message={showError ? "This is an error message with icon and animation!" : null}
          visible={showError}
        />
      </View>

      <View style={styles.section}>
        <Button
          label={showSuccess ? "Hide Success" : "Show Success"}
          variant="primary"
          onPress={() => setShowSuccess(!showSuccess)}
          style={styles.button}
        />

        <SuccessMessage
          message={showSuccess ? "This is a success message with icon and animation!" : null}
          visible={showSuccess}
        />
      </View>

      <View style={styles.section}>
        <Button
          label="Show Auto-Hide Error (5s)"
          variant="secondary"
          onPress={() => setShowAutoHideError(true)}
          style={styles.button}
        />

        <ErrorMessage
          message={showAutoHideError ? "This error will auto-hide in 5 seconds!" : null}
          visible={showAutoHideError}
          autoHide={true}
          autoHideDelay={5000}
          onHide={() => setShowAutoHideError(false)}
        />
      </View>

      <View style={styles.section}>
        <Button
          label="Show Auto-Hide Success (3s)"
          variant="primary"
          onPress={() => setShowAutoHideSuccess(true)}
          style={styles.button}
        />

        <SuccessMessage
          message={showAutoHideSuccess ? "This success will auto-hide in 3 seconds!" : null}
          visible={showAutoHideSuccess}
          autoHide={true}
          autoHideDelay={3000}
          onHide={() => setShowAutoHideSuccess(false)}
        />
      </View>

      <View style={styles.section}>
        <ErrorMessage
          message="Error without icon"
          showIcon={false}
        />

        <SuccessMessage
          message="Success without icon"
          showIcon={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.light,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.sm,
  },
});

export default MessageDemo;
