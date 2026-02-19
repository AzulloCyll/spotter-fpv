import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useWindowDimensions } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { Icon } from '../components/atoms/Icon';
import { useTheme } from '../theme/ThemeContext';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import WeatherScreen from '../screens/WeatherScreen';
import ChatScreen from '../screens/ChatScreen';
import TelemetryScreen from '../screens/TelemetryScreen';

import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  const { theme, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTabletLandscape = windowWidth > windowHeight && windowWidth > 800;

  useEffect(() => {
    const setupSystemUI = async () => {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
      } catch (e) {
        // Ignore errors
      }
    };

    setupSystemUI();

    // Re-enforce periodically if needed (handles some system UI popups)
    const interval = setInterval(setupSystemUI, 5000);
    return () => clearInterval(interval);
  }, [isDark]);

  const hiddenTabBarStyle = { display: 'none' as const };

  const baseTabBarStyle = {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    height: 70,
    borderTopWidth: 0,
    elevation: 0,
    paddingBottom: 15,
    paddingTop: 10,
  };

  const getTabBarStyle = (customStyle = {}) => {
    if (isTabletLandscape) return hiddenTabBarStyle;
    return { ...baseTabBarStyle, ...customStyle };
  };

  return (
    <>
      <StatusBar hidden />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarStyle: getTabBarStyle(),
            tabBarItemStyle: {
              height: 50,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '700',
            },
            tabBarActiveTintColor: isDark ? theme.colors.white : theme.colors.primary,
            tabBarInactiveTintColor: isDark
              ? theme.colors.white + '40'
              : theme.colors.textSecondary,
          }}
        >
          <Tab.Screen
            name="Start"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Icon name="House" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Mapa"
            component={MapScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Icon name="Map" color={color} size={size} />,
              tabBarStyle: getTabBarStyle({
                backgroundColor: isDark ? theme.colors.surface + 'D9' : theme.colors.white + 'D9',
                borderTopColor: isDark ? theme.colors.white + '1A' : theme.colors.black + '0D',
                borderTopWidth: 1,
              }),
            }}
          />
          <Tab.Screen
            name="Pogoda"
            component={WeatherScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Icon name="CloudSun" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Czat"
            component={ChatScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="MessageCircle" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Telemetria"
            component={TelemetryScreen}
            options={{
              tabBarItemStyle: { display: 'none' },
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
