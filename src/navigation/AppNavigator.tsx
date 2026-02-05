import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '../components/atoms/Icon';
import { theme } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import WeatherScreen from '../screens/WeatherScreen';
import ChatScreen from '../screens/ChatScreen';
import TelemetryScreen from '../screens/TelemetryScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            height: 60,
            borderTopWidth: 1,
            elevation: 0,
            paddingBottom: 5,
            paddingTop: 5,
          },
          tabBarItemStyle: {
            height: 50,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
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
  );
}
