import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TicketCard, Text, Heading } from '@/shared/components/base';
import { colors } from '@/shared/themes';

/**
 * Example usage of TicketCard component
 * This is just a demo - you can place any content inside the TicketCard
 */
const TicketCardExample: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Basic ticket card */}
      <TicketCard style={styles.ticketSpacing}>
        <Heading level={2} style={{ color: colors.text.primary }}>
          QR Payment
        </Heading>
        <Text color={colors.text.secondary} style={styles.subtitle}>
          Hold your QR code over the scanner to pay
        </Text>
      </TicketCard>

      {/* Ticket card with custom background color */}
      <TicketCard
        backgroundColor={colors.primaryLight}
        style={styles.ticketSpacing}
        perforationColor={colors.border}
      >
        <Text color={colors.primary}>Custom Background Ticket</Text>
      </TicketCard>

      {/* Ticket card without shadow */}
      <TicketCard
        showShadow={false}
        backgroundColor={colors.secondary}
        style={styles.ticketSpacing}
      >
        <Text>Ticket without shadow</Text>
      </TicketCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background,
  },
  ticketSpacing: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 8,
  },
});

export default TicketCardExample;
