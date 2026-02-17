import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Device from 'expo-device';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import { SpotsProvider } from './src/context/SpotsContext';

export default function App() {
  useEffect(() => {
    async function changeScreenOrientation() {
      const deviceType = await Device.getDeviceTypeAsync();

      if (deviceType === Device.DeviceType.PHONE) {
        // Lock phones to portrait
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } else if (deviceType === Device.DeviceType.TABLET) {
        // Lock tablets to landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
    }

    changeScreenOrientation();
  }, []);

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
