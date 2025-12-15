import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from '@/shared/hooks/useTranslation';

const Stack = createNativeStackNavigator();

// Placeholder screens
function HomeScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text>{t('common:loading')}</Text>
      <Text style={styles.text}>Home Screen - Create your feature here</Text>
    </View>
  );
}

function ProfileScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text>{t('common:loading')}</Text>
      <Text style={styles.text}>Profile Screen - Create your feature here</Text>
    </View>
  );
}

export function BottomTabNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
