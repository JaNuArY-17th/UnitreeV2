import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/shared/themes';

export function PointScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Point Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light,
  },
  title: {
    fontSize: 18,
    color: colors.text.primary,
  },
});
