import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import { SpotsProvider } from './src/context/SpotsContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SpotsProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </SpotsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
