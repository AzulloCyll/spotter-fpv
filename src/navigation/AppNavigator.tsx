import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as NavigationBar from 'expo-navigation-bar';
import { Icon } from '../components/atoms/Icon';
import { useTheme } from '../theme/ThemeContext';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import WeatherScreen from '../screens/WeatherScreen';
import ChatScreen from '../screens/ChatScreen';
import TelemetryScreen from '../screens/TelemetryScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    // Ukrywa dolny pasek nawigacji systemowej (Android)
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
  }, []);

  return (
    <>
      <StatusBar hidden />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarStyle: {
              position: 'absolute',
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
            },
            tabBarItemStyle: {
              height: 50,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '700',
            },
            tabBarActiveTintColor: isDark ? '#FFFFFF' : theme.colors.primary,
            tabBarInactiveTintColor: isDark ? '#FFFFFF40' : theme.colors.textSecondary,
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
              tabBarIcon: ({ color, size }) => <Icon name="MessageCircle" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Telemetria"
            component={TelemetryScreen}
            options={{
              tabBarItemStyle: { display: 'none' }, // Completely remove from layout
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
